ALTER TABLE tenant_payments
  ADD COLUMN service_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER utility_amount;
