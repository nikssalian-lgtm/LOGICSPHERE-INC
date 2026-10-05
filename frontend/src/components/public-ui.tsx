import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import type { PublicRecord } from "@/lib/public-content";
import { coverImage, plainText } from "@/lib/public-content";

export function PageIntro({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string | null;
}) {
  return (
    <section className="page-intro">
      <p className="eyebrow">
        <span>{index}</span>
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {description && <p className="page-intro-description">{description}</p>}
      <span className="intro-coordinate" aria-hidden="true">
        LS / {index} — 2026
      </span>
    </section>
  );
}

export function RecordCard({
  item,
  href,
  index,
  kind = "record",
}: {
  item: PublicRecord;
  href: string;
  index: number;
  kind?: string;
}) {
  const image = coverImage(item);
  const technologies = Array.isArray(item.attributes.technologies)
    ? item.attributes.technologies
    : [];
  const services = Array.isArray(item.attributes.services)
    ? item.attributes.services
    : [];
  return (
    <Link
      className={`record-card record-${kind}${item.featured ? " is-featured" : ""}`}
      href={href}
    >
      <div className="record-visual">
        {image ? (
          <Image
            src={image}
            alt={
              item.media.find((m) => m.public_url === image)?.alt_text ||
              item.title
            }
            width={
              item.media.find((m) => m.public_url === image)?.width || 1200
            }
            height={
              item.media.find((m) => m.public_url === image)?.height || 900
            }
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="visual-placeholder" aria-hidden="true">
            <div className="visual-grid" />
            <span>
              LS<span> / {String(index + 1).padStart(2, "0")}</span>
            </span>
            <i />
          </div>
        )}
        {kind === "project" &&
          item.media.some((media) => media.mime_type.startsWith("video/")) && (
            <span className="project-media-type">VIDEO CASE STUDY</span>
          )}
        <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="card-arrow">
          <MoveUpRight size={18} />
        </span>
      </div>
      <div className="record-meta">
        <div>
          <p className="record-kicker">
            {kind === "project"
              ? String(
                  item.attributes.project_type ??
                    item.attributes.industry ??
                    "Selected work",
                )
              : kind === "article"
                ? item.published_at
                  ? new Date(item.published_at).toLocaleDateString("en", {
                      month: "short",
                      year: "numeric",
                    })
                  : "INSIGHT"
                : String(
                    item.attributes.category ??
                      item.attributes.service_type ??
                      "Capability",
                  )}
          </p>
          <h3>{item.title}</h3>
          <p>{item.summary || plainText(item.body).slice(0, 150)}</p>
          {kind === "project" && Boolean(item.attributes.client) && (
            <span className="project-client-label">
              {String(item.attributes.client)}
            </span>
          )}
          {(technologies.length > 0 || services.length > 0) && (
            <div className="record-tags">
              {[...services, ...technologies].slice(0, 3).map((tag, index) => (
                <span key={`${item.id}-${index}-${String(tag)}`}>
                  {String(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArrowUpRight className="record-arrow" size={18} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function EmptyEditorial({
  title,
  description,
  href = "/contact",
  action = "Discuss a project",
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="editorial-empty">
      <span className="empty-mark">
        LS<span>+</span>
      </span>
      <div>
        <p className="eyebrow">IN PROGRESS / CONTENT STUDIO</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link href={href} className="text-link">
        {action} <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  link,
  href,
}: {
  eyebrow: string;
  title: React.ReactNode;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {link && href && (
        <Link href={href} className="text-link">
          {link} <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function ScrollCue() {
  return (
    <a className="scroll-cue" href="#intro" aria-label="Scroll to explore">
      <ArrowDown size={14} />
      <span>SCROLL TO EXPLORE</span>
    </a>
  );
}
