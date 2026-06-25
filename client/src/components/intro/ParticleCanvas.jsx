import { useRef, useEffect, useCallback } from 'react';

const PARTICLE_COUNT = 200;
const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#8B5CF6', '#60A5FA', '#38BDF8', '#C7D2FE'];

class Particle {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.reset();
  }

  reset() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 320;
    this.x = this.cx + Math.cos(angle) * dist;
    this.y = this.cy + Math.sin(angle) * dist;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = 0.8 + Math.random() * 2.8;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = 0;
    this.targetAlpha = 0.2 + Math.random() * 0.4;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitSpeed = (0.001 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1);
    this.orbitRadius = 12 + Math.random() * 50;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  float(time) {
    this.x += this.vx;
    this.y += this.vy;
    this.orbitAngle += this.orbitSpeed;
    this.x += Math.cos(this.orbitAngle) * 0.25;
    this.y += Math.sin(this.orbitAngle) * 0.25;
    this.currentAlpha = this.targetAlpha * (0.7 + 0.3 * Math.sin(time * 0.002 + this.pulseOffset));
  }

  converge(progress) {
    const tx = this.cx + (Math.random() - 0.5) * 60;
    const ty = this.cy + (Math.random() - 0.5) * 60;
    const ease = progress * progress * (3 - 2 * progress);
    this.x += (tx - this.x) * ease * 0.07;
    this.y += (ty - this.y) * ease * 0.07;
    this.currentAlpha = this.targetAlpha * (0.5 + 0.5 * (1 - progress));
  }

  explode(progress) {
    const angle = this.orbitAngle;
    const dist = progress * (180 + Math.random() * 350);
    const tx = this.cx + Math.cos(angle) * dist;
    const ty = this.cy + Math.sin(angle) * dist;
    this.x += (tx - this.x) * 0.06;
    this.y += (ty - this.y) * 0.06;
    this.currentAlpha = Math.max(0, (1 - progress) * 0.6);
  }

  draw(ctx) {
    if (this.currentAlpha <= 0.01) return;
    // Core particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.currentAlpha;
    ctx.fill();
    // Glow halo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.currentAlpha * 0.12;
    ctx.fill();
  }
}

export default function ParticleCanvas({ phase = 'idle', progress = 0 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const phaseRef = useRef(phase);
  const progressRef = useRef(progress);
  const startTimeRef = useRef(Date.now());

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const currentPhase = phaseRef.current;
    const currentProgress = progressRef.current;
    const elapsed = Date.now() - startTimeRef.current;

    ctx.clearRect(0, 0, w, h);

    particlesRef.current.forEach(p => {
      p.cx = cx;
      p.cy = cy;

      if (currentPhase === 'float') {
        p.alpha += (p.targetAlpha - p.alpha) * 0.025;
        p.float(elapsed);
      } else if (currentPhase === 'converge') {
        p.converge(currentProgress);
      } else if (currentPhase === 'explode') {
        p.explode(currentProgress);
      } else if (currentPhase === 'idle') {
        p.alpha += (0 - p.alpha) * 0.04;
      }

      p.draw(ctx);
    });

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => new Particle(cx, cy));

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}
