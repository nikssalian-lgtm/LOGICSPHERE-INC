"use client";

import { useEffect, useRef } from "react";

/** Procedural ribbon sculpture: no video download, geometry follows native scroll. */
export function DigitalSculpture({ scroll = false }: { scroll?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      visible = true,
      width = 1,
      height = 1,
      rotation = 0,
      previous = 0;
    const stopped = () =>
      reduced.matches || document.documentElement.dataset.motion === "paused";
    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!stopped()) rotation += Math.min(time - previous, 40) * 0.00013;
      previous = time;
      const section = canvas.closest("section");
      const rect = section?.getBoundingClientRect();
      const progress = stopped()
        ? 0.25
        : scroll && rect
          ? Math.max(
              0,
              Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)),
            )
          : Math.min(1, window.scrollY / innerHeight);
      canvas.parentElement?.style.setProperty(
        "--sculpture-progress",
        String(progress),
      );
      ctx.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.theme === "light";
      const size = Math.min(width, height) * 0.31;
      const angle = rotation + progress * 2.6;
      const tilt = 0.5 + progress * 0.8;
      const paths: { points: number[][]; depth: number; band: number }[] = [];
      const bands = width < 500 ? 54 : 88;
      for (let band = 0; band < bands; band++) {
        const u = (band / bands) * Math.PI * 2;
        const points: number[][] = [];
        let depth = 0;
        for (let step = 0; step <= 96; step++) {
          const v = (step / 96) * Math.PI * 2;
          const tube = 0.37 + 0.1 * Math.sin(v * 3 + progress * 5);
          const radius = 1 + tube * Math.cos(u + v * 2);
          const x = radius * Math.cos(v),
            y = radius * Math.sin(v),
            z = tube * Math.sin(u + v * 2);
          const rx = x * Math.cos(angle) - z * Math.sin(angle);
          const rz = x * Math.sin(angle) + z * Math.cos(angle);
          const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
          const dz = y * Math.sin(tilt) + rz * Math.cos(tilt);
          const perspective = 3.6 / (3.6 - dz);
          points.push([
            width / 2 + rx * size * perspective,
            height / 2 + ry * size * perspective,
          ]);
          depth += dz;
        }
        paths.push({ points, depth: depth / 97, band });
      }
      paths.sort((a, b) => a.depth - b.depth);
      for (const path of paths) {
        const shine =
          (Math.sin((path.band / bands) * Math.PI * 2 + angle) + 1) / 2;
        ctx.strokeStyle = light
          ? `rgba(0,${90 + shine * 65},${140 + shine * 65},${0.28 + shine * 0.6})`
          : `rgba(${25 + shine * 150},${135 + shine * 110},255,${0.2 + shine * 0.68})`;
        ctx.lineWidth = shine > 0.9 ? 1.6 : 0.8;
        ctx.beginPath();
        path.points.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.stroke();
      }
      if (!stopped()) frame = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start();
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    });
    observer.observe(canvas);
    const theme = new MutationObserver(start);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-motion"],
    });
    reduced.addEventListener("change", start);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      theme.disconnect();
      reduced.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, [scroll]);
  return <canvas className="digital-sculpture" ref={ref} aria-hidden="true" />;
}
