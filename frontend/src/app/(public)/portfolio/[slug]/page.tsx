import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDown } from "lucide-react";
import {
  coverImage,
  getPublicRecord,
  getPublicRecords,
  getPublicSettings,
  plainText,
  type PublicRecord,
} from "@/lib/public-content";
import { RichBody } from "@/components/rich-body";
import { RecordCard } from "@/components/public-ui";
import {
  BreadcrumbStructuredData,
  StructuredData,
} from "@/components/structured-data";
import { canonicalBase } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
type Chapter = { id: string; title: string; value: unknown };
const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicRecord("portfolio", slug);
  if (!item) notFound();
  const title = String(
    item?.attributes.seo_title || item?.title || "Case study",
  );
  const description = String(
    item?.attributes.seo_description || item?.summary || "",
  );
  const image = item ? coverImage(item) : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      type: "article",
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

export default async function CaseStudy({ params }: Props) {
  await requirePublicSection("/portfolio");
  const { slug } = await params;
  const [item, allProjects, seo] = await Promise.all([
    getPublicRecord("portfolio", slug),
    getPublicRecords("portfolio", "per_page=50"),
    getPublicSettings("seo"),
  ]);
  if (!item) notFound();

  const cover = coverImage(item);
  const leadVideo = item.media.find(
    (media) =>
      !cover && media.public_url && media.mime_type.startsWith("video/"),
  );
  const chapters: Chapter[] = [
    {
      id: "challenge",
      title: "The challenge",
      value: item.attributes.challenge,
    },
    { id: "approach", title: "Our approach", value: item.attributes.approach },
    { id: "solution", title: "The solution", value: item.attributes.solution },
    { id: "results", title: "Results", value: item.attributes.results },
  ].filter((chapter) => Boolean(plainText(chapter.value)));
  const gallery = item.media.filter(
    (media) =>
      media.public_url &&
      media.public_url !== cover &&
      media.id !== leadVideo?.id,
  );
  const services = list(item.attributes.services);
  const features = list(item.attributes.features);
  const technologies = list(item.attributes.technologies);
  const projectUrl =
    typeof item.attributes.url === "string" ? item.attributes.url : "";
  const related = relatedProjects(allProjects, item).slice(0, 3);
  const base = canonicalBase(seo);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.summary || undefined,
    image: cover || undefined,
    url: base ? `${base}/portfolio/${item.slug}` : `/portfolio/${item.slug}`,
    datePublished: item.published_at || undefined,
    genre: item.attributes.project_type || undefined,
    keywords: [...services, ...technologies].join(", ") || undefined,
    creator: { "@type": "Organization", name: "LogicSphere Inc" },
  };

  return (
    <main id="main" className="public-page case-study">
      <StructuredData data={structuredData} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Work", path: "/portfolio" },
          { name: item.title, path: `/portfolio/${item.slug}` },
        ]}
      />
      <header className="case-heading">
        <Link href="/portfolio" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" /> All work
        </Link>
        <p className="eyebrow">
          CASE STUDY /{" "}
          {String(
            item.attributes.project_type ||
              item.attributes.industry ||
              "SELECTED WORK",
          ).toUpperCase()}
        </p>
        <h1>
          {item.title}
          <em>.</em>
        </h1>
        {item.summary && <p className="detail-lead">{item.summary}</p>}
        <div className="case-meta">
          {typeof item.attributes.client === "string" &&
            item.attributes.client.trim() && (
              <Meta label="CLIENT" value={item.attributes.client} />
            )}
          {typeof item.attributes.industry === "string" &&
            item.attributes.industry.trim() && (
              <Meta label="INDUSTRY" value={item.attributes.industry} />
            )}
          {services.length > 0 && (
            <Meta label="SERVICES" value={services.join(" · ")} />
          )}
          {technologies.length > 0 && (
            <Meta
              label="TECHNOLOGY"
              value={technologies.slice(0, 4).join(" · ")}
            />
          )}
        </div>
        <a className="case-scroll-cue" href="#case-overview">
          Explore the project <ArrowDown size={15} aria-hidden="true" />
        </a>
      </header>

      <figure className={`case-cover${cover ? " has-project-image" : ""}`}>
        {cover ? (
          <Image
            src={cover}
            alt={
              item.media.find((media) => media.public_url === cover)
                ?.alt_text || item.title
            }
            fill
            sizes="100vw"
            priority
          />
        ) : leadVideo?.public_url ? (
          <video
            src={leadVideo.public_url}
            controls
            playsInline
            preload="metadata"
            aria-label={leadVideo.alt_text || `${item.title} project video`}
          />
        ) : (
          <div className="case-visual-placeholder" aria-hidden="true">
            <span>{String(item.attributes.project_type || "PROJECT")}</span>
            <i />
            <b />
            <small>PROJECT / VISUALS PENDING</small>
          </div>
        )}
        <figcaption>
          <span>
            PROJECT /{" "}
            {String(
              item.attributes.industry ||
                item.attributes.project_type ||
                "CASE STUDY",
            ).toUpperCase()}
          </span>
          <span>{item.title}</span>
        </figcaption>
      </figure>

      <div className="case-story-shell" id="case-overview">
        <aside className="case-story-index" aria-label="Case study sections">
          <span className="eyebrow">IN THIS STORY</span>
          <a href="#overview">Overview</a>
          {chapters.map((chapter) => (
            <a key={chapter.id} href={`#${chapter.id}`}>
              {chapter.title}
            </a>
          ))}
          {features.length > 0 && <a href="#features">Key features</a>}
          {(technologies.length > 0 || services.length > 0) && (
            <a href="#stack">Services & technology</a>
          )}
          {gallery.length > 0 && <a href="#gallery">Project media</a>}
        </aside>
        <div className="case-story" id="overview">
          <section className="case-overview">
            <p className="eyebrow">PROJECT OVERVIEW / 01</p>
            <h2>{item.title}</h2>
            {plainText(item.body) ? (
              <RichBody value={item.body} />
            ) : (
              item.summary && <p>{item.summary}</p>
            )}
            {projectUrl && (
              <a
                className="text-link"
                href={projectUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit project <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </section>

          {chapters.map((chapter, index) => (
            <section
              className={`case-chapter case-chapter-${chapter.id}`}
              id={chapter.id}
              key={chapter.id}
            >
              <span className="case-chapter-index">0{index + 2}</span>
              <div>
                <p className="eyebrow">{chapter.title.toUpperCase()}</p>
                <RichBody value={chapter.value} />
              </div>
            </section>
          ))}

          {features.length > 0 && (
            <section className="case-features" id="features">
              <p className="eyebrow">BUILT INTO THE EXPERIENCE</p>
              <h2>Key features</h2>
              <ul>
                {features.map((feature, index) => (
                  <li key={`${feature}-${index}`}>
                    <span>0{index + 1}</span>
                    {feature}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(services.length > 0 || technologies.length > 0) && (
            <section className="case-stack" id="stack">
              {services.length > 0 && (
                <div>
                  <p className="eyebrow">SERVICES</p>
                  <div className="case-tags">
                    {services.map((service) => (
                      <span key={service}>{service}</span>
                    ))}
                  </div>
                </div>
              )}
              {technologies.length > 0 && (
                <div>
                  <p className="eyebrow">TECHNOLOGY</p>
                  <div className="case-tags">
                    {technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {gallery.length > 0 && (
        <section
          className="case-gallery"
          id="gallery"
          aria-label="Project gallery"
        >
          <div className="case-gallery-heading">
            <p className="eyebrow">PROJECT MEDIA / SELECTED VIEWS</p>
            <span>{String(gallery.length).padStart(2, "0")} ASSETS</span>
          </div>
          <div className="case-gallery-grid">
            {gallery.map((media, index) =>
              media.mime_type.startsWith("video/") ? (
                <figure
                  className="case-gallery-media case-gallery-video"
                  key={media.id}
                >
                  <video
                    src={media.public_url!}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={
                      media.alt_text ||
                      `${item.title} project video ${index + 1}`
                    }
                  />
                  {media.alt_text && <figcaption>{media.alt_text}</figcaption>}
                </figure>
              ) : (
                <figure className="case-gallery-media" key={media.id}>
                  <Image
                    src={media.public_url!}
                    alt={
                      media.alt_text ||
                      `${item.title} project view ${index + 1}`
                    }
                    fill
                    sizes="(max-width: 720px) 100vw, 80vw"
                    loading="lazy"
                  />
                  {media.alt_text && <figcaption>{media.alt_text}</figcaption>}
                </figure>
              ),
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="related-projects section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONTINUE EXPLORING / PUBLISHED WORK</p>
              <h2>
                More from the <em>portfolio.</em>
              </h2>
            </div>
            <Link className="text-link" href="/portfolio">
              All projects <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="record-grid project-grid">
            {related.map((project, index) => (
              <RecordCard
                key={project.id}
                item={project}
                href={`/portfolio/${project.slug}`}
                index={index}
                kind="project"
              />
            ))}
          </div>
        </section>
      )}

      <section className="page-bottom-cta case-bottom-cta">
        <p className="eyebrow">HAVE A SIMILAR CHALLENGE?</p>
        <h2>
          Let’s build your
          <br />
          <em>next chapter.</em>
        </h2>
        <Link className="button" href="/contact">
          Start a project <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label}
      <strong>{value}</strong>
    </span>
  );
}

function relatedProjects(projects: PublicRecord[], current: PublicRecord) {
  const currentIndustry = String(
    current.attributes.industry || "",
  ).toLocaleLowerCase();
  const currentType = String(
    current.attributes.project_type || "",
  ).toLocaleLowerCase();
  return projects
    .filter((project) => project.id !== current.id)
    .sort((left, right) => {
      const leftScore =
        Number(
          Boolean(
            currentIndustry &&
            String(left.attributes.industry || "").toLocaleLowerCase() ===
              currentIndustry,
          ),
        ) +
        Number(
          Boolean(
            currentType &&
            String(left.attributes.project_type || "").toLocaleLowerCase() ===
              currentType,
          ),
        );
      const rightScore =
        Number(
          Boolean(
            currentIndustry &&
            String(right.attributes.industry || "").toLocaleLowerCase() ===
              currentIndustry,
          ),
        ) +
        Number(
          Boolean(
            currentType &&
            String(right.attributes.project_type || "").toLocaleLowerCase() ===
              currentType,
          ),
        );
      return (
        rightScore - leftScore || Number(right.featured) - Number(left.featured)
      );
    });
}
