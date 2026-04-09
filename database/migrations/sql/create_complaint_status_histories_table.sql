CREATE TABLE IF NOT EXISTS complaint_status_histories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  complaint_id BIGINT UNSIGNED NOT NULL,
  old_status ENUM('pending', 'in_progress', 'resolved') NULL,
  new_status ENUM('pending', 'in_progress', 'resolved') NOT NULL,
  changed_by_id BIGINT UNSIGNED NOT NULL,
  changed_at TIMESTAMP NOT NULL,
  KEY complaint_status_histories_complaint_id_changed_at_index (complaint_id, changed_at),
  KEY complaint_status_histories_complaint_id_index (complaint_id),
  CONSTRAINT complaint_status_histories_complaint_id_foreign FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT complaint_status_histories_changed_by_id_foreign FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
