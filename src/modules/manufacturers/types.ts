export type ManufacturerDirectorySubmodule = {
  slug: string;
  name: string;
  description: string;
};

export type ManufacturerDirectoryEntry = {
  slug: string;
  name: string;
  relativePath: string;
  submodules: ManufacturerDirectorySubmodule[];
};

export type ManufacturerDirectory = {
  source: {
    root: string;
    generatedAt: string;
    totalManufacturers: number;
    note: string;
  };
  manufacturers: ManufacturerDirectoryEntry[];
};
