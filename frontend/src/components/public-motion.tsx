"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublicMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-ready");
    let frame = 0;
    const reveal = (root: ParentNode = document) => {
      const elements = root.querySelectorAll<HTMLElement>(
        "main > section:not(.home-hero), main > article, .case-heading, .case-cover, .case-overview, .case-chapter, .case-features, .case-gallery-media, .record-card, .capability-tile, .process-timeline > li, .why-capabilities > a, .case-study-list > a, .testimonial-band figure, .tech-rail > span, [data-count]",
      );
      elements.forEach((element) => {
        if (element.dataset.revealReady) return;
        element.dataset.revealReady = "true";
        element.dataset.reveal = "";
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight * 0.94) {
          show(element);
        } else {
          observer.observe(element);
        }
      });
    };
    const show = (element: HTMLElement) => {
      element.classList.add("is-visible");
      observer.unobserve(element);
      if (!element.dataset.count || element.dataset.countAnimated) return;

      element.dataset.countAnimated = "true";
      const end = Number(element.dataset.count);
      const startedAt = performance.now();
      const count = (time: number) => {
        const progress = Math.min(1, (time - startedAt) / 760);
        const eased = 1 - (1 - progress) ** 4;
        element.textContent = String(Math.round(end * eased)).padStart(2, "0");
        if (progress < 1) requestAnimationFrame(count);
      };
      requestAnimationFrame(count);
    };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target instanceof HTMLElement) show(entry.target);
        }),
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    const revealInViewport = () => {
      frame = 0;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.bottom > 0 && bounds.top < window.innerHeight * 0.94)
            show(element);
        });
    };
    const scheduleViewportCheck = () => {
      if (!frame) frame = requestAnimationFrame(revealInViewport);
    };
    reveal();
    scheduleViewportCheck();
    const mutations = new MutationObserver(() => reveal());
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", scheduleViewportCheck, { passive: true });
    window.addEventListener("resize", scheduleViewportCheck, { passive: true });

    const onPointerMove = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        !matchMedia("(hover: hover)").matches
      )
        return;
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        ".button, .round-link",
      );
      if (!target) return;
      const bounds = target.getBoundingClientRect();
      target.style.setProperty(
        "--magnetic-x",
        `${Math.max(-4, Math.min(4, (event.clientX - (bounds.left + bounds.width / 2)) * 0.08))}px`,
      );
      target.style.setProperty(
        "--magnetic-y",
        `${Math.max(-4, Math.min(4, (event.clientY - (bounds.top + bounds.height / 2)) * 0.08))}px`,
      );
    };
    const resetMagnet = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        ".button, .round-link",
      );
      target?.style.setProperty("--magnetic-x", "0px");
      target?.style.setProperty("--magnetic-y", "0px");
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", resetMagnet, { passive: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("motion-ready");
      window.removeEventListener("scroll", scheduleViewportCheck);
      window.removeEventListener("resize", scheduleViewportCheck);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", resetMagnet);
    };
  }, [pathname]);

  return null;
}
