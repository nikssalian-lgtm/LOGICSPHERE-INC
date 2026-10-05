import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPublicRecord, plainText } from "@/lib/public-content";
import { RichBody } from "@/components/rich-body";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicRecord("solutions", slug);
  if (!item) notFound();
  return pageMetadata(
    String(item.attributes.seo_title || item.title),
    String(item.attributes.seo_description || item.summary || ""),
    `/solutions/${item.slug}`,
  );
}
export default async function SolutionDetail({ params }: Props) {
  await requirePublicSection("/solutions");
  const { slug } = await params;
  const item = await getPublicRecord("solutions", slug);
  if (!item) notFound();
  const capabilities = Array.isArray(item.attributes.capabilities)
    ? item.attributes.capabilities
    : [];
  return (
    <main id="main" className="public-page detail-page">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: item.title, path: `/solutions/${item.slug}` },
        ]}
      />
      <div className="detail-hero">
        <Link href="/solutions" className="back-link">
          <ArrowLeft size={15} /> All solutions
        </Link>
        <p className="eyebrow">
          BUSINESS SYSTEM /{" "}
          {String(item.attributes.category ?? "SOLUTION").toUpperCase()}
        </p>
        <h1>
          {item.title}
          <em>.</em>
        </h1>
        <p className="detail-lead">{item.summary}</p>
        <Link href="/contact" className="button">
          Discuss your requirements <ArrowUpRight size={16} />
        </Link>
        <div className="detail-glyph" aria-hidden="true">
          {String(item.attributes.category ?? "LS")
            .slice(0, 3)
            .toUpperCase()}
          <span>/SYSTEM</span>
        </div>
      </div>
      <section className="detail-content">
        <div className="detail-copy">
          <p className="eyebrow">SOFTWARE THAT FITS</p>
          <h2>
            Make every part
            <br />
            of the operation <em>count.</em>
          </h2>
          {plainText(item.body) ? (
            <RichBody value={item.body} />
          ) : (
            <p>{item.summary}</p>
          )}
        </div>
        {capabilities.length > 0 && (
          <div className="detail-side">
            <p className="eyebrow">CAPABILITIES</p>
            {capabilities.map((c) => (
              <p className="detail-list-item" key={String(c)}>
                ↗ {String(c)}
              </p>
            ))}
          </div>
        )}
      </section>
      <section className="page-bottom-cta">
        <p className="eyebrow">MADE FOR HOW YOU WORK</p>
        <h2>
          Bring the whole picture
          <br />
          <em>into focus.</em>
        </h2>
        <Link className="button" href="/contact">
          Start a conversation <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
