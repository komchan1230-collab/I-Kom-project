-- AlterTable
ALTER TABLE `equipment` MODIFY `status` ENUM('AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE `rentals` ADD COLUMN `payment_slip_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(191) NULL,
    MODIFY `university` VARCHAR(191) NULL,
    MODIFY `faculty` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `equipment_id` VARCHAR(191) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `payment_slip_url` VARCHAR(191) NULL,
    `status` ENUM('PENDING_PAYMENT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_equipment_id_key`(`equipment_id`),
    INDEX `purchase_orders_user_id_idx`(`user_id`),
    INDEX `purchase_orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
