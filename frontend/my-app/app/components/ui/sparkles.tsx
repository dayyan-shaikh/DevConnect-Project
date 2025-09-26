"use client";
import React, { useEffect, useRef } from "react";

export function SparklesCore({
  background = "transparent",
  minSize = 0.5,
  maxSize = 1.2,
  particleDensity = 800,
  className,
  particleColor = "#FFFFFF",
}: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current as HTMLCanvasElement | null;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) return;

    let animationId: number;
    const dpr = window.devicePixelRatio || 1;

    const particles: { x: number; y: number; r: number; vx: number; vy: number }[] = [];

    function resize() {
      const { clientWidth, clientHeight } = canvasEl as HTMLCanvasElement;
      (canvasEl as HTMLCanvasElement).width = clientWidth * dpr;
      (canvasEl as HTMLCanvasElement).height = clientHeight * dpr;
      (ctx as CanvasRenderingContext2D).setTransform(1, 0, 0, 1, 0, 0);
      (ctx as CanvasRenderingContext2D).scale(dpr, dpr);
    }

    function init() {
      particles.length = 0;
      const area = (canvasEl as HTMLCanvasElement).clientWidth * (canvasEl as HTMLCanvasElement).clientHeight;
      const count = Math.max(50, Math.floor((area / 10000) * (particleDensity / 1000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (canvasEl as HTMLCanvasElement).clientWidth,
          y: Math.random() * (canvasEl as HTMLCanvasElement).clientHeight,
          r: Math.random() * (maxSize - minSize) + minSize,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
    }

    function step() {
      (ctx as CanvasRenderingContext2D).fillStyle = background as string;
      (ctx as CanvasRenderingContext2D).fillRect(0, 0, (canvasEl as HTMLCanvasElement).clientWidth, (canvasEl as HTMLCanvasElement).clientHeight);
      (ctx as CanvasRenderingContext2D).fillStyle = particleColor as string;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = (canvasEl as HTMLCanvasElement).clientWidth;
        if (p.x > (canvasEl as HTMLCanvasElement).clientWidth) p.x = 0;
        if (p.y < 0) p.y = (canvasEl as HTMLCanvasElement).clientHeight;
        if (p.y > (canvasEl as HTMLCanvasElement).clientHeight) p.y = 0;
        (ctx as CanvasRenderingContext2D).beginPath();
        (ctx as CanvasRenderingContext2D).arc(p.x, p.y, p.r, 0, Math.PI * 2);
        (ctx as CanvasRenderingContext2D).fill();
      });
      animationId = requestAnimationFrame(step);
    }

    resize();
    init();
    step();

    const onResize = () => {
      resize();
      init();
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [background, minSize, maxSize, particleDensity, particleColor]);

  return <canvas ref={canvasRef} className={className} />;
}
