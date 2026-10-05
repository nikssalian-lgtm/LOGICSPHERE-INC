"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NetworkSphere } from "@/components/network-sphere";
import type { PublicRecord } from "@/lib/public-content";

const labels = [
  "CONNECTED SYSTEMS",
  "BUSINESS SOFTWARE",
  "DIGITAL PRODUCTS",
  "INDUSTRY CONTEXT",
];

export function CinematicJourney({
  projects,
  industries,
}: {
  projects: PublicRecord[];
  industries: PublicRecord[];
}) {
  const [active, setActive] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = stepsRef.current?.querySelectorAll<HTMLElement>(
      "[data-journey-step]",
    );
    if (
      !nodes?.length ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(
              Number((entry.target as HTMLElement).dataset.journeyStep),
            );
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const featured = projects.find((project) => project.featured);
  const projectImage = featured?.media.find(
    (media) => media.mime_type.startsWith("image/") && media.public_url,
  );
  const projectImageUrl = projectImage?.public_url ?? undefined;

  return (
    <section className="cinematic-journey" aria-labelledby="journey-title">
      <div className="journey-heading">
        <p className="eyebrow">ONE CONNECTED DIGITAL STORY / 04</p>
        <h2 id="journey-title">
          From connected systems
          <br />
          to <em>real-world context.</em>
        </h2>
        <p>
          Ideas take shape as software, products and experiences designed around
          the work people need to do.
        </p>
      </div>
      <div className="journey-layout" ref={stepsRef}>
        <div className="journey-steps">
          {labels.map((label, index) => (
            <article
              key={label}
              data-journey-step={index}
              className={active === index ? "is-active" : ""}
            >
              <span>
                0{index + 1} / {label}
              </span>
              <h3>
                {
                  [
                    "A network of business needs.",
                    "Workflows become connected.",
                    "Systems become useful products.",
                    "Technology meets its context.",
                  ][index]
                }
              </h3>
              <p>
                {
                  [
                    "ERP, CRM, POS, commerce, mobile and web each connect people, information and daily operations.",
                    "Purpose-built platforms bring sales, inventory, customers and teams into clearer view.",
                    "Every engagement is shaped by the requirements and content shared for that project.",
                    "Explore industries and published work to see how digital systems can fit different environments.",
                  ][index]
                }
              </p>
              {index === 2 && featured && (
                <Link
                  href={`/portfolio/${featured.slug}`}
                  className="text-link"
                >
                  Explore selected work <ArrowUpRight size={16} />
                </Link>
              )}
              {index === 3 && (
                <Link href="/industries" className="text-link">
                  Explore industries <ArrowUpRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className={`journey-visual scene-${active}`} aria-live="off">
          <div
            className="journey-scene scene-network"
            aria-hidden={active !== 0}
          >
            <NetworkSphere />
            <div className="journey-hub">
              LS<span>CONNECTED DIGITAL</span>
            </div>
            {["ERP", "CRM", "POS", "WEB", "COMMERCE", "MOBILE"].map(
              (label, index) => (
                <span
                  key={label}
                  className={`journey-node journey-node-${index}`}
                >
                  {label}
                </span>
              ),
            )}
          </div>
          <div
            className="journey-scene scene-systems"
            aria-hidden={active !== 1}
          >
            <div className="system-window">
              <div className="system-bar">
                <i />
                <i />
                <i />
                <span>OPERATIONS / OVERVIEW</span>
              </div>
              <div className="system-content">
                <aside>
                  <b />
                  <b />
                  <b />
                  <b />
                </aside>
                <div className="system-main">
                  <div className="system-kpis">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="system-chart">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="system-rows">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            </div>
            <span className="scene-caption">BUSINESS SYSTEMS / CONNECTED</span>
          </div>
          <div
            className="journey-scene scene-project"
            aria-hidden={active !== 2}
          >
            <div className="project-window">
              {projectImageUrl ? (
                <Image
                  src={projectImageUrl}
                  alt={
                    projectImage?.alt_text ||
                    featured?.title ||
                    "Published project"
                  }
                  width={1200}
                  height={760}
                  sizes="(max-width: 760px) 82vw, 48vw"
                  loading="lazy"
                />
              ) : (
                <div className="project-placeholder">
                  <NetworkSphere />
                  <span>PRODUCT / CONCEPT VISUAL</span>
                </div>
              )}
              <div className="project-window-caption">
                <span>{featured?.title || "An idea in context"}</span>
                <small>
                  {featured ? "PUBLISHED PROJECT" : "ILLUSTRATIVE CONCEPT"}
                </small>
              </div>
            </div>
          </div>
          <div
            className="journey-scene scene-industry"
            aria-hidden={active !== 3}
          >
            <div className="industry-constellation">
              <div>
                TECHNOLOGY
                <br />
                <em>IN CONTEXT</em>
              </div>
              {(industries.length
                ? industries.slice(0, 6).map((item) => item.title)
                : [
                    "MANUFACTURING",
                    "HEALTHCARE",
                    "RETAIL",
                    "LOGISTICS",
                    "EDUCATION",
                    "FINANCE",
                  ]
              ).map((label, index) => (
                <span
                  key={label}
                  className={`industry-orbit industry-orbit-${index}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="journey-progress" aria-hidden="true">
            {labels.map((label, index) => (
              <span
                key={label}
                className={active === index ? "is-active" : ""}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
