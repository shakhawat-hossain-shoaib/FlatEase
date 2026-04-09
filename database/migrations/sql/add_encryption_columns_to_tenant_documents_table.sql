ALTER TABLE tenant_documents
  ADD COLUMN is_encrypted TINYINT(1) NOT NULL DEFAULT 0 AFTER storage_path,
  ADD COLUMN encryption_algorithm VARCHAR(64) NULL AFTER is_encrypted,
  ADD COLUMN encryption_key_version VARCHAR(32) NULL AFTER encryption_algorithm,
  ADD COLUMN encryption_iv TEXT NULL AFTER encryption_key_version,
  ADD COLUMN encryption_tag TEXT NULL AFTER encryption_iv;
