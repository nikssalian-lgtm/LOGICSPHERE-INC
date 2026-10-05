import type { Metadata } from "next";

export type SeoSettings = Record<string, string | undefined>;

export function pageMetadata(
  title: string,
  description: string,
  canonical: string,
  image?: string,
  type: "website" | "article" = "website",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function canonicalBase(settings: SeoSettings): string | undefined {
  const candidate = settings.canonical_base || process.env.NEXT_PUBLIC_SITE_URL;
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return url.origin.replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function isPublicIndexingEnabled(settings: SeoSettings): boolean {
  const base = canonicalBase(settings);
  if (
    !base ||
    !base.startsWith("https://") ||
    !["true", "1"].includes(String(settings.allow_indexing).toLowerCase())
  ) {
    return false;
  }
  const hostname = new URL(base).hostname.toLowerCase();
  return (
    !["localhost", "127.0.0.1", "::1"].includes(hostname) &&
    !hostname.endsWith(".local") &&
    !hostname.endsWith(".example")
  );
}
