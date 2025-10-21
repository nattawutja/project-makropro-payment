-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_info" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "storeType" TEXT,
    "opcus" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazada_payment_temp" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "orderNo" TEXT NOT NULL,
    "orderItemNo" TEXT,
    "feeNameType" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "details" TEXT,
    "sellerSku" TEXT,
    "vatAmount" DECIMAL(12,2),
    "whtAmount" DECIMAL(12,2),
    "transactionNumber" TEXT,
    "reference" TEXT,
    "comment" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lazada_payment_temp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazada_payment_main" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "orderNo" TEXT NOT NULL,
    "orderItemNo" TEXT,
    "itemPriceCredit" DECIMAL(12,2),
    "paymentFee" DECIMAL(12,2),
    "commission" DECIMAL(12,2),
    "paymentFeeCorrection" DECIMAL(12,2),
    "commissionFeeCorrection" DECIMAL(12,2),
    "lostClaim" DECIMAL(12,2),
    "otherFees" DECIMAL(12,2),
    "otherIncome" DECIMAL(12,2),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "details" TEXT,
    "sellerSku" TEXT,
    "vatAmount" DECIMAL(12,2),
    "whtAmount" DECIMAL(12,2),
    "storeType" TEXT NOT NULL,
    "opcus" TEXT NOT NULL,
    "as400Sent" BOOLEAN NOT NULL DEFAULT false,
    "as400SentAt" TIMESTAMP(3),
    "as400Reference" TEXT,
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lazada_payment_main_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "as400_order_check" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "orderItemNo" TEXT,
    "sequence" TEXT,
    "opcus" TEXT,
    "amount" DECIMAL(12,2),
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'AS400',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "as400_order_check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_logs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "userName" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "batch_info_batchId_key" ON "batch_info"("batchId");

-- CreateIndex
CREATE INDEX "lazada_payment_temp_batchId_idx" ON "lazada_payment_temp"("batchId");

-- CreateIndex
CREATE INDEX "lazada_payment_temp_orderNo_orderItemNo_idx" ON "lazada_payment_temp"("orderNo", "orderItemNo");

-- CreateIndex
CREATE INDEX "lazada_payment_temp_transactionDate_idx" ON "lazada_payment_temp"("transactionDate");

-- CreateIndex
CREATE INDEX "lazada_payment_main_batchId_idx" ON "lazada_payment_main"("batchId");

-- CreateIndex
CREATE INDEX "lazada_payment_main_orderNo_orderItemNo_idx" ON "lazada_payment_main"("orderNo", "orderItemNo");

-- CreateIndex
CREATE INDEX "lazada_payment_main_transactionDate_idx" ON "lazada_payment_main"("transactionDate");

-- CreateIndex
CREATE INDEX "lazada_payment_main_storeType_idx" ON "lazada_payment_main"("storeType");

-- CreateIndex
CREATE INDEX "lazada_payment_main_as400Sent_idx" ON "lazada_payment_main"("as400Sent");

-- CreateIndex
CREATE INDEX "as400_order_check_orderNo_idx" ON "as400_order_check"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "as400_order_check_orderNo_orderItemNo_key" ON "as400_order_check"("orderNo", "orderItemNo");

-- CreateIndex
CREATE INDEX "process_logs_batchId_idx" ON "process_logs"("batchId");

-- CreateIndex
CREATE INDEX "process_logs_action_idx" ON "process_logs"("action");

-- CreateIndex
CREATE INDEX "process_logs_createdAt_idx" ON "process_logs"("createdAt");
