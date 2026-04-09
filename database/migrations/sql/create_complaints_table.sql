CREATE TABLE IF NOT EXISTS complaints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  assigned_technician_id BIGINT UNSIGNED NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  KEY complaints_tenant_id_status_index (tenant_id, status),
  KEY complaints_status_priority_index (status, priority),
  KEY complaints_assigned_technician_id_index (assigned_technician_id),
  CONSTRAINT complaints_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT complaints_assigned_technician_id_foreign FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
