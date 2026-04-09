CREATE TABLE IF NOT EXISTS document_access_audits (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_document_id BIGINT UNSIGNED NULL,
  tenant_user_id BIGINT UNSIGNED NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  actor_role VARCHAR(32) NULL,
  action VARCHAR(48) NOT NULL,
  document_type_key VARCHAR(100) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  tenant_name VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY document_access_audits_document_id_idx (tenant_document_id),
  KEY document_access_audits_tenant_id_idx (tenant_user_id),
  KEY document_access_audits_actor_id_idx (actor_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;