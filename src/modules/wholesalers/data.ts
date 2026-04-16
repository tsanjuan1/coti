export const wholesalerSections = [
  {
    slug: "local",
    name: "Local",
    description:
      "Canal para cargar mayoristas locales con nombre, vendedor, link y credenciales."
  },
  {
    slug: "exterior",
    name: "Exterior",
    description:
      "Canal para cargar mayoristas del exterior con sus datos operativos y accesos."
  }
] as const;

export function getWholesalerSection(sectionSlug: string) {
  return wholesalerSections.find((section) => section.slug === sectionSlug) ?? null;
}
