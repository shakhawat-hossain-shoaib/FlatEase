<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Models\TenantDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TenantDocumentController extends Controller
{
    public function checklist(Request $request)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $types = DocumentType::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->get();

        $latestByType = TenantDocument::query()
            ->with('documentType:id,type_key,label')
            ->where('tenant_user_id', $tenantId)
            ->orderByDesc('id')
            ->get()
            ->groupBy('document_type_id')
            ->map(function ($group) {
                return $group->first();
            });

        $data = $types->map(function ($type) use ($latestByType) {
            $document = $latestByType->get($type->id);

            return [
                'document_type_id' => $type->id,
                'type_key' => $type->type_key,
                'label' => $type->label,
                'is_required' => (bool) $type->is_required,
                'max_size_mb' => (int) $type->max_size_mb,
                'allowed_mimes' => $type->allowed_mimes,
                'uploaded' => $document !== null,
                'latest_document' => $document,
            ];
        });

        return response()->json($data, 200);
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $documents = TenantDocument::query()
            ->with(['documentType:id,type_key,label', 'verifiedBy:id,name,email'])
            ->where('tenant_user_id', $tenantId)
            ->orderByDesc('id')
            ->get();

        return response()->json($documents, 200);
    }

    public function adminIndexByTenant($tenantId)
    {
        $documents = TenantDocument::query()
            ->with(['documentType:id,type_key,label', 'verifiedBy:id,name,email'])
            ->where('tenant_user_id', (int) $tenantId)
            ->orderByDesc('id')
            ->get();

        return response()->json($documents, 200);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $validated = $request->validate([
            'document_type_id' => 'required|integer|exists:document_types,id',
            'file' => 'required|file|max:5120|mimes:pdf,jpg,jpeg,png,webp',
        ]);
        $type = DocumentType::findOrFail((int) $validated['document_type_id']);
        $uploadedFile = $request->file('file');

        if (!in_array($uploadedFile->getMimeType(), (array) $type->allowed_mimes, true)) {
            return response()->json(['error' => 'Invalid file type for selected document type.'], 422);
        }

        $disk = config('filesystems.default', 'local');
        $extension = $uploadedFile->getClientOriginalExtension();
        $fileName = Str::uuid()->toString() . ($extension ? ('.' . $extension) : '');
        $path = $uploadedFile->storeAs('tenant-documents/' . $tenantId . '/' . $type->type_key, $fileName, $disk);

        $document = TenantDocument::create([
            'tenant_user_id' => $tenantId,
            'document_type_id' => $type->id,
            'storage_disk' => $disk,
            'storage_path' => $path,
            'original_filename' => $uploadedFile->getClientOriginalName(),
            'mime_type' => (string) $uploadedFile->getMimeType(),
            'file_size_bytes' => (int) $uploadedFile->getSize(),
            'checksum_sha256' => hash_file('sha256', $uploadedFile->getRealPath()),
            'status' => 'uploaded',
        ]);

        return response()->json($document->load('documentType:id,type_key,label'), 201);
    }

    public function destroy(Request $request, $documentId)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $document = TenantDocument::query()
            ->where('tenant_user_id', $tenantId)
            ->where('id', (int) $documentId)
            ->firstOrFail();

        Storage::disk($document->storage_disk)->delete($document->storage_path);
        $document->delete();

        return response()->json(['success' => true, 'message' => 'Document deleted successfully.'], 200);
    }

    public function download(Request $request, $documentId)
    {
        $user = $request->user();
        $query = TenantDocument::query()->where('id', (int) $documentId);

        if ((string) $user->role !== 'admin') {
            if ((string) $user->role !== 'tenant') {
                return response()->json(['error' => 'Forbidden.'], 403);
            }

            $query->where('tenant_user_id', (int) $user->id);
        }

        $document = $query->firstOrFail();

        if (!Storage::disk($document->storage_disk)->exists($document->storage_path)) {
            return response()->json(['error' => 'Document file is missing from storage.'], 404);
        }

        $stream = Storage::disk($document->storage_disk)->readStream($document->storage_path);

        return Response::stream(function () use ($stream) {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'attachment; filename="' . $document->original_filename . '"',
        ]);
    }

    public function adminUpdateStatus(Request $request, $documentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:under_review,approved,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $document = TenantDocument::findOrFail((int) $documentId);
        $document->status = $validated['status'];
        $document->rejection_reason = $validated['status'] === 'rejected' ? ($validated['rejection_reason'] ?? null) : null;
        $document->verified_by = (int) $request->user()->id;
        $document->verified_at = now();
        $document->save();

        return response()->json($document->fresh(['documentType:id,type_key,label', 'verifiedBy:id,name,email']), 200);
    }

    private function tenantIdOrFail(Request $request): ?int
    {
        $user = $request->user();

        if ((string) $user->role !== 'tenant') {
            return null;
        }

        return (int) $user->id;
    }
}
