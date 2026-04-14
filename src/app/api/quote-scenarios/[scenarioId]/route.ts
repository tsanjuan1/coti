import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { quoteScenarioToCreatePayload } from "@/modules/cotizador/mappers";

const quoteScenarioSchema = z.object({
  name: z.string().trim().min(1),
  productTypeKey: z.string().trim().min(1),
  supplierUnitPriceUsd: z.number(),
  priceFactor: z.number(),
  insuranceRate: z.number(),
  freightRatePerKgUsd: z.number(),
  freightWeightKg: z.number(),
  miscellaneousRate: z.number(),
  transferRate: z.number(),
  countryTaxRate: z.number(),
  exchangeRateArsUsd: z.number(),
  saleFactor: z.number(),
  productRules: z.array(z.any()),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const { scenarioId } = await params;
  const parsed = quoteScenarioSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const payload = quoteScenarioToCreatePayload(parsed.data);
  const existing = await prisma.quoteScenario.findFirst({
    where: { id: scenarioId, createdById: user.id },
    select: { id: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { scenarioId } }),
    prisma.quoteCostProfile.deleteMany({ where: { scenarioId } }),
    prisma.quoteScenario.update({
      where: { id: scenarioId },
      data: {
        ...payload.scenario,
        items: { createMany: { data: payload.items } },
        costLines: { createMany: { data: payload.costLines } }
      }
    })
  ]);

  return NextResponse.json({ id: scenarioId });
}
