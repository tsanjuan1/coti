"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, FolderOpen, Building2, FileText, ShieldAlert } from "lucide-react";

import type {
  ManufacturerCatalog,
  ManufacturerCatalogEntry,
  ManufacturerCatalogFile,
  ManufacturerStorageManifest,
  ManufacturerStorageManifestFile
} from "@/modules/manufacturers/types";

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function matchesSearch(manufacturer: ManufacturerCatalogEntry, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [
    manufacturer.name,
    manufacturer.relativePath,
    ...manufacturer.featuredFiles.map((file) => file.name),
    ...manufacturer.files.slice(0, 80).flatMap((file) => [
      file.name,
      file.folder,
      file.relativePath,
      ...(file.keywords ?? [])
    ])
  ];

  return searchableFields.some((value) => value.toLowerCase().includes(normalizedQuery));
}

function FileAction({
  availability
}: {
  availability?: ManufacturerStorageManifestFile;
}) {
  if (!availability) {
    return (
      <div className="text-xs text-[color:var(--muted)]">Sin sincronizar</div>
    );
  }

  if (availability.status === "uploaded") {
    return (
      <a
        href={`/api/manufacturers/files/open?path=${encodeURIComponent(
          availability.relativePath
        )}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Abrir
      </a>
    );
  }

  return (
    <div className="text-xs text-[color:var(--muted)]">
      {availability.reason ?? "No disponible online"}
    </div>
  );
}

function FeaturedFileCard({
  file,
  availability
}: {
  file: ManufacturerCatalogFile;
  availability?: ManufacturerStorageManifestFile;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{file.name}</div>
          <div className="mt-1 text-xs text-[color:var(--muted)]">{file.relativePath}</div>
        </div>
        <div className="rounded-full bg-[color:var(--surface-alt)] px-2.5 py-1 text-xs uppercase text-[color:var(--muted)]">
          {file.extension || "archivo"}
        </div>
      </div>
      <div className="mt-3 text-sm text-[color:var(--muted)]">
        Carpeta: {file.folder || "Raiz de la marca"}
      </div>
      <div className="mt-1 text-sm text-[color:var(--muted)]">
        Tamano: {formatBytes(file.sizeBytes)}
      </div>
      <div className="mt-4">
        <FileAction availability={availability} />
      </div>
    </div>
  );
}

export function ManufacturersCatalog({
  catalog,
  storageManifest
}: {
  catalog: ManufacturerCatalog;
  storageManifest: ManufacturerStorageManifest;
}) {
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    catalog.manufacturers[0]?.slug ?? null
  );
  const deferredSearch = useDeferredValue(search);
  const storageIndex = useMemo(
    () =>
      new Map(
        storageManifest.files.map((file) => [file.relativePath, file] as const)
      ),
    [storageManifest.files]
  );

  const filteredManufacturers = useMemo(
    () =>
      catalog.manufacturers.filter((manufacturer) =>
        matchesSearch(manufacturer, deferredSearch)
      ),
    [catalog.manufacturers, deferredSearch]
  );

  const selectedManufacturer =
    filteredManufacturers.find((manufacturer) => manufacturer.slug === selectedSlug) ??
    filteredManufacturers[0] ??
    null;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Fabricantes
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Catalogo interno de fabricantes</h1>
        <p className="mt-3 max-w-4xl text-sm text-[color:var(--muted)]">
          Este modulo indexa todas las marcas cargadas en la carpeta fuente y destaca
          los archivos que parecen contener contactos, credenciales, insignias,
          instructivos o documentacion clave. El paquete original pesa {formatBytes(
            catalog.source.totalBytes
          )} y ahora los archivos sincronizados al storage privado se pueden abrir
          directamente desde la web segun permisos.
        </p>
        <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Disponibles online: {storageManifest.source.uploadedCount} archivos.
              Pendientes o excluidos:{" "}
              {storageManifest.source.skippedCount + storageManifest.source.failedCount}.
              Los archivos demasiado grandes quedan marcados en el inventario.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Fabricantes",
            value: catalog.source.totalManufacturers,
            icon: Building2
          },
          {
            label: "Archivos indexados",
            value: catalog.source.totalFiles,
            icon: FileText
          },
          {
            label: "Volumen relevado",
            value: formatBytes(catalog.source.totalBytes),
            icon: FolderOpen
          },
          {
            label: "Ultima actualizacion",
            value: formatDate(catalog.source.generatedAt),
            icon: Search
          },
          {
            label: "Archivos online",
            value: storageManifest.source.uploadedCount,
            icon: FileText
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                <Icon className="h-4 w-4" />
                <span>{card.label}</span>
              </div>
              <div className="mt-3 text-3xl font-semibold">{card.value}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar fabricante, archivo o palabra clave"
              className="w-full rounded-2xl border border-[var(--line)] bg-[color:var(--surface-alt)] py-3 pl-10 pr-4"
            />
          </label>

          <div className="mt-4 text-sm text-[color:var(--muted)]">
            {filteredManufacturers.length} de {catalog.source.totalManufacturers} fabricantes
          </div>

          <div className="mt-4 space-y-2">
            {filteredManufacturers.map((manufacturer) => {
              const active = manufacturer.slug === selectedManufacturer?.slug;

              return (
                <button
                  key={manufacturer.slug}
                  type="button"
                  onClick={() => setSelectedSlug(manufacturer.slug)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                      : "border-[var(--line)] bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">{manufacturer.name}</div>
                  <div
                    className={`mt-1 text-sm ${
                      active ? "text-white/80" : "text-[color:var(--muted)]"
                    }`}
                  >
                    {manufacturer.fileCount} archivos - {formatBytes(manufacturer.totalBytes)}
                  </div>
                </button>
              );
            })}

            {filteredManufacturers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[color:var(--muted)]">
                No encontre fabricantes que coincidan con esa busqueda.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {selectedManufacturer ? (
            <>
              <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      Marca seleccionada
                    </div>
                    <h2 className="mt-2 text-3xl font-semibold">{selectedManufacturer.name}</h2>
                    <div className="mt-2 text-sm text-[color:var(--muted)]">
                      Ruta fuente: {catalog.source.root}/{selectedManufacturer.relativePath}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Archivos",
                        value: selectedManufacturer.fileCount
                      },
                      {
                        label: "Carpetas",
                        value: selectedManufacturer.folderCount
                      },
                      {
                        label: "Tamano",
                        value: formatBytes(selectedManufacturer.totalBytes)
                      }
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-[var(--line)] bg-[color:var(--surface-alt)] px-4 py-3"
                      >
                        <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                          {metric.label}
                        </div>
                        <div className="mt-2 text-xl font-semibold">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Archivos destacados</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Detectados por nombre como posibles contactos, credenciales,
                      insignias, instructivos o material de referencia.
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">
                    {selectedManufacturer.featuredFiles.length} destacados
                  </div>
                </div>

                {selectedManufacturer.featuredFiles.length > 0 ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {selectedManufacturer.featuredFiles.map((file) => (
                      <FeaturedFileCard
                        key={file.relativePath}
                        file={file}
                        availability={storageIndex.get(file.relativePath)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[color:var(--muted)]">
                    En esta marca no se detectaron automaticamente archivos clave por
                    nombre. Igual tenes todo el inventario debajo.
                  </div>
                )}
              </section>

              <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Inventario completo</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Lista completa de archivos indexados para {selectedManufacturer.name}.
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">
                    {selectedManufacturer.files.length} archivos
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)]">
                  <div className="max-h-[560px] overflow-auto">
                    <table className="min-w-full divide-y divide-[var(--line)] text-sm">
                      <thead className="sticky top-0 bg-[color:var(--surface-alt)]">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Archivo</th>
                          <th className="px-4 py-3 text-left font-medium">Carpeta</th>
                          <th className="px-4 py-3 text-left font-medium">Tipo</th>
                          <th className="px-4 py-3 text-left font-medium">Tamano</th>
                          <th className="px-4 py-3 text-left font-medium">Accion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] bg-white">
                        {selectedManufacturer.files.map((file) => {
                          const availability = storageIndex.get(file.relativePath);

                          return (
                            <tr key={file.relativePath}>
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium">{file.name}</div>
                              <div className="mt-1 text-xs text-[color:var(--muted)]">
                                {file.relativePath}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-[color:var(--muted)]">
                              {file.folder || "Raiz"}
                            </td>
                            <td className="px-4 py-3 align-top text-[color:var(--muted)]">
                              {file.extension || "-"}
                            </td>
                            <td className="px-4 py-3 align-top text-[color:var(--muted)]">
                              {formatBytes(file.sizeBytes)}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <FileAction availability={availability} />
                            </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 text-sm text-[color:var(--muted)] shadow-sm">
              No hay fabricantes cargados en el catalogo actual.
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
