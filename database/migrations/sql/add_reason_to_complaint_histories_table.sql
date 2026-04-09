ALTER TABLE complaint_status_histories
  ADD COLUMN reason VARCHAR(500) NULL AFTER changed_at;

ALTER TABLE complaint_assignment_histories
  ADD COLUMN reason VARCHAR(500) NULL AFTER assigned_at;
