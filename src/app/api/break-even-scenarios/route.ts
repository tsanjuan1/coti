import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { breakEvenScenarioToCreatePayload } from "@/modules/break-even/mappers";

const schema = z.object({
  name: z.string(),
  salesAmount: z.number(),
  markup: z.number(),
  exchangeRate: z.number(),
  realBillingPesos: z.number(),
  realBillingMarkup: z.number(),
  realBillingExchangeRate: z.number(),
  altBillingPesos: z.number(),
  altBillingMarkup: z.number(),
  altBillingExchangeRate: z.number(),
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
  })),
  salespersonProfiles: z.array(z.object({
    label: z.string(),
    salaryAmount: z.number(),
    burdenAmount: z.number().optional(),
    contributionMargin: z.number()
  }))
});

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.BREAK_EVEN);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const payload = breakEvenScenarioToCreatePayload(parsed.data);
  const created = await prisma.breakEvenScenario.create({
    data: {
      ...payload.scenario,
      createdById: user.id,
      fixedCostLines: { createMany: { data: payload.fixedCosts } },
      variableCostLines: { createMany: { data: payload.variableCosts } },
      salespersonProfiles: { createMany: { data: payload.salespersonProfiles } }
    }
  });

  return NextResponse.json({ id: created.id });
}
