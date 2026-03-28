<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentAccessAudit;
use App\Models\DocumentType;
use App\Models\TenantDocument;
use App\Services\EncryptedDocumentStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TenantDocumentController extends Controller
{
    private EncryptedDocumentStorage $encryptedStorage;

    public function __construct(EncryptedDocumentStorage $encryptedStorage)
    {
        $this->encryptedStorage = $encryptedStorage;
    }

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
            ->with('documentType:id,type_key,label,is_sensitive,admin_only_access')
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
                'is_sensitive' => (bool) $type->is_sensitive,
                'admin_only_access' => (bool) $type->admin_only_access,
                'uploaded' => $document !== null,
                'latest_document' => $document ? $this->transformDocument($document, 'tenant') : null,
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
            ->with(['documentType:id,type_key,label,is_sensitive,admin_only_access', 'verifiedBy:id,name,email'])
            ->where('tenant_user_id', $tenantId)
            ->orderByDesc('id')
            ->get();

        return response()->json($documents->map(fn($doc) => $this->transformDocument($doc, 'tenant')), 200);
    }

    public function adminIndexByTenant($tenantId)
    {
        $documents = TenantDocument::query()
            ->with(['documentType:id,type_key,label,is_sensitive,admin_only_access', 'verifiedBy:id,name,email'])
            ->where('tenant_user_id', (int) $tenantId)
            ->orderByDesc('id')
            ->get();

        return response()->json($documents->map(fn($doc) => $this->transformDocument($doc, 'admin')), 200);
    }

    public function adminAuditByDocument($documentId)
    {
        $audits = DocumentAccessAudit::query()
            ->where('tenant_document_id', (int) $documentId)
            ->orderByDesc('id')
            ->get();

        return response()->json($audits, 200);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $validated = $request->validate([
            'document_type_id' => 'required|integer|exists:document_types,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp',
        ]);

        $type = DocumentType::findOrFail((int) $validated['document_type_id']);
        $uploadedFile = $request->file('file');

        if (!in_array($uploadedFile->getMimeType(), (array) $type->allowed_mimes, true)) {
            return response()->json(['error' => 'Invalid file type for selected document type.'], 422);
        }

        $maxBytes = ((int) $type->max_size_mb) * 1024 * 1024;
        if ((int) $uploadedFile->getSize() > $maxBytes) {
            return response()->json(['error' => 'File size exceeds allowed limit for selected document type.'], 422);
        }

        $disk = config('filesystems.default', 'local');
        $fileName = Str::uuid()->toString() . '.bin';
        $path = 'tenant-documents/' . $tenantId . '/' . $type->type_key . '/' . $fileName;
        $encryptedMeta = $this->encryptedStorage->storeEncryptedFile($uploadedFile, $disk, $path);

        $document = TenantDocument::create([
            'tenant_user_id' => $tenantId,
            'document_type_id' => $type->id,
            'storage_disk' => $disk,
            'storage_path' => $path,
            'is_encrypted' => (bool) $encryptedMeta['is_encrypted'],
            'encryption_algorithm' => $encryptedMeta['encryption_algorithm'],
            'encryption_key_version' => $encryptedMeta['encryption_key_version'],
            'encryption_iv' => $encryptedMeta['encryption_iv'],
            'encryption_tag' => $encryptedMeta['encryption_tag'],
            'original_filename' => $encryptedMeta['original_filename'],
            'mime_type' => $encryptedMeta['mime_type'],
            'file_size_bytes' => $encryptedMeta['file_size_bytes'],
            'checksum_sha256' => $encryptedMeta['checksum_sha256'],
            'status' => 'uploaded',
        ]);

        $document->load('documentType:id,type_key,label,is_sensitive,admin_only_access');

        $this->logAudit($request, $document, 'upload');

        return response()->json($this->transformDocument($document, 'tenant'), 201);
    }

    public function destroy(Request $request, $documentId)
    {
        $tenantId = $this->tenantIdOrFail($request);
        if (!$tenantId) {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $document = TenantDocument::query()
            ->with('documentType:id,type_key,label,is_sensitive,admin_only_access')
            ->where('tenant_user_id', $tenantId)
            ->where('id', (int) $documentId)
            ->firstOrFail();

        if ((bool) optional($document->documentType)->admin_only_access) {
            return response()->json(['error' => 'Forbidden. Admin-only document cannot be deleted by tenant.'], 403);
        }

        $this->logAudit($request, $document, 'delete');

        Storage::disk($document->storage_disk)->delete($document->storage_path);
        $document->delete();

        return response()->json(['success' => true, 'message' => 'Document deleted successfully.'], 200);
    }

    public function download(Request $request, $documentId)
    {
        $user = $request->user();
        $query = TenantDocument::query()
            ->with('documentType:id,type_key,label,is_sensitive,admin_only_access')
            ->where('id', (int) $documentId);

        if ((string) $user->role !== 'admin') {
            if ((string) $user->role !== 'tenant') {
                return response()->json(['error' => 'Forbidden.'], 403);
            }

            $query->where('tenant_user_id', (int) $user->id);
        }

        $document = $query->firstOrFail();

        if ((string) $user->role !== 'admin' && (bool) optional($document->documentType)->admin_only_access) {
            $this->logAudit($request, $document, 'download_denied', [
                'reason' => 'admin_only_document',
            ]);
            return response()->json(['error' => 'Forbidden. Admin-only document.'], 403);
        }

        if (!Storage::disk($document->storage_disk)->exists($document->storage_path)) {
            return response()->json(['error' => 'Document file is missing from storage.'], 404);
        }

        try {
            $decrypted = $this->encryptedStorage->decryptFromStorage(
                $document->storage_disk,
                $document->storage_path,
                $document->encryption_algorithm,
                $document->encryption_iv,
                $document->encryption_tag,
                (bool) $document->is_encrypted
            );
        } catch (RuntimeException $exception) {
            $this->logAudit($request, $document, 'download_failed', [
                'reason' => 'decrypt_error',
            ]);
            return response()->json(['error' => 'Unable to decrypt document.'], 500);
        }

        $this->logAudit($request, $document, 'download');

        return Response::stream(function () use ($decrypted) {
            echo $decrypted;
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

        $document->load(['documentType:id,type_key,label,is_sensitive,admin_only_access', 'verifiedBy:id,name,email']);

        $this->logAudit($request, $document, 'status_update', [
            'status' => $document->status,
            'verified_by' => $document->verified_by,
        ]);

        return response()->json($this->transformDocument($document, 'admin'), 200);
    }

    private function logAudit(Request $request, TenantDocument $document, string $action, array $metadata = []): void
    {
        $actor = $request->user();

        DocumentAccessAudit::create([
            'tenant_document_id' => (int) $document->id,
            'tenant_user_id' => (int) $document->tenant_user_id,
            'actor_user_id' => $actor ? (int) $actor->id : null,
            'actor_role' => $actor ? (string) $actor->role : null,
            'action' => $action,
            'document_type_key' => optional($document->documentType)->type_key,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'tenant_name' => optional($document->tenant)->name,
            'metadata' => empty($metadata) ? null : $metadata,
        ]);
    }

    private function transformDocument(TenantDocument $document, string $viewerRole): array
    {
        $data = $document->toArray();
        $adminOnly = (bool) optional($document->documentType)->admin_only_access;
        $data['can_view'] = $viewerRole === 'admin' || !$adminOnly;

        return $data;
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
