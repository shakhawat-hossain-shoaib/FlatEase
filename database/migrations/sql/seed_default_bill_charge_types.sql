INSERT IGNORE INTO bill_charge_types (building_id, key_name, display_name, category, is_system, is_active, created_at, updated_at)
VALUES
  (NULL, 'electricity', 'Electricity Bill', 'utility', 1, 1, NOW(), NOW()),
  (NULL, 'water', 'Water Bill', 'utility', 1, 1, NOW(), NOW()),
  (NULL, 'gas', 'Gas Bill', 'utility', 1, 1, NOW(), NOW());
