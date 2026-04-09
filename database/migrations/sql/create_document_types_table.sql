CREATE TABLE IF NOT EXISTS document_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type_key VARCHAR(80) NOT NULL,
  label VARCHAR(160) NOT NULL,
  allowed_mimes JSON NOT NULL,
  max_size_mb SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY document_types_type_key_unique (type_key),
  KEY document_types_active_required_idx (is_active, is_required)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;