import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { operationScenarioFromRecord } from "@/modules/operation-profit/mappers";
import { operationScenarioToCreatePayload } from "@/modules/operation-profit/mappers";

const schema = z.object({
  name: z.string().trim().min(1),
  exchangeRate: z.number(),
  billingAmount: z.number(),
  markup: z.number(),
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
  const user = await requireModuleAccess(ModuleKey.OPERATION_PROFIT);
  const { scenarioId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const existing = await prisma.operationProfitScenario.findFirst({
    where: { id: scenarioId, createdById: user.id },
    include: { fixedCostLines: true, variableCostLines: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }
  const baselineScenario = operationScenarioFromRecord({
    scenario: existing,
    fixedCosts: existing.fixedCostLines,
    variableCosts: existing.variableCostLines
  });
  const sanitizedInput =
    user.role === "ADMIN"
      ? parsed.data
      : {
          ...parsed.data,
          variableCosts: baselineScenario.variableCosts
        };
  const payload = operationScenarioToCreatePayload(sanitizedInput);
  await prisma.$transaction([
    prisma.operationProfitFixedCostLine.deleteMany({ where: { scenarioId } }),
    prisma.operationProfitVariableCostLine.deleteMany({ where: { scenarioId } }),
    prisma.operationProfitScenario.update({
      where: { id: scenarioId },
      data: {
        ...payload.scenario,
        fixedCostLines: { createMany: { data: payload.fixedCosts } },
        variableCostLines: { createMany: { data: payload.variableCosts } }
      }
    })
  ]);

  return NextResponse.json({ id: scenarioId });
}
