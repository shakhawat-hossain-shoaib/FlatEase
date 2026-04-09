CREATE TABLE IF NOT EXISTS complaint_assignment_histories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  complaint_id BIGINT UNSIGNED NOT NULL,
  previous_assigned_technician_id BIGINT UNSIGNED NULL,
  new_assigned_technician_id BIGINT UNSIGNED NOT NULL,
  assigned_by_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL,
  KEY cah_comp_assigned_idx (complaint_id, assigned_at),
  CONSTRAINT cah_comp_fk FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT cah_prev_fk FOREIGN KEY (previous_assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT cah_new_fk FOREIGN KEY (new_assigned_technician_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT cah_by_fk FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
