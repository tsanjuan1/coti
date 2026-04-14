import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { quoteScenarioToCreatePayload } from "@/modules/cotizador/mappers";

const quoteItemSchema = z.object({
  lineNumber: z.number(),
  status: z.enum(["COTIZACION", "COMPRAS", "VENCIDO"]),
  quoteDate: z.string().nullable().optional(),
  sellerName: z.string().nullable().optional(),
  quantity: z.number(),
  partNumber: z.string(),
  description: z.string(),
  productTypeKey: z.string(),
  fobUnitCost: z.number(),
  weightKg: z.number(),
  lineMarkup: z.number()
});

const originCostsSchema = z.object({
  shipperDeclarationUsd: z.number(),
  handlingFeeUsd: z.number(),
  deliveryAirportRatePerKg: z.number(),
  deliveryAirportMinimumUsd: z.number(),
  internationalFreightRatePerKg: z.number(),
  internationalFreightMinimumUsd: z.number(),
  originDocumentHandlingUsd: z.number(),
  afipResolutionArs: z.number(),
  exchangeRateArsUsd: z.number(),
  vatRate: z.number()
});

const destinationCostsSchema = z.object({
  custodyArs: z.number(),
  storageAdminRate: z.number(),
  digitizationUsd: z.number(),
  internalHaulArs: z.number(),
  operationalExpensesArs: z.number(),
  feesRate: z.number(),
  minimumFeesUsd: z.number(),
  destinationInsuranceRate: z.number(),
  storageRate: z.number(),
  miscellaneousUsd: z.number(),
  grossIncomeCabaRate: z.number(),
  grossIncomePbaRate: z.number(),
  destinationDocumentHandlingUsd: z.number(),
  exchangeRateArsUsd: z.number(),
  vatRate: z.number()
});

const remnantCostsSchema = z.object({
  feesRate: z.number(),
  minimumFeesUsd: z.number(),
  operationalExpensesArs: z.number(),
  digitizationUsd: z.number(),
  miscellaneousUsd: z.number(),
  custodyArs: z.number(),
  destinationInsuranceRate: z.number(),
  internalHaulArs: z.number(),
  storageAdminRate: z.number(),
  storageRate: z.number(),
  afipResolutionArs: z.number(),
  originDocumentHandlingUsd: z.number(),
  internationalFreightRatePerKg: z.number(),
  internationalFreightMinimumUsd: z.number(),
  grossIncomeCabaRate: z.number(),
  grossIncomePbaRate: z.number(),
  destinationDocumentHandlingUsd: z.number(),
  exchangeRateArsUsd: z.number(),
  vatRate: z.number()
});

const quoteScenarioSchema = z.object({
  name: z.string(),
  globalMarkupFactor: z.number(),
  insuranceRate: z.number(),
  advanceVatEnabled: z.boolean(),
  countryTaxRate: z.number(),
  originCosts: originCostsSchema,
  destinationCosts: destinationCostsSchema,
  remnantCosts: remnantCostsSchema,
  productRules: z.array(z.any()),
  items: z.array(quoteItemSchema)
});

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const parsed = quoteScenarioSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const payload = quoteScenarioToCreatePayload(parsed.data);
  const created = await prisma.quoteScenario.create({
    data: {
      ...payload.scenario,
      createdById: user.id,
      items: { createMany: { data: payload.items } },
      costLines: { createMany: { data: payload.costLines } }
    }
  });

  return NextResponse.json({ id: created.id });
}
