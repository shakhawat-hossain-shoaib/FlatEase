<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class EncryptedDocumentStorage
{
    private string $cipher = 'aes-256-gcm';

    public function storeEncryptedFile(UploadedFile $file, string $disk, string $path): array
    {
        $plaintext = file_get_contents($file->getRealPath());
        if ($plaintext === false) {
            throw new RuntimeException('Unable to read uploaded file for encryption.');
        }

        $key = $this->resolveEncryptionKey();
        $iv = random_bytes(12);
        $tag = '';

        $ciphertext = openssl_encrypt($plaintext, $this->cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
        if ($ciphertext === false) {
            throw new RuntimeException('File encryption failed.');
        }

        Storage::disk($disk)->put($path, $ciphertext);

        return [
            'is_encrypted' => true,
            'encryption_algorithm' => $this->cipher,
            'encryption_key_version' => 'v1',
            'encryption_iv' => base64_encode($iv),
            'encryption_tag' => base64_encode($tag),
            'checksum_sha256' => hash('sha256', $plaintext),
            'mime_type' => (string) $file->getMimeType(),
            'file_size_bytes' => (int) $file->getSize(),
            'original_filename' => $file->getClientOriginalName(),
        ];
    }

    public function decryptFromStorage(
        string $disk,
        string $path,
        ?string $algorithm,
        ?string $ivBase64,
        ?string $tagBase64,
        bool $isEncrypted
    ): string {
        $payload = Storage::disk($disk)->get($path);

        if (!$isEncrypted) {
            return $payload;
        }

        $algorithm = $algorithm ?: $this->cipher;
        $iv = $ivBase64 ? base64_decode($ivBase64, true) : false;
        $tag = $tagBase64 ? base64_decode($tagBase64, true) : false;

        if ($iv === false || $tag === false) {
            throw new RuntimeException('Invalid encryption metadata for document.');
        }

        $key = $this->resolveEncryptionKey();

        $plaintext = openssl_decrypt($payload, $algorithm, $key, OPENSSL_RAW_DATA, $iv, $tag);
        if ($plaintext === false) {
            throw new RuntimeException('Document decryption failed.');
        }

        return $plaintext;
    }

    private function resolveEncryptionKey(): string
    {
        $raw = env('DOCUMENT_ENCRYPTION_KEY');

        if (is_string($raw) && $raw !== '') {
            if (strpos($raw, 'base64:') === 0) {
                $decoded = base64_decode(substr($raw, 7), true);
                if ($decoded !== false && $decoded !== '') {
                    return substr(hash('sha256', $decoded, true), 0, 32);
                }
            }

            return substr(hash('sha256', $raw, true), 0, 32);
        }

        $appKey = (string) config('app.key', '');
        if (strpos($appKey, 'base64:') === 0) {
            $decoded = base64_decode(substr($appKey, 7), true);
            if ($decoded !== false && $decoded !== '') {
                return substr(hash('sha256', $decoded, true), 0, 32);
            }
        }

        return substr(hash('sha256', $appKey, true), 0, 32);
    }
}
