import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultBreakEvenScenario } from "@/modules/break-even/defaults";
import { breakEvenScenarioFromRecord } from "@/modules/break-even/mappers";
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

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.BREAK_EVEN);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const latestScenario =
    user.role === "ADMIN"
      ? null
      : await prisma.breakEvenScenario.findFirst({
          where: { createdById: user.id },
          include: {
            fixedCostLines: true,
            variableCostLines: true,
            salespersonProfiles: true
          },
          orderBy: { updatedAt: "desc" }
        });

  const baselineScenario = latestScenario
    ? breakEvenScenarioFromRecord({
        scenario: latestScenario,
        fixedCosts: latestScenario.fixedCostLines,
        variableCosts: latestScenario.variableCostLines,
        salespersonProfiles: latestScenario.salespersonProfiles
      })
    : defaultBreakEvenScenario;

  const sanitizedInput =
    user.role === "ADMIN"
      ? parsed.data
      : {
          ...parsed.data,
          fixedCosts: baselineScenario.fixedCosts,
          variableCosts: baselineScenario.variableCosts
        };

  const payload = breakEvenScenarioToCreatePayload(sanitizedInput);
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
