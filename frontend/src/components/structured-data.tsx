import { getPublicSettings } from "@/lib/public-content";
import { canonicalBase } from "@/lib/seo";

type Breadcrumb = { name: string; path: string };

export function StructuredData({ data }: { data: unknown }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export async function BreadcrumbStructuredData({
  items,
}: {
  items: Breadcrumb[];
}) {
  const base = canonicalBase(await getPublicSettings("seo"));
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: base ? `${base}${item.path}` : item.path,
        })),
      }}
    />
  );
}
