import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  productTypeKey: z.string().trim().min(1),
  dutyRate: z.number(),
  statisticsRate: z.number(),
  vatRate: z.number(),
  advanceVatRate: z.number(),
  grossIncomeRate: z.number(),
  advanceIncomeTaxRate: z.number(),
  internalTaxRate: z.number(),
  ncmCode: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

const schema = z.object({
  rules: z.array(ruleSchema).min(1)
});

export async function PUT(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.rules.map((rule) =>
      prisma.quoteProductRule.upsert({
        where: { productTypeKey: rule.productTypeKey },
        update: {
          dutyRate: rule.dutyRate,
          statisticsRate: rule.statisticsRate,
          vatRate: rule.vatRate,
          advanceVatRate: rule.advanceVatRate,
          grossIncomeRate: rule.grossIncomeRate,
          advanceIncomeTaxRate: rule.advanceIncomeTaxRate,
          internalTaxRate: rule.internalTaxRate,
          ncmCode: rule.ncmCode ?? null,
          description: rule.description ?? null
        },
        create: {
          productTypeKey: rule.productTypeKey,
          dutyRate: rule.dutyRate,
          statisticsRate: rule.statisticsRate,
          vatRate: rule.vatRate,
          advanceVatRate: rule.advanceVatRate,
          grossIncomeRate: rule.grossIncomeRate,
          advanceIncomeTaxRate: rule.advanceIncomeTaxRate,
          internalTaxRate: rule.internalTaxRate,
          ncmCode: rule.ncmCode ?? null,
          description: rule.description ?? null
        }
      })
    )
  );

  const rules = await prisma.quoteProductRule.findMany({
    orderBy: { productTypeKey: "asc" }
  });

  return NextResponse.json({ rules });
}
