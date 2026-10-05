import type { Metadata } from "next";
import { getPublicSections, isSectionVisible } from "@/lib/public-sections";
import { ClientSlider } from "@/components/client-slider";
import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import {
  getPublicRecord,
  getPublicRecords,
  getPublicSettings,
  plainText,
} from "@/lib/public-content";
import { RichBody } from "@/components/rich-body";
import { SolutionsShowcase } from "@/components/solutions-showcase";
import { ChannelShowcase } from "@/components/channel-showcase";
import { DigitalSculpture } from "@/components/digital-sculpture";
import { ScrollExperience } from "@/components/scroll-experience";
import { CinematicJourney } from "@/components/cinematic-journey";
import {
  EmptyEditorial,
  RecordCard,
  ScrollCue,
  SectionHeading,
} from "@/components/public-ui";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicSettings("seo");
  const title =
    seo.default_title || "Digital systems that move business forward";
  const description =
    seo.default_description ||
    "LogicSphere Inc designs and develops custom software, business platforms, websites, e-commerce experiences and mobile applications.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home() {
  const sections = await getPublicSections();
  const [
    services,
    solutions,
    projects,
    clients,
    testimonials,
    technologies,
    industries,
    introPage,
    processPage,
    whyPage,
    ctaPage,
    settings,
  ] = await Promise.all([
    getPublicRecords("services", "per_page=50"),
    getPublicRecords("solutions", "per_page=20"),
    getPublicRecords("portfolio", "per_page=30"),
    getPublicRecords("clients", "per_page=12&featured=1"),
    getPublicRecords("testimonials", "per_page=2&featured=1"),
    getPublicRecords("technologies", "per_page=24"),
    getPublicRecords("industries", "per_page=12"),
    getPublicRecord("pages", "homepage-introduction"),
    getPublicRecord("pages", "homepage-process"),
    getPublicRecord("pages", "why-logicsphere"),
    getPublicRecord("pages", "homepage-cta"),
    getPublicSettings("site"),
  ]);
  const heroTitle =
    settings.hero_headline || "Digital systems that move business forward.";
  const heroDescription =
    settings.hero_description ||
    "We design and build software, products and digital experiences for modern businesses.";
  const heroCta = settings.hero_primary_cta || "Start a project";
  const heroCtaUrl = settings.hero_primary_url || "/contact";
  const secondaryCta = settings.hero_secondary_cta || "Explore capabilities";
  const secondaryCtaUrl = settings.hero_secondary_url || "/services";
  return (
    <main id="main" className="public-home">
      <section className="home-hero">
        <div className="hero-background-grid" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="eyebrow">
              <span className="live-dot" />
              LOGICSPHERE INC <span className="eyebrow-divider">/</span> DIGITAL
              ENGINEERING
            </p>
            <h1>
              {heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
              <em>{heroTitle.split(" ").slice(-2).join(" ")}</em>
            </h1>
            <p className="home-hero-description">{heroDescription}</p>
            <div className="hero-actions">
              <Link href={heroCtaUrl} className="button">
                {heroCta}
                <ArrowUpRight size={16} />
              </Link>
              {isSectionVisible(secondaryCtaUrl, sections) && (
                <Link href={secondaryCtaUrl} className="button secondary">
                  {secondaryCta}
                  <MoveUpRight size={15} />
                </Link>
              )}
            </div>
            <div className="hero-proof">
              <span>SOFTWARE / DIGITAL EXPERIENCE</span>
              <i />
              <span>IDEA → IMPACT</span>
            </div>
          </div>
          <div className="hero-sculpture" aria-hidden="true">
            <div className="orb-halo" />
            <DigitalSculpture />
            <div className="sculpture-caption">
              <span className="live-dot" /> THE SHAPE OF POSSIBILITY{" "}
              <span>01 — ∞</span>
            </div>
            <div className="floating-label label-engineering">
              <span>01 / ENGINEERING</span>Built around your ambition.
              <i />
            </div>
            <div className="floating-label label-experience">
              <span>02 / EXPERIENCE</span>Designed to move you.
              <i />
            </div>
          </div>
        </div>
        <ScrollCue />
        <div className="hero-side-index">
          01 <span>—</span> 06
        </div>
      </section>
      <div
        className="capability-ribbon"
        aria-label="Software, platforms and digital experiences"
      >
        <div aria-hidden="true">
          {[0, 1].map((i) => (
            <span key={i}>
              CUSTOM SOFTWARE <b>✳</b> DIGITAL EXPERIENCES <b>✳</b> CONNECTED
              BUSINESS <b>✳</b> WEB & MOBILE <b>✳</b>{" "}
            </span>
          ))}
        </div>
      </div>
      <section className="intro-band" id="intro">
        <div className="intro-index">01 / THE PARTNERSHIP</div>
        <div className="intro-message">
          {introPage?.title && <h2>{introPage.title}</h2>}
          {plainText(introPage?.body) ? (
            <RichBody value={introPage?.body} />
          ) : (
            <p>
              {introPage?.summary ||
                "From a complex operational challenge to a customer-facing product, LogicSphere Inc brings software development and digital experience design together around your requirements."}
            </p>
          )}
        </div>
        {sections["/about"] && (
          <Link
            href="/about"
            className="round-link"
            aria-label="About LogicSphere"
          >
            <ArrowUpRight />
          </Link>
        )}
      </section>
      <ClientSlider clients={clients} />
      {sections["/services"] && (
        <section className="home-services section-wrap">
          <SectionHeading
            eyebrow="WHAT WE BUILD / 02"
            title={
              <>
                Technology made <em>useful.</em>
              </>
            }
            link="All capabilities"
            href="/services"
          />
          <div className="service-feature-grid">
            {services.length
              ? services
                  .slice(0, 4)
                  .map((item, i) => (
                    <RecordCard
                      key={item.id}
                      item={item}
                      href={`/services/${item.slug}`}
                      index={i}
                      kind="service"
                    />
                  ))
              : [
                  "Custom software",
                  "ERP · CRM · POS",
                  "Websites & e-commerce",
                  "Mobile applications",
                ].map((title, i) => (
                  <Link
                    href="/services"
                    className="capability-tile"
                    key={title}
                  >
                    <span>0{i + 1} / CAPABILITY</span>
                    <h3>{title}</h3>
                    <p>
                      Purpose-built digital systems aligned to the way your
                      business works.
                    </p>
                    <MoveUpRight size={18} />
                  </Link>
                ))}
          </div>
        </section>
      )}
      {sections["/solutions"] && (
        <>
          <section className="home-solution">
            <div className="solution-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="solution-copy">
              <p className="eyebrow">CONNECTED BUSINESS / 03</p>
              <h2>
                Better operations
                <br />
                start with a <em>clearer system.</em>
              </h2>
              <p>
                Bring essential workflows into focus with software shaped around
                your people, processes and goals.
              </p>
              <Link href="/solutions" className="text-link">
                Explore business solutions <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="solution-list">
              {(solutions.length
                ? solutions.slice(0, 4).map((item) => item.title)
                : [
                    "ERP platforms",
                    "Customer relationship systems",
                    "Point of sale",
                    "Operations & inventory",
                  ]
              ).map((label, i) => (
                <Link href="/solutions" key={label}>
                  <span>0{i + 1}</span>
                  {label}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
          <SolutionsShowcase solutions={solutions} />
        </>
      )}
      {sections["/services"] && <ChannelShowcase services={services} />}
      <ScrollExperience />
      {sections["/portfolio"] &&
        sections["/services"] &&
        sections["/solutions"] && (
          <CinematicJourney projects={projects} industries={industries} />
        )}
      {sections["/portfolio"] && (
        <section className="home-work section-wrap">
          <SectionHeading
            eyebrow="SELECTED WORK / 04"
            title={
              <>
                Made for the <em>real world.</em>
              </>
            }
            link="View portfolio"
            href="/portfolio"
          />
          {projects.filter((item) => item.featured).length ? (
            <div className="record-grid project-grid">
              {projects
                .filter((item) => item.featured)
                .slice(0, 3)
                .map((item, i) => (
                  <RecordCard
                    key={item.id}
                    item={item}
                    href={`/portfolio/${item.slug}`}
                    index={i}
                    kind="project"
                  />
                ))}
            </div>
          ) : (
            <EmptyEditorial
              title="The right work starts with your challenge."
              description="Project stories will appear here as approved work is ready to share. Until then, tell us what you’re looking to build."
              href="/contact"
              action="Start a conversation"
            />
          )}
        </section>
      )}
      {sections["/portfolio"] &&
        projects.some(
          (item) =>
            plainText(item.attributes.challenge) ||
            plainText(item.attributes.results),
        ) && (
          <section className="home-case-studies section-wrap">
            <SectionHeading
              eyebrow="CASE STUDIES / SELECTED STORIES"
              title={
                <>
                  The problem is the
                  <br />
                  <em>starting point.</em>
                </>
              }
              link="Explore the work"
              href="/portfolio"
            />
            <div className="case-study-list">
              {projects
                .filter(
                  (item) =>
                    plainText(item.attributes.challenge) ||
                    plainText(item.attributes.results),
                )
                .slice(0, 4)
                .map((item, i) => (
                  <Link key={item.id} href={`/portfolio/${item.slug}`}>
                    <span>0{i + 1}</span>
                    <div>
                      <small>
                        {String(item.attributes.industry || "CASE STUDY")}
                      </small>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                    <ArrowUpRight />
                  </Link>
                ))}
            </div>
          </section>
        )}
      <section className="process-section">
        <div className="process-inner">
          <div className="process-heading">
            <p className="eyebrow">A CLEAR PATH / HOW WE WORK</p>
            <h2>
              {processPage?.title || (
                <>
                  From first question
                  <br />
                  to <em>what’s next.</em>
                </>
              )}
            </h2>
            {processPage?.summary && <p>{processPage.summary}</p>}
          </div>
          <ol className="process-timeline">
            {[
              "Discovery",
              "Strategy",
              "UX/UI Design",
              "Development",
              "Testing",
              "Deployment",
              "Support & Optimization",
            ].map((step, i) => (
              <li key={step}>
                <span>0{i + 1}</span>
                <h3>{step}</h3>
              </li>
            ))}
          </ol>
          {plainText(processPage?.body) && (
            <div className="process-context">
              <RichBody value={processPage?.body} />
            </div>
          )}
        </div>
      </section>
      <section className="why-section section-wrap">
        <div className="why-heading">
          <p className="eyebrow">WHY LOGICSPHERE / A CONNECTED PARTNER</p>
          <h2>
            {whyPage?.title || (
              <>
                One brief.
                <br />
                <em>Connected disciplines.</em>
              </>
            )}
          </h2>
          {whyPage?.summary ? (
            <p>{whyPage.summary}</p>
          ) : (
            <p>
              Custom software, business systems and digital experiences can be
              planned together. Scope and delivery are shaped around the needs
              you share.
            </p>
          )}
          {plainText(whyPage?.body) && <RichBody value={whyPage?.body} />}
        </div>
        <div className="why-capabilities">
          {(services.length
            ? services.slice(0, 3).map((item) => ({
                title: item.title,
                copy: item.summary,
                href: `/services/${item.slug}`,
              }))
            : [
                {
                  title: "Custom business software",
                  copy: "ERP, CRM, POS and tailored business systems.",
                  href: "/solutions",
                },
                {
                  title: "Web & commerce experiences",
                  copy: "Websites and e-commerce development.",
                  href: "/services",
                },
                {
                  title: "Mobile applications",
                  copy: "Mobile application development and integrations.",
                  href: "/services",
                },
              ]
          )
            .filter((item) => isSectionVisible(item.href, sections))
            .map((item, i) => (
              <Link key={item.title} href={item.href}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))}
        </div>
      </section>
      {technologies.length > 0 && (
        <section className="home-tech section-wrap">
          <SectionHeading
            eyebrow="TECHNOLOGY / SELECTED TOOLKIT"
            title={
              <>
                Technology with
                <br />
                <em>a clear purpose.</em>
              </>
            }
            link={sections["/about"] ? "About LogicSphere" : undefined}
            href={sections["/about"] ? "/about" : undefined}
          />
          <div className="tech-rail">
            {technologies.slice(0, 12).map((item) => (
              <span key={item.id}>
                {String(item.attributes.mark || item.title)}
                <small>{String(item.attributes.category || "")}</small>
              </span>
            ))}
          </div>
        </section>
      )}
      {industries.length > 0 && (
        <section className="home-industries">
          <p className="eyebrow">INDUSTRIES / CONTEXT MATTERS</p>
          <div>
            {industries.map((item, i) => (
              <Link key={item.id} href={`/industries/${item.slug}`}>
                <span>0{i + 1}</span>
                {item.title}
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="testimonial-band">
          <p className="eyebrow">IN THEIR WORDS / CLIENT PERSPECTIVES</p>
          {testimonials.map((item) => (
            <figure key={item.id}>
              <blockquote>“{String(item.attributes.quote || "")}”</blockquote>
              <figcaption>
                {String(item.attributes.author_name || "")}
                {Boolean(item.attributes.author_role) && (
                  <span>
                    {String(item.attributes.author_role)}
                    {item.attributes.company
                      ? `, ${String(item.attributes.company)}`
                      : ""}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      <section className="home-closing">
        <p className="eyebrow">05 / READY WHEN YOU ARE</p>
        <h2>
          {ctaPage?.title || (
            <>
              Let’s build something
              <br />
              <em>that moves you forward.</em>
            </>
          )}
        </h2>
        {ctaPage?.summary && (
          <p className="home-closing-copy">{ctaPage.summary}</p>
        )}
        {plainText(ctaPage?.body) && <RichBody value={ctaPage?.body} />}
        <Link href="/contact" className="button">
          {String(
            ctaPage?.attributes.cta_label || heroCta || "Start a conversation",
          )}
          <ArrowUpRight size={16} />
        </Link>
        <div className="closing-coordinate">
          LOGICSPHERE INC
          <br />
          DIGITAL SYSTEMS / BUILT AROUND YOUR GOALS
        </div>
      </section>
    </main>
  );
}
