export type PublicMedia = {
  id: number;
  name: string;
  alt_text: string | null;
  mime_type: string;
  public_url: string | null;
  width?: number | null;
  height?: number | null;
};

export type PublicRecord = {
  id: number;
  type: string;
  title: string;
  slug: string;
  summary: string | null;
  body: unknown;
  featured: boolean;
  published_at: string | null;
  attributes: Record<string, unknown>;
  media: PublicMedia[];
  categories: { name: string; slug: string }[];
};

export type PublicCollection = {
  data: PublicRecord[];
  total: number;
};

const origin = () => process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
const requestInit = () => ({
  next: { revalidate: 60 },
  signal: AbortSignal.timeout(8_000),
});

export async function getPublicRecords(
  module: string,
  params = "per_page=50",
): Promise<PublicRecord[]> {
  return (await getPublicCollection(module, params)).data;
}

/** Fetch each public page for generated indexes such as the XML sitemap. */
export async function getAllPublicRecords(
  module: string,
): Promise<PublicRecord[]> {
  const firstPage = await getPublicCollection(module, "per_page=50&page=1");
  const pages = Math.ceil(firstPage.total / 50);
  if (pages <= 1) return firstPage.data;

  const records = [...firstPage.data];
  for (let page = 2; page <= pages; page += 8) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(8, pages - page + 1) }, (_, index) =>
        getPublicRecords(module, `per_page=50&page=${page + index}`),
      ),
    );
    records.push(...batch.flat());
  }
  return records;
}

export async function getPublicCollection(
  module: string,
  params = "per_page=50",
): Promise<PublicCollection> {
  try {
    const response = await fetch(
      `${origin()}/api/v1/public/content/${encodeURIComponent(module)}?${params}`,
      module === "menus"
        ? { cache: "no-store", signal: AbortSignal.timeout(8_000) }
        : requestInit(),
    );
    if (!response.ok) return { data: [], total: 0 };
    const result = (await response.json()) as {
      data?: PublicRecord[];
      meta?: { total?: number };
    };
    return {
      data: result.data ?? [],
      total: result.meta?.total ?? result.data?.length ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

export async function getPublicRecord(
  module: string,
  slug: string,
): Promise<PublicRecord | null> {
  try {
    const response = await fetch(
      `${origin()}/api/v1/public/content/${encodeURIComponent(module)}/${encodeURIComponent(slug)}`,
      requestInit(),
    );
    if (!response.ok) return null;
    const result = (await response.json()) as { data?: PublicRecord };
    return result.data ?? null;
  } catch {
    return null;
  }
}

export async function getPublicSettings(group: string) {
  try {
    const response = await fetch(
      `${origin()}/api/v1/public/settings`,
      requestInit(),
    );
    if (!response.ok) return {};
    const result = (await response.json()) as {
      data?: Record<string, Record<string, string>>;
    };
    return result.data?.[group] ?? {};
  } catch {
    return {};
  }
}

export function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const node = value as { text?: unknown; content?: unknown };
  const text = typeof node.text === "string" ? node.text : "";
  const nested = Array.isArray(node.content)
    ? node.content.map(plainText).filter(Boolean).join(" ")
    : "";
  return [text, nested].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function coverImage(record: PublicRecord) {
  return record.media.find((media) => media.mime_type.startsWith("image/"))
    ?.public_url;
}
