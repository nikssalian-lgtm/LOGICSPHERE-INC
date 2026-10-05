import type { Metadata } from "next";
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
  const item = await getPublicRecord("industries", slug);
  if (!item) notFound();
  return pageMetadata(
    String(item.attributes.seo_title || item.title),
    String(item.attributes.seo_description || item.summary || ""),
    `/industries/${item.slug}`,
  );
}
export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicRecord("industries", slug);
  if (!item) notFound();
  const services = Array.isArray(item.attributes.services)
    ? item.attributes.services
    : [];
  return (
    <main id="main" className="public-page detail-page">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: item.title, path: `/industries/${item.slug}` },
        ]}
      />
      <div className="detail-hero">
        <Link href="/" className="back-link">
          <ArrowLeft size={15} /> Home
        </Link>
        <p className="eyebrow">INDUSTRY / CONTEXT</p>
        <h1>
          {item.title}
          <em>.</em>
        </h1>
        <p className="detail-lead">{item.summary}</p>
        <Link href="/contact" className="button">
          Discuss your requirements <ArrowUpRight size={16} />
        </Link>
        <div className="detail-glyph" aria-hidden="true">
          {String(item.attributes.icon || "LS")
            .slice(0, 3)
            .toUpperCase()}
          <span>/CONTEXT</span>
        </div>
      </div>
      <section className="detail-content">
        <div className="detail-copy">
          <p className="eyebrow">BUILT FOR YOUR CONTEXT</p>
          <h2>
            Make technology fit
            <br />
            <em>the way you work.</em>
          </h2>
          {plainText(item.body) ? (
            <RichBody value={item.body} />
          ) : (
            <p>{item.summary}</p>
          )}
        </div>
        {services.length > 0 && (
          <div className="detail-side">
            <p className="eyebrow">RELATED CAPABILITIES</p>
            {services.map((service) => (
              <p className="detail-list-item" key={String(service)}>
                ↗ {String(service)}
              </p>
            ))}
          </div>
        )}
      </section>
      <section className="page-bottom-cta">
        <p className="eyebrow">LET’S TALK ABOUT THE DETAILS</p>
        <h2>
          Start with your
          <br />
          <em>specific challenge.</em>
        </h2>
        <Link href="/contact" className="button">
          Start a conversation <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
