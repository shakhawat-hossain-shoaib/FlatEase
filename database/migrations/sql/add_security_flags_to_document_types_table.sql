ALTER TABLE document_types
  ADD COLUMN is_sensitive TINYINT(1) NOT NULL DEFAULT 0 AFTER max_size_mb,
  ADD COLUMN admin_only_access TINYINT(1) NOT NULL DEFAULT 0 AFTER is_sensitive;
