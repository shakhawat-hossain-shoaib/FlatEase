CREATE TABLE IF NOT EXISTS `partial_payments` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `tenant_payment_id` bigint(20) UNSIGNED NOT NULL,
  `tenant_user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `transaction_ref` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8_unicode_ci DEFAULT 'completed',
  `notes` text COLLATE utf8_unicode_ci,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`tenant_payment_id`) REFERENCES `tenant_payments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tenant_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_tenant_payment (tenant_payment_id),
  INDEX idx_tenant_user (tenant_user_id),
  INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
