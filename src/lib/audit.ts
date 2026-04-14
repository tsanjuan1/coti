import { prisma } from "@/lib/prisma";

export async function createAuditLog(args: {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  payloadJson?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: args.actorUserId ?? null,
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      payloadJson: args.payloadJson ? JSON.parse(JSON.stringify(args.payloadJson)) : undefined
    }
  });
}
