/*
  Warnings:

  - A unique constraint covering the columns `[orderNo,orderItemNo,transactionDate,opcus]` on the table `lazada_payment_main` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "lazada_payment_main_orderNo_orderItemNo_transactionDate_key";

-- CreateIndex
CREATE UNIQUE INDEX "lazada_payment_main_orderNo_orderItemNo_transactionDate_opc_key" ON "lazada_payment_main"("orderNo", "orderItemNo", "transactionDate", "opcus");
