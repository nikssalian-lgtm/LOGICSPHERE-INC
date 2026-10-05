import type { MetadataRoute } from "next";
import { getPublicSettings } from "@/lib/public-content";
import { canonicalBase, isPublicIndexingEnabled } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [seo] = await Promise.all([getPublicSettings("seo")]);
  const base = canonicalBase(seo);
  const allowIndexing = isPublicIndexingEnabled(seo);
  return {
    rules: {
      userAgent: "*",
      allow: allowIndexing ? "/" : undefined,
      disallow: allowIndexing ? ["/admin", "/login", "/reset-password"] : "/",
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
