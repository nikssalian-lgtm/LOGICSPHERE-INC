import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  getPublicRecord,
  getPublicRecords,
  getPublicSettings,
  plainText,
  coverImage,
} from "@/lib/public-content";
import { SectionHeading } from "@/components/public-ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "About LogicSphere Inc",
  "A technology and software development company building digital systems for modern businesses.",
  "/about",
);
export default async function AboutPage() {
  await requirePublicSection("/about");
  const [about, team, technologies, settings] = await Promise.all([
    getPublicRecord("pages", "about"),
    getPublicRecords("team"),
    getPublicRecords("technologies"),
    getPublicSettings("site"),
  ]);
  const title = about?.title ?? "A technology partner for what’s next.";
  return (
    <main id="main" className="public-page">
      <section className="about-hero page-intro">
        <p className="eyebrow">
          <span>04</span>ABOUT / LOGICSPHERE INC
        </p>
        <h1>
          {title.split(" ").slice(0, -2).join(" ")}{" "}
          <em>{title.split(" ").slice(-2).join(" ")}</em>
        </h1>
        <p className="page-intro-description">
          {about?.summary ??
            "LogicSphere Inc is a technology and software development company. We create custom software, business platforms, websites, e-commerce and mobile applications."}
        </p>
        <div className="about-graphic" aria-hidden="true">
          <span>LOGIC</span>
          <i />
          <i />
          <i />
          <b>SPHERE</b>
        </div>
      </section>
      <section className="about-statement section-wrap">
        <div>
          <p className="eyebrow">OUR POINT OF VIEW</p>
          <h2>
            Good technology
            <br />
            starts with <em>listening.</em>
          </h2>
        </div>
        <p>
          {plainText(about?.body) ||
            settings.company_statement ||
            "We bring clarity to complex requirements, then design and engineer digital systems that are reliable, useful and built to grow with your business."}
        </p>
      </section>
      <section className="about-values">
        <p className="eyebrow">HOW WE THINK</p>
        <div className="values-grid">
          {[
            [
              "01",
              "Understand the whole system",
              "We start with the people, processes and context behind the brief.",
            ],
            [
              "02",
              "Design for everyday use",
              "A product must make sense to the people who rely on it.",
            ],
            [
              "03",
              "Build for the long term",
              "Clear architecture makes room for the next requirement.",
            ],
            [
              "04",
              "Stay accountable",
              "Useful collaboration means communicating clearly at every step.",
            ],
          ].map(([no, title, copy]) => (
            <article key={no}>
              <span>{no}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      {technologies.length > 0 && (
        <section className="section-wrap about-tech">
          <SectionHeading
            eyebrow="TECHNOLOGY / PRACTICAL BY DESIGN"
            title={
              <>
                The right tools
                <br />
                for the <em>job.</em>
              </>
            }
          />
          <div className="technology-cloud">
            {technologies.map((item) => (
              <span key={item.id}>
                {String(item.attributes.mark ?? item.title)}
                <small>{String(item.attributes.category ?? "")}</small>
              </span>
            ))}
          </div>
        </section>
      )}
      {team.length > 0 && (
        <section className="section-wrap about-team">
          <SectionHeading
            eyebrow="PEOPLE / OUR TEAM"
            title={
              <>
                Good work is
                <br />
                <em>made together.</em>
              </>
            }
          />
          <div className="team-grid">
            {team.map((item) => {
              const photo = coverImage(item);
              return (
                <article key={item.id}>
                  {photo ? (
                    <Image
                      src={photo}
                      alt={
                        item.media.find((m) => m.public_url === photo)
                          ?.alt_text ?? item.title
                      }
                      width={
                        item.media.find((m) => m.public_url === photo)?.width ||
                        900
                      }
                      height={
                        item.media.find((m) => m.public_url === photo)
                          ?.height || 900
                      }
                      sizes="(max-width: 720px) 50vw, 25vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="team-initial" aria-hidden="true">
                      {item.title
                        .split(" ")
                        .map((v) => v[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                  <h3>{item.title}</h3>
                  <p>{String(item.attributes.position ?? "")}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <section className="page-bottom-cta">
        <p className="eyebrow">BUILD WITH LOGICSPHERE</p>
        <h2>
          Let’s solve something
          <br />
          <em>that matters.</em>
        </h2>
        <Link href="/contact" className="button">
          Get in touch <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
