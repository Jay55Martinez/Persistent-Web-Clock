import { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

function hexToRgba(input: string, a: number) {
  const s = (input || '').trim();
  if (!s) return `rgba(255,255,255,${a})`;
  if (s.startsWith('rgba')) return s;
  if (s.startsWith('rgb')) return s.replace(/^rgb\(/, 'rgba(').replace(/\)$/, `, ${a})`);
  const hex = s.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex || 'ffffff';
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function ParticlesBackground({
  particleCount = 60,
  lineDistance = 120,
  opacity = 0.6,
}: {
  particleCount?: number;
  lineDistance?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

  let mounted = true;
  const dpr = window.devicePixelRatio || 1;
  // create non-null locals for use inside nested functions
  const canvasEl = canvas as HTMLCanvasElement;
  const context = ctx as CanvasRenderingContext2D;

    function resize() {
  const w = Math.max(1, Math.floor(canvasEl.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvasEl.clientHeight * dpr));
  canvasEl.width = w;
  canvasEl.height = h;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
  const w = canvasEl.clientWidth;
  const h = canvasEl.clientHeight;
      const arr: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 1 + Math.random() * 2,
        });
      }
      particlesRef.current = arr;
    }

    function getColor(): string {
      try {
        const root = getComputedStyle(document.documentElement);
        return (
          root.getPropertyValue('--color-primary') || root.getPropertyValue('--color-text') || '#ffffff'
        ).trim();
      } catch {
        return '#ffffff';
      }
    }

    const color = getColor();

    function step() {
      if (!mounted) return;
  const w = canvasEl.clientWidth;
  const h = canvasEl.clientHeight;
  if (canvasEl.width !== Math.floor(w * dpr) || canvasEl.height !== Math.floor(h * dpr)) resize();
  context.clearRect(0, 0, w, h);

      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < lineDistance) {
            const alpha = clamp(1 - dist / lineDistance, 0, 1) * 0.35 * opacity;
            context.strokeStyle = hexToRgba(color, alpha);
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;

  context.fillStyle = hexToRgba(color, 0.9 * opacity);
  context.beginPath();
  context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  context.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    initParticles();
    rafRef.current = requestAnimationFrame(step);

    const onResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener('resize', onResize);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [particleCount, lineDistance, opacity]);

  return (
    <canvas
      ref={ref}
      className="particles-canvas"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

