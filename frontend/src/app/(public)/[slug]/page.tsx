import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicRecord, plainText } from "@/lib/public-content";
import { PageIntro } from "@/components/public-ui";
import { RichBody } from "@/components/rich-body";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicRecord("pages", slug);
  if (!page) notFound();
  const canonical = page.attributes.canonical_url;
  return pageMetadata(
    String(page.attributes.seo_title || page.title),
    String(page.attributes.seo_description || page.summary || ""),
    typeof canonical === "string" && canonical ? canonical : `/${page.slug}`,
  );
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublicRecord("pages", slug);
  if (!page) notFound();
  return (
    <main id="main" className="public-page cms-page">
      <PageIntro
        index="LS"
        eyebrow={String(page.attributes.page_type ?? "COMPANY").toUpperCase()}
        title={
          <>
            {page.title}
            <em>.</em>
          </>
        }
        description={page.summary}
      />
      <article className="article-body cms-page-body">
        {plainText(page.body) ? <RichBody value={page.body} /> : null}
      </article>
    </main>
  );
}
