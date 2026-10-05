"use client";

import { useEffect, useRef, useState } from "react";
import { DigitalSculpture } from "./digital-sculpture";

const chapters = [
  {
    title: "Complexity. Reimagined.",
    text: "Start with the way your business works. Connect the people, processes and possibilities.",
    label: "01 / DISCOVER",
    tags: ["Strategy", "Requirements", "Architecture"],
  },
  {
    title: "Every part. Connected.",
    text: "Bring software, commerce and operations together in one considered digital ecosystem.",
    label: "02 / ENGINEER",
    tags: ["ERP & CRM", "Integrations", "Custom software"],
  },
  {
    title: "Ideas. Made tangible.",
    text: "Turn your vision into a digital experience people can use, explore and build upon.",
    label: "03 / EXPERIENCE",
    tags: ["Web platforms", "Mobile apps", "Digital products"],
  },
];

export function ScrollExperience() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const progress = Math.max(
        0,
        Math.min(0.999, -rect.top / Math.max(1, rect.height - innerHeight)),
      );
      setActive(Math.floor(progress * 3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", sync);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <section
      className="scroll-experience"
      ref={ref}
      aria-label="From vision to digital experience"
    >
      <div className="experience-stage">
        <div className="experience-topline">
          <span>THE ART OF DIGITAL ENGINEERING</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
        <div className="experience-art">
          <DigitalSculpture scroll />
          <span className="art-coordinate">LOGIC / FORM / POSSIBILITY</span>
        </div>
        <div className="experience-copy">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.label}
              className={index === active ? "is-active" : ""}
              aria-hidden={!reduced && index !== active}
            >
              <p className="eyebrow">{chapter.label}</p>
              <h2>{chapter.title}</h2>
              <p>{chapter.text}</p>
              <div className="experience-tags">
                {chapter.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="experience-chapters">
          {chapters.map((chapter, index) => (
            <span
              key={chapter.label}
              className={index === active ? "is-active" : ""}
            >
              {chapter.label}
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
