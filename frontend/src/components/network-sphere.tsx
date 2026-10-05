"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; z: number };
type Edge = readonly [number, number];

const createPoints = (count: number): Point[] =>
  Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = Math.PI * (3 - Math.sqrt(5)) * index;
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });

const connect = (nodes: Point[], degree: number): Edge[] => {
  const found = new Set<string>();
  const result: Edge[] = [];
  nodes.forEach((point, index) => {
    const nearby = nodes
      .map((other, otherIndex) => ({
        index: otherIndex,
        distance:
          (point.x - other.x) ** 2 +
          (point.y - other.y) ** 2 +
          (point.z - other.z) ** 2,
      }))
      .filter((other) => other.index !== index)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, degree);
    nearby.forEach(({ index: otherIndex }) => {
      const key = `${Math.min(index, otherIndex)}:${Math.max(index, otherIndex)}`;
      if (!found.has(key)) {
        found.add(key);
        result.push([index, otherIndex]);
      }
    });
  });
  return result;
};

const points = createPoints(88);
const edges = connect(points, 4);
const mobilePoints = createPoints(40);
const mobileEdges = connect(mobilePoints, 2);

export function NetworkSphere({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!canvas || !context) return;

    const scene = canvas.closest<HTMLElement>(".journey-scene");
    const sceneIsActive = () =>
      !scene || scene.getAttribute("aria-hidden") !== "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px)");
    let width = 1;
    let height = 1;
    let scale = 1;
    let visible = false;
    let frameId = 0;
    let lastFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let rotation = 0;
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--brand-cyan-rgb")
        .trim() || "0 175 239";

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      scale = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1 : 1.5);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw(performance.now(), false);
    };

    const draw = (time: number, animate: boolean) => {
      const light = document.documentElement.dataset.theme === "light";
      const lineColor = light ? "0 100 140" : accent;
      context.clearRect(0, 0, width, height);
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      if (animate) rotation += mobile.matches ? 0.0018 : 0.0024;

      const yaw = rotation + pointerX * 0.26;
      const pitch = pointerY * 0.2 + Math.sin(rotation * 0.72) * 0.035;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const radius = Math.min(width, height) * 0.44;
      const focalLength = 3.25;
      const graphPoints = mobile.matches ? mobilePoints : points;
      const graphEdges = mobile.matches ? mobileEdges : edges;
      const projected = graphPoints.map((point) => {
        const rotatedX = point.x * cosYaw - point.z * sinYaw;
        const rotatedZ = point.x * sinYaw + point.z * cosYaw;
        const rotatedY = point.y * cosPitch - rotatedZ * sinPitch;
        const depth = point.y * sinPitch + rotatedZ * cosPitch;
        const perspective = focalLength / (focalLength - depth * 0.48);
        return {
          x: width * 0.5 + rotatedX * radius * perspective,
          y: height * 0.5 + rotatedY * radius * perspective,
          depth,
          perspective,
        };
      });

      const lineGroups: Edge[][] = [[], [], [], []];
      for (const [startIndex, endIndex] of graphEdges) {
        const start = projected[startIndex];
        const end = projected[endIndex];
        const depth = (start.depth + end.depth) * 0.5;
        if (depth < -0.5) continue;
        const group = Math.min(3, Math.floor((depth + 1) * 2));
        lineGroups[group].push([startIndex, endIndex]);
      }
      context.lineWidth = light ? 1.1 : 0.7;
      lineGroups.forEach((group, index) => {
        if (!group.length) return;
        context.beginPath();
        group.forEach(([startIndex, endIndex]) => {
          context.moveTo(projected[startIndex].x, projected[startIndex].y);
          context.lineTo(projected[endIndex].x, projected[endIndex].y);
        });
        context.strokeStyle = `rgb(${lineColor} / ${light ? 0.22 + index * 0.1 : 0.045 + index * 0.04})`;
        context.stroke();
      });

      const particleGroups: Array<
        Array<{ point: (typeof projected)[number]; index: number }>
      > = [[], [], []];
      projected.forEach((point, index) => {
        const visibility = Math.max(0.18, (point.depth + 1.15) / 2.15);
        particleGroups[Math.min(2, Math.floor(visibility * 3))].push({
          point,
          index,
        });
      });
      particleGroups.forEach((group, groupIndex) => {
        if (!group.length) return;
        context.beginPath();
        group.forEach(({ point, index }) => {
          const particleRadius =
            (index % 13 === 0 ? 1.8 : 1.05) * point.perspective;
          context.moveTo(point.x + particleRadius, point.y);
          context.arc(point.x, point.y, particleRadius, 0, Math.PI * 2);
        });
        context.fillStyle = `rgb(${lineColor} / ${light ? 0.65 + groupIndex * 0.16 : 0.22 + groupIndex * 0.26})`;
        context.fill();
      });

      if (animate) {
        context.beginPath();
        const packetCount = mobile.matches ? 2 : 5;
        for (let packet = 0; packet < packetCount; packet++) {
          const [startIndex, endIndex] =
            graphEdges[(packet * 17) % graphEdges.length];
          const progress = ((time * 0.00008 + packet * 0.217) % 1) as number;
          const start = projected[startIndex];
          const end = projected[endIndex];
          const x = start.x + (end.x - start.x) * progress;
          const y = start.y + (end.y - start.y) * progress;
          context.moveTo(x + 1.7, y);
          context.arc(x, y, 1.7, 0, Math.PI * 2);
        }
        context.fillStyle = `rgb(${lineColor} / 0.95)`;
        context.fill();
      }
    };

    const tick = (time: number) => {
      frameId = 0;
      if (!visible || document.hidden) return;
      const frameInterval = mobile.matches ? 42 : 32;
      if (time - lastFrame >= frameInterval) {
        draw(time, true);
        lastFrame = time;
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const start = () => {
      stop();
      if (
        !visible ||
        !sceneIsActive() ||
        document.hidden ||
        reducedMotion.matches ||
        document.documentElement.dataset.motion === "paused"
      ) {
        draw(performance.now(), false);
        return;
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        visible && sceneIsActive() ? start() : stop();
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);
    const sceneObserver = scene
      ? new MutationObserver(() => {
          if (!sceneIsActive()) {
            stop();
            return;
          }
          if (visible) start();
        })
      : null;
    sceneObserver?.observe(scene!, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => start();
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(start);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resizeObserver.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", resetPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    window.addEventListener("ls-motion", onMotionChange);
    mobile.addEventListener("change", resize);

    return () => {
      stop();
      observer.disconnect();
      sceneObserver?.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
      window.removeEventListener("ls-motion", onMotionChange);
      mobile.removeEventListener("change", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`network-sphere ${className}`}
      aria-hidden="true"
    />
  );
}
