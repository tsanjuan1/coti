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
