import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { operationScenarioToCreatePayload } from "@/modules/operation-profit/mappers";

const schema = z.object({
  name: z.string(),
  exchangeRate: z.number(),
  billingAmount: z.number(),
  markup: z.number(),
  variableCosts: z.array(z.object({
    lineKey: z.string(),
    label: z.string(),
    rate: z.number()
  })),
  fixedCosts: z.array(z.object({
    lineKey: z.string(),
    label: z.string(),
    formulaMode: z.enum(["manual", "usd_to_ars", "usd_to_ars_monthly"]),
    amount: z.number().optional(),
    inputA: z.number().optional(),
    inputB: z.number().optional()
  }))
});

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.OPERATION_PROFIT);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const payload = operationScenarioToCreatePayload(parsed.data);
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
