/*
  Warnings:

  - You are about to drop the column `amount` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `checkDate` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `opcus` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `sequence` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `as400_order_check` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `batch_info` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `batch_info` table. All the data in the column will be lost.
  - You are about to alter the column `itemPriceCredit` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `paymentFee` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `commission` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `paymentFeeCorrection` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `commissionFeeCorrection` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `lostClaim` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `otherFees` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `otherIncome` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `totalAmount` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `vatAmount` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `whtAmount` on the `lazada_payment_main` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `lazada_payment_temp` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `vatAmount` on the `lazada_payment_temp` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `whtAmount` on the `lazada_payment_temp` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to drop the column `ipAddress` on the `process_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `process_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `process_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNo,orderItemNo,transactionDate]` on the table `lazada_payment_main` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `process_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "as400_order_check_orderNo_idx";

-- DropIndex
DROP INDEX "lazada_payment_main_as400Sent_idx";

-- DropIndex
DROP INDEX "lazada_payment_main_batchId_idx";

-- DropIndex
DROP INDEX "lazada_payment_main_orderNo_orderItemNo_idx";

-- DropIndex
DROP INDEX "lazada_payment_main_storeType_idx";

-- DropIndex
DROP INDEX "lazada_payment_main_transactionDate_idx";

-- DropIndex
DROP INDEX "lazada_payment_temp_batchId_idx";

-- DropIndex
DROP INDEX "lazada_payment_temp_orderNo_orderItemNo_idx";

-- DropIndex
DROP INDEX "lazada_payment_temp_transactionDate_idx";

-- DropIndex
DROP INDEX "process_logs_action_idx";

-- DropIndex
DROP INDEX "process_logs_batchId_idx";

-- DropIndex
DROP INDEX "process_logs_createdAt_idx";

-- AlterTable
ALTER TABLE "as400_order_check" DROP COLUMN "amount",
DROP COLUMN "checkDate",
DROP COLUMN "createdAt",
DROP COLUMN "opcus",
DROP COLUMN "sequence",
DROP COLUMN "source",
DROP COLUMN "updatedAt",
ADD COLUMN     "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "exists" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "batch_info" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "totalRecords" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lazada_payment_main" ALTER COLUMN "itemPriceCredit" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paymentFee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "commission" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paymentFeeCorrection" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "commissionFeeCorrection" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "lostClaim" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "otherFees" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "otherIncome" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "vatAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "whtAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "lazada_payment_temp" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "vatAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "whtAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "process_logs" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
DROP COLUMN "userName",
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "lazada_payment_main_orderNo_orderItemNo_transactionDate_key" ON "lazada_payment_main"("orderNo", "orderItemNo", "transactionDate");
