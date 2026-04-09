CREATE TABLE IF NOT EXISTS unit_tenant_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT UNSIGNED NOT NULL,
  tenant_user_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  lease_start_date DATE NULL,
  lease_end_date DATE NULL,
  rent_amount DECIMAL(12,2) NULL,
  status ENUM('active', 'ended', 'terminated', 'pending_move_in') NOT NULL DEFAULT 'active',
  moved_out_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  KEY unit_tenant_assignments_unit_status_idx (unit_id, status),
  KEY unit_tenant_assignments_tenant_status_idx (tenant_user_id, status),
  CONSTRAINT unit_tenant_assignments_unit_fk FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  CONSTRAINT unit_tenant_assignments_tenant_fk FOREIGN KEY (tenant_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unit_tenant_assignments_assigned_by_fk FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;