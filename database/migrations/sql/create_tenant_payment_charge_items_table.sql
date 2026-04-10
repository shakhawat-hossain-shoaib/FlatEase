CREATE TABLE IF NOT EXISTS tenant_payment_charge_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_payment_id BIGINT UNSIGNED NOT NULL,
  charge_type_id BIGINT UNSIGNED NOT NULL,
  building_charge_config_id BIGINT UNSIGNED NULL,
  label_snapshot VARCHAR(120) NOT NULL,
  category_snapshot ENUM('utility', 'service') NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY tenant_payment_charge_items_payment_type_unique (tenant_payment_id, charge_type_id),
  KEY tenant_payment_charge_items_payment_category_idx (tenant_payment_id, category_snapshot),
  CONSTRAINT tenant_payment_charge_items_payment_fk FOREIGN KEY (tenant_payment_id) REFERENCES tenant_payments(id) ON DELETE CASCADE,
  CONSTRAINT tenant_payment_charge_items_charge_type_fk FOREIGN KEY (charge_type_id) REFERENCES bill_charge_types(id) ON DELETE RESTRICT,
  CONSTRAINT tenant_payment_charge_items_config_fk FOREIGN KEY (building_charge_config_id) REFERENCES building_charge_configs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
