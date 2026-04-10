CREATE TABLE IF NOT EXISTS bill_charge_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  building_id BIGINT UNSIGNED NULL,
  key_name VARCHAR(80) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  category ENUM('utility', 'service') NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY bill_charge_types_key_unique (key_name),
  KEY bill_charge_types_building_category_idx (building_id, category, is_active),
  CONSTRAINT bill_charge_types_building_fk FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  CONSTRAINT bill_charge_types_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT bill_charge_types_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
