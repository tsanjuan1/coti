import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultOperationProfitScenario } from "@/modules/operation-profit/defaults";
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

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.OPERATION_PROFIT);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const latestScenario =
    user.role === "ADMIN"
      ? null
      : await prisma.operationProfitScenario.findFirst({
          where: { createdById: user.id },
          include: { fixedCostLines: true, variableCostLines: true },
          orderBy: { updatedAt: "desc" }
        });

  const baselineScenario = latestScenario
    ? operationScenarioFromRecord({
        scenario: latestScenario,
        fixedCosts: latestScenario.fixedCostLines,
        variableCosts: latestScenario.variableCostLines
      })
    : defaultOperationProfitScenario;

  const sanitizedInput =
    user.role === "ADMIN"
      ? parsed.data
      : {
          ...parsed.data,
          variableCosts: baselineScenario.variableCosts
        };

  const payload = operationScenarioToCreatePayload(sanitizedInput);
  const created = await prisma.operationProfitScenario.create({
    data: {
      ...payload.scenario,
      createdById: user.id,
      fixedCostLines: { createMany: { data: payload.fixedCosts } },
      variableCostLines: { createMany: { data: payload.variableCosts } }
    }
  });

  return NextResponse.json({ id: created.id });
}
