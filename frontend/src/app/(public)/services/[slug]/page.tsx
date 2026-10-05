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
  const item = await getPublicRecord("services", slug);
  if (!item) notFound();
  return pageMetadata(
    String(item.attributes.seo_title || item.title),
    String(item.attributes.seo_description || item.summary || ""),
    `/services/${item.slug}`,
  );
}
export default async function ServiceDetail({ params }: Props) {
  await requirePublicSection("/services");
  const { slug } = await params;
  const item = await getPublicRecord("services", slug);
  if (!item) notFound();
  const benefits = Array.isArray(item.attributes.benefits)
    ? item.attributes.benefits
    : [];
  const technologies = Array.isArray(item.attributes.technologies)
    ? item.attributes.technologies
    : [];
  return (
    <main id="main" className="public-page detail-page">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: item.title, path: `/services/${item.slug}` },
        ]}
      />
      <div className="detail-hero">
        <Link href="/services" className="back-link">
          <ArrowLeft size={15} /> All services
        </Link>
        <p className="eyebrow">
          SERVICE /{" "}
          {String(item.attributes.service_type ?? "ENGINEERING").toUpperCase()}
        </p>
        <h1>
          {item.title}
          <em>.</em>
        </h1>
        <p className="detail-lead">{item.summary}</p>
        <Link href="/contact" className="button">
          Discuss this capability <ArrowUpRight size={16} />
        </Link>
        <div className="detail-glyph" aria-hidden="true">
          LS<span>/{item.slug.slice(0, 2).toUpperCase()}</span>
        </div>
      </div>
      <section className="detail-content">
        <div className="detail-copy">
          <p className="eyebrow">BUILT AROUND YOUR BUSINESS</p>
          <h2>
            Technology should make
            <br />
            <em>the hard things simpler.</em>
          </h2>
          {plainText(item.body) ? (
            <RichBody value={item.body} />
          ) : (
            <p>{item.summary}</p>
          )}
        </div>
        <div className="detail-side">
          {benefits.length > 0 && (
            <div>
              <p className="eyebrow">POTENTIAL OUTCOMES</p>
              {benefits.map((b) => (
                <p className="detail-list-item" key={String(b)}>
                  ↗ {String(b)}
                </p>
              ))}
            </div>
          )}
          {technologies.length > 0 && (
            <div>
              <p className="eyebrow">TECHNOLOGIES</p>
              <div className="record-tags">
                {technologies.map((b) => (
                  <span key={String(b)}>{String(b)}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="page-bottom-cta">
        <p className="eyebrow">HAVE A SPECIFIC REQUIREMENT?</p>
        <h2>
          Let’s map out
          <br />
          <em>what’s possible.</em>
        </h2>
        <Link className="button" href="/contact">
          Start a conversation <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
