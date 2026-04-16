import { NextRequest, NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getManufacturerStorageEntry,
  MANUFACTURERS_BUCKET
} from "@/modules/manufacturers/storage";

const querySchema = z.object({
  path: z.string().trim().min(1)
});

export async function GET(request: NextRequest) {
  await requireModuleAccess(ModuleKey.MANUFACTURERS);

  const parsed = querySchema.safeParse({
    path: request.nextUrl.searchParams.get("path") ?? ""
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Ruta de archivo invalida." }, { status: 400 });
  }

  const file = getManufacturerStorageEntry(parsed.data.path);
  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado en el catalogo." }, { status: 404 });
  }

  if (file.status !== "uploaded") {
    return NextResponse.json(
      {
        error:
          file.reason ??
          "Este archivo todavia no esta disponible para abrirse desde la web."
      },
      { status: 409 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(MANUFACTURERS_BUCKET)
    .createSignedUrl(file.storagePath, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo generar el acceso al archivo." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
