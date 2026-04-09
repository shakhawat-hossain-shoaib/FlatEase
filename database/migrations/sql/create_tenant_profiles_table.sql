CREATE TABLE IF NOT EXISTS tenant_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  phone VARCHAR(40) NULL,
  emergency_contact_name VARCHAR(160) NULL,
  emergency_contact_phone VARCHAR(40) NULL,
  nid_number VARCHAR(80) NULL,
  job_title VARCHAR(160) NULL,
  employer VARCHAR(160) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY tenant_profiles_user_id_unique (user_id),
  CONSTRAINT tenant_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;