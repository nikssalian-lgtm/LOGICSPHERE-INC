import { cache } from "react";
import { notFound } from "next/navigation";
import { getAllPublicRecords } from "@/lib/public-content";

export const sectionPaths = [
  "/services",
  "/solutions",
  "/portfolio",
  "/about",
  "/blog",
] as const;

// Header publication is the source of truth for these public sections.
export const getPublicSections = cache(async () => {
  const menus = await getAllPublicRecords("menus");
  const published = new Set(
    menus
      .filter((item) => item.attributes.menu === "primary")
      .map((item) => String(item.attributes.url || "").replace(/\/$/, "")),
  );
  return Object.fromEntries(
    sectionPaths.map((path) => [path, published.has(path)]),
  ) as Record<(typeof sectionPaths)[number], boolean>;
});

export function isSectionVisible(
  href: string,
  sections: Awaited<ReturnType<typeof getPublicSections>>,
) {
  const path = href.split(/[?#]/)[0].replace(/\/$/, "");
  const section = sectionPaths.find(
    (root) => path === root || path.startsWith(`${root}/`),
  );
  return !section || sections[section];
}

export async function requirePublicSection(
  path: (typeof sectionPaths)[number],
) {
  if (!(await getPublicSections())[path]) notFound();
}
