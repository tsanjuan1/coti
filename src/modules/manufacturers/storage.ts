import storageManifest from "@/modules/manufacturers/generated/storage-manifest.json";
import type { ManufacturerStorageManifest } from "@/modules/manufacturers/types";

export const MANUFACTURERS_BUCKET =
  process.env.SUPABASE_MANUFACTURERS_BUCKET ?? "manufacturer-files";

export const MANUFACTURERS_MAX_ONLINE_FILE_BYTES = 200 * 1024 * 1024;

export const manufacturersStorageManifest =
  storageManifest as ManufacturerStorageManifest;

export function getManufacturerStorageEntry(relativePath: string) {
  return manufacturersStorageManifest.files.find(
    (file) => file.relativePath === relativePath
  );
}
