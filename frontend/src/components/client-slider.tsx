"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, ImageIcon } from "lucide-react";
import type { PublicRecord } from "@/lib/public-content";
import "./client-slider.css";

export function ClientSlider({ clients }: { clients: PublicRecord[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [motionDisabled, setMotionDisabled] = useState(false);
  const preview = clients.length === 0;

  function move(direction: number) {
    const element = rail.current;
    if (!element) return;
    const end = element.scrollWidth - element.clientWidth;
    const step =
      (element.firstElementChild?.getBoundingClientRect().width ?? 220) + 16;
    const target =
      direction > 0 && element.scrollLeft >= end - 2
        ? 0
        : direction < 0 && element.scrollLeft <= 2
          ? end
          : element.scrollLeft + direction * step;
    element.scrollTo({
      left: target,
      behavior: motionDisabled ? "instant" : "smooth",
    });
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () =>
      setMotionDisabled(
        media.matches || document.documentElement.dataset.motion === "paused",
      );
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("ls-motion", sync);
    const observer = new ResizeObserver(() => {
      if (rail.current)
        setOverflow(rail.current.scrollWidth > rail.current.clientWidth + 2);
    });
    if (rail.current) observer.observe(rail.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      window.removeEventListener("ls-motion", sync);
    };
  }, []);

  useEffect(() => {
    if (paused || motionDisabled || !overflow) return;
    let frame = 0;
    let last = 0;
    let position = rail.current?.scrollLeft ?? 0;
    const tick = (time: number) => {
      const element = rail.current;
      if (element) {
        const bounds = element.getBoundingClientRect();
        if (
          !document.hidden &&
          bounds.bottom > 0 &&
          bounds.top < window.innerHeight
        ) {
          const loop = (element.scrollWidth - 4 + 16) / 2;
          position =
            (position + Math.min(time - (last || time), 50) * 0.035) % loop;
          element.scrollLeft = position;
        }
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, motionDisabled, overflow]);

  return (
    <section
      className="client-showcase"
      aria-labelledby="client-heading"
      aria-roledescription="carousel"
    >
      <div className="client-showcase-heading">
        <div>
          <p className="eyebrow">CONNECTIONS THAT MATTER</p>
          <h2 id="client-heading">
            Our <em>clients.</em>
          </h2>
          {preview && (
            <p className="client-preview-note">
              Client showcase preview · Logos coming soon.
            </p>
          )}
        </div>
        {overflow && (
          <div className="client-slider-controls">
            <button
              type="button"
              aria-label="Previous clients"
              aria-controls="client-logos"
              onClick={() => {
                setPaused(true);
                move(-1);
              }}
            >
              <ArrowLeft size={18} />
            </button>
            {!motionDisabled && (
              <button
                type="button"
                aria-label={
                  paused ? "Play client slider" : "Pause client slider"
                }
                aria-pressed={paused}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            )}
            <button
              type="button"
              aria-label="Next clients"
              aria-controls="client-logos"
              onClick={() => {
                setPaused(true);
                move(1);
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      <ul
        id="client-logos"
        className={`client-logo-track${motionDisabled ? " client-motion-disabled" : ""}`}
        ref={rail}
        tabIndex={0}
        aria-label={preview ? "Client logo placeholders" : "Client logos"}
        onPointerDown={() => setPaused(true)}
        onKeyDown={() => setPaused(true)}
      >
        {preview
          ? Array.from({ length: 16 }, (_, index) => (
              <li
                className="client-logo-card client-logo-placeholder"
                key={index}
                aria-hidden={index >= 8 ? true : undefined}
                data-copy={index >= 8 ? "true" : undefined}
              >
                <ImageIcon size={28} aria-hidden="true" />
                <span>Client logo</span>
                <small>
                  PLACEHOLDER {String((index % 8) + 1).padStart(2, "0")}
                </small>
              </li>
            ))
          : [...clients, ...clients].map((client, index) => {
              const logo = client.media.find(
                (media) =>
                  media.mime_type.startsWith("image/") && media.public_url,
              );
              return (
                <li
                  className="client-logo-card"
                  key={`${client.id}-${index}`}
                  aria-hidden={index >= clients.length ? true : undefined}
                  data-copy={index >= clients.length ? "true" : undefined}
                >
                  {logo?.public_url ? (
                    <Image
                      src={logo.public_url}
                      alt={client.title}
                      width={logo.width || 180}
                      height={logo.height || 80}
                      sizes="180px"
                    />
                  ) : (
                    <span>{client.title}</span>
                  )}
                </li>
              );
            })}
      </ul>
    </section>
  );
}
