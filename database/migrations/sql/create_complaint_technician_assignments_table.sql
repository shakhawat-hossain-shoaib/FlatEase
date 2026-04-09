CREATE TABLE IF NOT EXISTS complaint_technician_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  complaint_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  assigned_by_admin_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL,
  assignment_note VARCHAR(500) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY cta_complaint_technician_unique (complaint_id, technician_id),
  KEY cta_technician_assigned_idx (technician_id, assigned_at),
  KEY cta_complaint_assigned_idx (complaint_id, assigned_at),
  CONSTRAINT cta_complaint_fk FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT cta_technician_fk FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  CONSTRAINT cta_admin_fk FOREIGN KEY (assigned_by_admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;