
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

type DottedGlowBackgroundProps = {
  className?: string;
  gap?: number;
  radius?: number;
  color?: string;
  glowColor?: string;
  opacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
};

export default function DottedGlowBackground({
  className,
  gap = 16,
  radius = 1.2,
  color = "rgba(255,255,255,0.06)",
  glowColor = "rgba(6, 182, 212, 0.4)",
  opacity = 1,
  speedMin = 0.2,
  speedMax = 0.8,
  speedScale = 0.5,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const ctx = el.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      el.width = Math.max(1, Math.floor(width * dpr));
      el.height = Math.max(1, Math.floor(height * dpr));
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    setTimeout(resize, 0);

    let dots: { x: number; y: number; phase: number; speed: number; layer: number }[] = [];

    const regenDots = () => {
      dots = [];
      const { width, height } = container.getBoundingClientRect();
      const cols = Math.ceil(width / gap) + 4;
      const rows = Math.ceil(height / gap) + 4;
      for (let i = -2; i < cols; i++) {
        for (let j = -2; j < rows; j++) {
          const layer = Math.random(); // 0 to 1 depth layering
          dots.push({
            x: i * gap + (j % 2 === 0 ? 0 : gap * 0.5),
            y: j * gap,
            phase: Math.random() * Math.PI * 2,
            speed: speedMin + Math.random() * (speedMax - speedMin),
            layer,
          });
        }
      }
    };

    regenDots();
    window.addEventListener("resize", regenDots);

    const draw = (now: number) => {
      if (stopped) return;
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const time = (now / 1000) * speedScale;

      dots.forEach((d) => {
        // Multi-layered movement logic
        const drift = time * d.speed * (d.layer * 0.5 + 0.5);
        const curX = (d.x + drift * 10) % (width + gap * 2) - gap;
        const curY = (d.y + drift * 5) % (height + gap * 2) - gap;
        
        const mod = (time * d.speed + d.phase) % 2;
        const lin = mod < 1 ? mod : 2 - mod;
        const intensity = 0.1 + 0.9 * (lin * lin);

        ctx.beginPath();
        ctx.arc(curX, curY, radius * (d.layer * 0.8 + 0.2), 0, Math.PI * 2);
        
        if (intensity > 0.85) {
           ctx.fillStyle = glowColor;
           ctx.shadowColor = glowColor;
           ctx.shadowBlur = 6 * (intensity - 0.85) * 4;
        } else {
           ctx.fillStyle = color;
           ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = opacity * (0.1 + intensity * d.layer * 0.4); 
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", regenDots);
      ro.disconnect();
    };
  }, [gap, radius, color, glowColor, opacity, speedMin, speedMax, speedScale]);

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
