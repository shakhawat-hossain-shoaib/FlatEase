-- Core SQL seeds converted from Laravel seeders.

INSERT INTO users (name, email, password, role, account_status, email_verified_at, created_at, updated_at)
VALUES
  ('FlatEase Admin', 'admin@flatease.local', '$2y$10$kLGXkcBqtrgnp0S.uxRTd.Yo3V5TxUbh4GlEJJmt3rQVQKhgOYX26', 'admin', 'active', NOW(), NOW(), NOW()),
  ('FlatEase Tenant', 'tenant@flatease.local', '$2y$10$6RXhOWLmWkyp40X0L7kHC.fjFh.OZftuFSVB.4vA5eod8KdYF9lzC', 'tenant', 'active', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  account_status = VALUES(account_status),
  email_verified_at = VALUES(email_verified_at),
  updated_at = VALUES(updated_at);

INSERT INTO tenant_profiles (user_id, created_at, updated_at)
SELECT u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'tenant@flatease.local'
ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at);

INSERT INTO users (name, email, password, role, account_status, email_verified_at, created_at, updated_at)
VALUES
  ('Rafiq Electric', 'tech.electrical@flatease.local', '$2y$10$74bjYYzuBBFmfzS7LvtU8.fgLdVaz7Do/IyspIyeMTiDd6dGRU0ee', 'technician', 'active', NOW(), NOW(), NOW()),
  ('Mita Plumbing', 'tech.plumbing@flatease.local', '$2y$10$74bjYYzuBBFmfzS7LvtU8.fgLdVaz7Do/IyspIyeMTiDd6dGRU0ee', 'technician', 'active', NOW(), NOW(), NOW()),
  ('Kamal Maintenance', 'tech.maintenance@flatease.local', '$2y$10$74bjYYzuBBFmfzS7LvtU8.fgLdVaz7Do/IyspIyeMTiDd6dGRU0ee', 'technician', 'active', NOW(), NOW(), NOW()),
  ('Nadia HVAC', 'tech.hvac@flatease.local', '$2y$10$74bjYYzuBBFmfzS7LvtU8.fgLdVaz7Do/IyspIyeMTiDd6dGRU0ee', 'technician', 'active', NOW(), NOW(), NOW()),
  ('Sohel Carpentry', 'tech.carpentry@flatease.local', '$2y$10$74bjYYzuBBFmfzS7LvtU8.fgLdVaz7Do/IyspIyeMTiDd6dGRU0ee', 'technician', 'active', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  account_status = VALUES(account_status),
  email_verified_at = VALUES(email_verified_at),
  updated_at = VALUES(updated_at);

INSERT INTO technicians (user_id, name, phone, email, specialization, active, created_at, updated_at)
VALUES
  ((SELECT id FROM users WHERE email = 'tech.electrical@flatease.local'), 'Rafiq Electric', '+8801700001001', 'tech.electrical@flatease.local', 'electrical', 1, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'tech.plumbing@flatease.local'), 'Mita Plumbing', '+8801700001002', 'tech.plumbing@flatease.local', 'plumbing', 1, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'tech.maintenance@flatease.local'), 'Kamal Maintenance', '+8801700001003', 'tech.maintenance@flatease.local', 'maintenance', 1, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'tech.hvac@flatease.local'), 'Nadia HVAC', '+8801700001004', 'tech.hvac@flatease.local', 'hvac', 1, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'tech.carpentry@flatease.local'), 'Sohel Carpentry', '+8801700001005', 'tech.carpentry@flatease.local', 'carpentry', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  name = VALUES(name),
  phone = VALUES(phone),
  specialization = VALUES(specialization),
  active = VALUES(active),
  updated_at = VALUES(updated_at);

INSERT INTO document_types (type_key, label, allowed_mimes, max_size_mb, is_sensitive, admin_only_access, is_required, is_active, created_at, updated_at)
VALUES
  ('nid', 'National ID (NID)', JSON_ARRAY('application/pdf', 'image/jpeg', 'image/png'), 5, 1, 1, 1, 1, NOW(), NOW()),
  ('personal_photo', 'Personal Photo', JSON_ARRAY('image/jpeg', 'image/png', 'image/webp'), 3, 0, 0, 1, 1, NOW(), NOW()),
  ('job_id_card', 'Job ID Card', JSON_ARRAY('application/pdf', 'image/jpeg', 'image/png'), 5, 0, 0, 1, 1, NOW(), NOW()),
  ('lease_agreement', 'Lease Agreement', JSON_ARRAY('application/pdf', 'image/jpeg', 'image/png'), 8, 1, 1, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  allowed_mimes = VALUES(allowed_mimes),
  max_size_mb = VALUES(max_size_mb),
  is_sensitive = VALUES(is_sensitive),
  admin_only_access = VALUES(admin_only_access),
  is_required = VALUES(is_required),
  is_active = VALUES(is_active),
  updated_at = VALUES(updated_at);

INSERT INTO buildings (name, code, address_line, city, state, postal_code, country, total_floors, is_active, created_at, updated_at)
VALUES ('Mayder Doa Vila', 'MDV', 'Road 10, Block C', 'Dhaka', 'Dhaka', '1207', 'Bangladesh', 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  code = VALUES(code),
  address_line = VALUES(address_line),
  city = VALUES(city),
  state = VALUES(state),
  postal_code = VALUES(postal_code),
  country = VALUES(country),
  total_floors = VALUES(total_floors),
  is_active = VALUES(is_active),
  updated_at = VALUES(updated_at);

INSERT INTO floors (building_id, floor_number, floor_label, sort_order, created_at, updated_at)
VALUES
  ((SELECT id FROM buildings WHERE code = 'MDV'), 0, 'Ground Floor', 0, NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), 1, '1st Floor', 1, NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), 2, '2nd Floor', 2, NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), 3, '3rd Floor', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  floor_label = VALUES(floor_label),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO units (building_id, floor_id, unit_number, bedrooms, bathrooms, area_sqft, occupancy_status, created_at, updated_at)
VALUES
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 0), 'A-001', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 0), 'B-002', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 0), 'C-003', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 0), 'D-004', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 1), 'A-101', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 1), 'B-102', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 1), 'C-103', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 1), 'D-104', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 2), 'A-201', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 2), 'B-202', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 2), 'C-203', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 2), 'D-204', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 3), 'A-301', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 3), 'B-302', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 3), 'C-303', 2, 2, 1100, 'vacant', NOW(), NOW()),
  ((SELECT id FROM buildings WHERE code = 'MDV'), (SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE code = 'MDV') AND floor_number = 3), 'D-304', 2, 2, 1100, 'vacant', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  floor_id = VALUES(floor_id),
  bedrooms = VALUES(bedrooms),
  bathrooms = VALUES(bathrooms),
  area_sqft = VALUES(area_sqft),
  occupancy_status = VALUES(occupancy_status),
  updated_at = VALUES(updated_at);
