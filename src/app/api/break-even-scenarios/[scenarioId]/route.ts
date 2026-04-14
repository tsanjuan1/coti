import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { breakEvenScenarioToCreatePayload } from "@/modules/break-even/mappers";

const schema = z.object({
  name: z.string().trim().min(1),
  salesAmount: z.number(),
  markup: z.number(),
  exchangeRate: z.number(),
  fixedCosts: z.array(z.object({
    lineKey: z.string(),
    label: z.string(),
    formulaMode: z.enum(["manual", "sales_rate", "usd_to_ars", "usd_to_ars_monthly"]),
    amount: z.number().optional(),
    inputA: z.number().optional(),
    inputB: z.number().optional()
  })),
  variableCosts: z.array(z.object({
    lineKey: z.string(),
    label: z.string(),
    rate: z.number()
  }))
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const user = await requireModuleAccess(ModuleKey.BREAK_EVEN);
  const { scenarioId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const payload = breakEvenScenarioToCreatePayload(parsed.data);
  const existing = await prisma.breakEvenScenario.findFirst({
    where: { id: scenarioId, createdById: user.id },
    select: { id: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.breakEvenFixedCostLine.deleteMany({ where: { scenarioId } }),
    prisma.breakEvenVariableCostLine.deleteMany({ where: { scenarioId } }),
    prisma.breakEvenSalespersonProfile.deleteMany({ where: { scenarioId } }),
    prisma.breakEvenScenario.update({
      where: { id: scenarioId },
      data: {
        ...payload.scenario,
        fixedCostLines: { createMany: { data: payload.fixedCosts } },
        variableCostLines: { createMany: { data: payload.variableCosts } },
        salespersonProfiles: { createMany: { data: payload.salespersonProfiles } }
      }
    })
  ]);

  return NextResponse.json({ id: scenarioId });
}
