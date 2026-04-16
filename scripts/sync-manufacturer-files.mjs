import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

import catalog from "../src/modules/manufacturers/generated/catalog.json" with { type: "json" };

const MANUFACTURERS_BUCKET =
  process.env.SUPABASE_MANUFACTURERS_BUCKET ?? "manufacturer-files";
const MANUFACTURERS_MAX_ONLINE_FILE_BYTES = 200 * 1024 * 1024;

const rootDirectory = path.resolve(
  process.cwd(),
  "tmp_fabricantes",
  catalog.source.root
);
const outputPath = path.resolve(
  process.cwd(),
  "src/modules/manufacturers/generated/storage-manifest.json"
);

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para sincronizar fabricantes."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function guessContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".ppt":
      return "application/vnd.ms-powerpoint";
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".msg":
      return "application/vnd.ms-outlook";
    case ".zip":
      return "application/zip";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".mp4":
      return "video/mp4";
    case ".url":
      return "text/plain";
    case ".txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

async function ensureBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const exists = buckets.some((bucket) => bucket.name === MANUFACTURERS_BUCKET);
  if (exists) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    MANUFACTURERS_BUCKET,
    {
      public: false
    }
  );

  if (createError) {
    throw createError;
  }
}

async function uploadFile({ relativePath, sizeBytes }) {
  const storagePath = toStoragePath(relativePath);
  const localPath = path.resolve(rootDirectory, relativePath);

  if ((sizeBytes ?? 0) > MANUFACTURERS_MAX_ONLINE_FILE_BYTES) {
    return {
      relativePath,
      storagePath,
      sizeBytes,
      status: "skipped",
      reason: `Supera el limite online actual de ${Math.round(
        MANUFACTURERS_MAX_ONLINE_FILE_BYTES / (1024 * 1024)
      )} MB`
    };
  }

  try {
    const buffer = await fs.readFile(localPath);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(MANUFACTURERS_BUCKET)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: guessContentType(localPath)
      });

    if (error) {
      return {
        relativePath,
        storagePath,
        sizeBytes,
        status: "failed",
        reason: error.message
      };
    }

    return {
      relativePath,
      storagePath,
      sizeBytes,
      status: "uploaded"
    };
  } catch (error) {
    return {
      relativePath,
      storagePath,
      sizeBytes,
      status: "failed",
      reason: error instanceof Error ? error.message : "Error de lectura o subida."
    };
  }
}

function sanitizeSegment(segment) {
  const extension = path.extname(segment);
  const baseName = extension ? segment.slice(0, -extension.length) : segment;
  const safeBaseName = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._ ()+-]/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const safeExtension = extension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9.]/g, "")
    .toLowerCase();
  const hash = crypto.createHash("sha1").update(segment).digest("hex").slice(0, 8);

  if (extension) {
    return `${safeBaseName || "file"}-${hash}${safeExtension || ""}`;
  }

  return `${safeBaseName || "segment"}-${hash}`;
}

function toStoragePath(relativePath) {
  return relativePath
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .join("/");
}

async function main() {
  await ensureBucket();

  const files = catalog.manufacturers.flatMap((manufacturer) =>
    manufacturer.files.map((file) => ({
      relativePath: file.relativePath,
      sizeBytes: file.sizeBytes
    }))
  );

  const results = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const result = await uploadFile(file);
    results.push(result);
    console.log(
      `[${index + 1}/${files.length}] ${result.status.toUpperCase()} ${file.relativePath}`
    );
  }

  const uploaded = results.filter((file) => file.status === "uploaded");
  const skipped = results.filter((file) => file.status === "skipped");
  const failed = results.filter((file) => file.status === "failed");

  const manifest = {
    source: {
      bucket: MANUFACTURERS_BUCKET,
      generatedAt: new Date().toISOString(),
      uploadedCount: uploaded.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      uploadedBytes: uploaded.reduce((sum, file) => sum + (file.sizeBytes ?? 0), 0),
      skippedBytes: skipped.reduce((sum, file) => sum + (file.sizeBytes ?? 0), 0),
      note: "Archivos sincronizados a Supabase Storage para apertura desde la web."
    },
    files: results
  };

  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        bucket: MANUFACTURERS_BUCKET,
        uploaded: uploaded.length,
        skipped: skipped.length,
        failed: failed.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
