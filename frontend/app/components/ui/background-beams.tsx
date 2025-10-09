"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({
  className,
  containerClassName,
}: {
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }[] = [];

    const init = () => {
      const container = containerRef.current;
      if (!container) return;

      const resizeCanvas = () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // Create particles
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `hsla(${Math.random() * 60 + 200}, 100%, 50%, ${Math.random() * 0.3 + 0.1})`,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;

          // Bounce off edges
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeCanvas);
      };
    };

    init();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 -z-10 h-full w-full overflow-hidden bg-neutral-950",
        containerClassName
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn("h-full w-full", className)}
      />
    </div>
  );
};
