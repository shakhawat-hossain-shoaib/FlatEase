ALTER TABLE complaints
  ADD COLUMN assigned_by_id BIGINT UNSIGNED NULL AFTER assigned_technician_id,
  ADD COLUMN assigned_at TIMESTAMP NULL AFTER assigned_by_id,
  ADD COLUMN sla_due_at TIMESTAMP NULL AFTER assigned_at,
  ADD CONSTRAINT complaints_assigned_by_id_foreign FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX complaints_assign_time_idx ON complaints (assigned_technician_id, assigned_at);
CREATE INDEX complaints_status_sla_idx ON complaints (status, sla_due_at);
