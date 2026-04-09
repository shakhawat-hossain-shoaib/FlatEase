ALTER TABLE users
  ADD COLUMN phone VARCHAR(255) NULL AFTER email,
  ADD COLUMN preferred_contact_method ENUM('email', 'sms') NOT NULL DEFAULT 'email' AFTER role,
  ADD COLUMN account_status ENUM('active', 'pending_verification', 'locked') NOT NULL DEFAULT 'active' AFTER preferred_contact_method,
  ADD COLUMN otp_locked_until TIMESTAMP NULL AFTER account_status;

ALTER TABLE users
  ADD UNIQUE KEY users_phone_unique (phone);
