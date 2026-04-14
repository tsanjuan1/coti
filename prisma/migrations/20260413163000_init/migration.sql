-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "ModuleKey" AS ENUM ('QUOTE', 'BREAK_EVEN', 'OPERATION_PROFIT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuoteItemStatus" AS ENUM ('COTIZACION', 'COMPRAS', 'VENCIDO');

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'SELLER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleKey" "ModuleKey" NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT false,
    "canManage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "sellerName" TEXT,
    "globalMarkupFactor" DOUBLE PRECISION NOT NULL,
    "insuranceRate" DOUBLE PRECISION NOT NULL,
    "advanceVatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "countryTaxRate" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "status" "QuoteItemStatus" NOT NULL,
    "quoteDate" TIMESTAMP(3),
    "sellerName" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productTypeKey" TEXT NOT NULL,
    "fobUnitCost" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "lineMarkup" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteCostProfile" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteCostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteProductRule" (
    "id" TEXT NOT NULL,
    "productTypeKey" TEXT NOT NULL,
    "dutyRate" DOUBLE PRECISION NOT NULL,
    "statisticsRate" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL,
    "advanceVatRate" DOUBLE PRECISION NOT NULL,
    "grossIncomeRate" DOUBLE PRECISION NOT NULL,
    "advanceIncomeTaxRate" DOUBLE PRECISION NOT NULL,
    "internalTaxRate" DOUBLE PRECISION NOT NULL,
    "ncmCode" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteProductRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEvenScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "salesAmount" DOUBLE PRECISION NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "realBillingPesos" DOUBLE PRECISION NOT NULL,
    "realBillingMarkup" DOUBLE PRECISION NOT NULL,
    "realBillingExchangeRate" DOUBLE PRECISION NOT NULL,
    "altBillingPesos" DOUBLE PRECISION NOT NULL,
    "altBillingMarkup" DOUBLE PRECISION NOT NULL,
    "altBillingExchangeRate" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEvenScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEvenFixedCostLine" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "formulaMode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "inputA" DOUBLE PRECISION,
    "inputB" DOUBLE PRECISION,
    "inputC" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEvenFixedCostLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEvenVariableCostLine" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEvenVariableCostLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEvenSalesHistory" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "salesAmount" DOUBLE PRECISION,
    "collections" DOUBLE PRECISION,
    "loans" DOUBLE PRECISION,
    "cashOut" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEvenSalesHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEvenSalespersonProfile" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "salaryAmount" DOUBLE PRECISION NOT NULL,
    "burdenAmount" DOUBLE PRECISION NOT NULL,
    "salaryShare" DOUBLE PRECISION,
    "allocatedFixedCost" DOUBLE PRECISION,
    "contributionMargin" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEvenSalespersonProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationProfitScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "billingAmount" DOUBLE PRECISION NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationProfitScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationProfitVariableCostLine" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationProfitVariableCostLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationProfitFixedCostLine" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "formulaMode" TEXT NOT NULL DEFAULT 'manual',
    "amount" DOUBLE PRECISION,
    "derivedAmount" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "inputA" DOUBLE PRECISION,
    "inputB" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationProfitFixedCostLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_authUserId_key" ON "AppUser"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ModulePermission_userId_moduleKey_key" ON "ModulePermission"("userId", "moduleKey");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_namespace_key_key" ON "SystemSetting"("namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteItem_scenarioId_lineNumber_key" ON "QuoteItem"("scenarioId", "lineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteCostProfile_scenarioId_section_lineKey_key" ON "QuoteCostProfile"("scenarioId", "section", "lineKey");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteProductRule_productTypeKey_key" ON "QuoteProductRule"("productTypeKey");

-- CreateIndex
CREATE UNIQUE INDEX "BreakEvenFixedCostLine_scenarioId_lineKey_key" ON "BreakEvenFixedCostLine"("scenarioId", "lineKey");

-- CreateIndex
CREATE UNIQUE INDEX "BreakEvenVariableCostLine_scenarioId_lineKey_key" ON "BreakEvenVariableCostLine"("scenarioId", "lineKey");

-- CreateIndex
CREATE UNIQUE INDEX "BreakEvenSalesHistory_scenarioId_periodLabel_key" ON "BreakEvenSalesHistory"("scenarioId", "periodLabel");

-- CreateIndex
CREATE UNIQUE INDEX "BreakEvenSalespersonProfile_scenarioId_label_key" ON "BreakEvenSalespersonProfile"("scenarioId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "OperationProfitVariableCostLine_scenarioId_lineKey_key" ON "OperationProfitVariableCostLine"("scenarioId", "lineKey");

-- CreateIndex
CREATE UNIQUE INDEX "OperationProfitFixedCostLine_scenarioId_lineKey_key" ON "OperationProfitFixedCostLine"("scenarioId", "lineKey");

-- AddForeignKey
ALTER TABLE "ModulePermission" ADD CONSTRAINT "ModulePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteScenario" ADD CONSTRAINT "QuoteScenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "QuoteScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCostProfile" ADD CONSTRAINT "QuoteCostProfile_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "QuoteScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEvenScenario" ADD CONSTRAINT "BreakEvenScenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEvenFixedCostLine" ADD CONSTRAINT "BreakEvenFixedCostLine_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BreakEvenScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEvenVariableCostLine" ADD CONSTRAINT "BreakEvenVariableCostLine_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BreakEvenScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEvenSalesHistory" ADD CONSTRAINT "BreakEvenSalesHistory_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BreakEvenScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEvenSalespersonProfile" ADD CONSTRAINT "BreakEvenSalespersonProfile_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BreakEvenScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationProfitScenario" ADD CONSTRAINT "OperationProfitScenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationProfitVariableCostLine" ADD CONSTRAINT "OperationProfitVariableCostLine_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "OperationProfitScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationProfitFixedCostLine" ADD CONSTRAINT "OperationProfitFixedCostLine_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "OperationProfitScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

