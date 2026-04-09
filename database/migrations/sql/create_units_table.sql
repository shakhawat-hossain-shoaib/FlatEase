CREATE TABLE IF NOT EXISTS units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  building_id BIGINT UNSIGNED NOT NULL,
  floor_id BIGINT UNSIGNED NOT NULL,
  unit_number VARCHAR(40) NOT NULL,
  bedrooms TINYINT UNSIGNED NULL,
  bathrooms TINYINT UNSIGNED NULL,
  area_sqft INT UNSIGNED NULL,
  occupancy_status ENUM('vacant', 'occupied', 'blocked') NOT NULL DEFAULT 'vacant',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY units_building_unit_unique (building_id, unit_number),
  KEY units_grid_idx (building_id, floor_id, occupancy_status),
  CONSTRAINT units_building_fk FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  CONSTRAINT units_floor_fk FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;