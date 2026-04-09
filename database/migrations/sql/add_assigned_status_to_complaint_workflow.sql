ALTER TABLE complaints
  MODIFY status ENUM('pending','assigned','in_progress','resolved') NOT NULL DEFAULT 'pending';

ALTER TABLE complaint_status_histories
  MODIFY old_status ENUM('pending','assigned','in_progress','resolved') NULL,
  MODIFY new_status ENUM('pending','assigned','in_progress','resolved') NOT NULL;
