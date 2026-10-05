import type { MetadataRoute } from "next";
import { getPublicSections, isSectionVisible } from "@/lib/public-sections";
import { getAllPublicRecords, getPublicSettings } from "@/lib/public-content";
import { canonicalBase, isPublicIndexingEnabled } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = await getPublicSections();
  const seo = await getPublicSettings("seo");
  const base = canonicalBase(seo);
  if (!base || !isPublicIndexingEnabled(seo)) return [];

  const [services, solutions, projects, articles, pages, industries] =
    await Promise.all([
      getAllPublicRecords("services"),
      getAllPublicRecords("solutions"),
      getAllPublicRecords("portfolio"),
      getAllPublicRecords("blog"),
      getAllPublicRecords("pages"),
      getAllPublicRecords("industries"),
    ]);
  const routes = [
    "/",
    "/services",
    "/solutions",
    "/portfolio",
    "/about",
    "/contact",
    "/blog",
    "/industries",
    "/technologies",
    "/privacy-policy",
    "/terms-and-conditions",
    ...services.map((item) => `/services/${item.slug}`),
    ...solutions.map((item) => `/solutions/${item.slug}`),
    ...projects.map((item) => `/portfolio/${item.slug}`),
    ...articles.map((item) => `/blog/${item.slug}`),
    ...industries.map((item) => `/industries/${item.slug}`),
    ...pages
      .filter(
        (item) =>
          ![
            "about",
            "contact",
            "homepage-introduction",
            "homepage-process",
            "why-logicsphere",
            "homepage-cta",
            "privacy-policy",
            "terms-and-conditions",
          ].includes(item.slug),
      )
      .map((item) => `/${item.slug}`),
  ];
  return [...new Set(routes)]
    .filter((route) => isSectionVisible(route, sections))
    .map((route) => ({
      url: `${base}${route}`,
      changeFrequency: "weekly",
      priority: route === "/" ? 1 : route.split("/").length > 2 ? 0.6 : 0.8,
    }));
}
