export type ManufacturerCatalogFile = {
  name: string;
  relativePath: string;
  extension: string;
  sizeBytes: number | null;
  folder: string;
  isFeatured?: boolean;
  keywords?: string[];
};

export type ManufacturerCatalogEntry = {
  slug: string;
  name: string;
  relativePath: string;
  fileCount: number;
  folderCount: number;
  totalBytes: number | null;
  featuredFiles: ManufacturerCatalogFile[];
  files: ManufacturerCatalogFile[];
};

export type ManufacturerCatalog = {
  source: {
    root: string;
    generatedAt: string;
    totalManufacturers: number;
    totalFiles: number;
    totalBytes: number;
    note: string;
  };
  manufacturers: ManufacturerCatalogEntry[];
};

export type ManufacturerStorageStatus = "uploaded" | "skipped" | "failed";

export type ManufacturerStorageManifestFile = {
  relativePath: string;
  storagePath: string;
  sizeBytes: number | null;
  status: ManufacturerStorageStatus;
  reason?: string;
};

export type ManufacturerStorageManifest = {
  source: {
    bucket: string;
    generatedAt: string;
    uploadedCount: number;
    skippedCount: number;
    failedCount: number;
    uploadedBytes: number;
    skippedBytes: number;
    note: string;
  };
  files: ManufacturerStorageManifestFile[];
};
