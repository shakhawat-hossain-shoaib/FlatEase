CREATE TABLE IF NOT EXISTS buildings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  code VARCHAR(60) NULL,
  address_line VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  state VARCHAR(120) NULL,
  postal_code VARCHAR(40) NULL,
  country VARCHAR(120) NULL,
  total_floors SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY buildings_name_unique (name),
  UNIQUE KEY buildings_code_unique (code),
  KEY buildings_active_name_idx (is_active, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;