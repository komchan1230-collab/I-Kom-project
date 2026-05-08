/*
  Warnings:

  - You are about to drop the column `faculty` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `faculty`,
    DROP COLUMN `university`;
