import structure from "@/modules/manufacturers/generated/structure.json";
import type {
  ManufacturerDirectory,
  ManufacturerDirectoryEntry,
  ManufacturerDirectorySubmodule
} from "@/modules/manufacturers/types";

export const manufacturerDirectory = structure as ManufacturerDirectory;

export function getManufacturerBySlug(slug: string): ManufacturerDirectoryEntry | null {
  return (
    manufacturerDirectory.manufacturers.find((manufacturer) => manufacturer.slug === slug) ?? null
  );
}

export function getManufacturerSubmodule(
  manufacturerSlug: string,
  submoduleSlug: string
): ManufacturerDirectorySubmodule | null {
  const manufacturer = getManufacturerBySlug(manufacturerSlug);

  if (!manufacturer) {
    return null;
  }

  return manufacturer.submodules.find((submodule) => submodule.slug === submoduleSlug) ?? null;
}
