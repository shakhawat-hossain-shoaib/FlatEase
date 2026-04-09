ALTER TABLE complaint_comments
  ADD COLUMN is_internal TINYINT(1) NOT NULL DEFAULT 0 AFTER comment;

CREATE INDEX cc_complaint_internal_idx ON complaint_comments (complaint_id, is_internal);
