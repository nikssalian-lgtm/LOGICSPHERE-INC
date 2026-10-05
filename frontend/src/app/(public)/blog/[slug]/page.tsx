import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getPublicRecord,
  getPublicRecords,
  getPublicSettings,
  plainText,
  coverImage,
} from "@/lib/public-content";
import { RecordCard } from "@/components/public-ui";
import { RichBody } from "@/components/rich-body";
import {
  BreadcrumbStructuredData,
  StructuredData,
} from "@/components/structured-data";
import { canonicalBase } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicRecord("blog", slug);
  if (!post) notFound();
  const title = String(post.attributes.seo_title || post.title);
  const description = String(
    post.attributes.seo_description || post.summary || "",
  );
  const image = coverImage(post);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
export default async function ArticlePage({ params }: Props) {
  await requirePublicSection("/blog");
  const { slug } = await params;
  const [post, seo, articles] = await Promise.all([
    getPublicRecord("blog", slug),
    getPublicSettings("seo"),
    getPublicRecords("blog", "per_page=4"),
  ]);
  if (!post) notFound();
  const related = articles.filter((item) => item.id !== post.id).slice(0, 3);
  const image = coverImage(post);
  const author = String(post.attributes.author ?? "");
  const readTime = String(post.attributes.read_time ?? "");
  const base = canonicalBase(seo);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary || undefined,
    image: image || undefined,
    datePublished: post.published_at || undefined,
    author: author ? { "@type": "Person", name: author } : undefined,
    publisher: { "@type": "Organization", name: "LogicSphere Inc" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": base ? `${base}/blog/${post.slug}` : `/blog/${post.slug}`,
    },
  };
  return (
    <main id="main" className="public-page article-page">
      <StructuredData data={articleSchema} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <article>
        <div className="article-heading">
          <Link href="/blog" className="back-link">
            <ArrowLeft size={15} /> All insights
          </Link>
          <p className="eyebrow">
            {post.categories[0]?.name ?? "LOGICSPHERE / INSIGHTS"}
          </p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.summary}</p>
          <div className="article-byline">
            {author && <span>BY {author.toUpperCase()}</span>}
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString("en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            {readTime && <span>{readTime} MIN READ</span>}
          </div>
        </div>
        {image && (
          <figure className="article-cover">
            <Image
              src={image}
              alt={
                post.media.find((m) => m.public_url === image)?.alt_text ??
                post.title
              }
              width={
                post.media.find((m) => m.public_url === image)?.width || 1600
              }
              height={
                post.media.find((m) => m.public_url === image)?.height || 1000
              }
              sizes="100vw"
              priority
            />
          </figure>
        )}
        <div className="article-body">
          {plainText(post.body) ? (
            <RichBody value={post.body} />
          ) : (
            <p>{post.summary}</p>
          )}
        </div>
      </article>
      {related.length > 0 && (
        <section className="section-wrap related-articles">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KEEP EXPLORING</p>
              <h2>
                More <em>perspectives.</em>
              </h2>
            </div>
            <Link href="/blog" className="text-link">
              All insights <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="record-grid">
            {related.map((item, i) => (
              <RecordCard
                key={item.id}
                item={item}
                href={`/blog/${item.slug}`}
                index={i}
                kind="article"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
