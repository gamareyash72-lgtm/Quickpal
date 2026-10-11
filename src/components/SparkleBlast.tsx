import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'star' | 'diamond';
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
}

// Global trigger function to blast sparkles from anywhere in the app
export function triggerSparkleBlast(options?: { originX?: number; originY?: number }) {
  window.dispatchEvent(
    new CustomEvent('quickpal:sparkle-blast', {
      detail: options || {}
    })
  );
}

export const SparkleBlast: React.FC = () => {
  const { currentUser, currentRole } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track previous user to detect fresh login
  const prevUserRef = useRef<string | null>(null);
  const hasInitialBlasted = useRef<boolean>(false);

  // Palette: 20% Black / Charcoal, 40% Vibrant Orange, 40% Crisp White & Golden Diamond
  const palette = [
    // 20% Black / Charcoal
    '#121212',
    '#18181b',
    '#27272a',
    // 40% Vibrant QuickPal Orange
    '#FF6A00',
    '#FF6A00',
    '#ea580c',
    '#f97316',
    '#fb923c',
    '#ff781f',
    // 40% Crisp White & Golden Sparkles
    '#ffffff',
    '#ffffff',
    '#fef08a',
    '#f8fafc',
    '#fff7ed',
    '#fef9c3'
  ];

  const shapes: Array<'circle' | 'square' | 'star' | 'diamond'> = [
    'circle',
    'square',
    'star',
    'diamond'
  ];

  // Particle emission blast
  const emitBlast = useCallback((originXRatio = 0.5, originYRatio = 0.4) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;

    const originX = width * originXRatio;
    const originY = height * originYRatio;

    // Create 90 festive particles in the 20% Black, 40% Orange, 40% White ratio
    const newParticles: Particle[] = [];
    const count = 95;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 11;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.5),
        vy: Math.sin(angle) * speed - (3 + Math.random() * 5), // biased upward launch
        size: shape === 'star' ? 9 + Math.random() * 8 : 4 + Math.random() * 7,
        color,
        shape,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }

    // Also secondary fountain burst on left and right for widescreen delight
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: width * 0.2 + (Math.random() - 0.5) * 50,
        y: height * 0.5,
        vx: 2 + Math.random() * 6,
        vy: -(6 + Math.random() * 8),
        size: 5 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.01
      });

      newParticles.push({
        x: width * 0.8 + (Math.random() - 0.5) * 50,
        y: height * 0.5,
        vx: -(2 + Math.random() * 6),
        vy: -(6 + Math.random() * 8),
        size: 5 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.01
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Show temporary celebratory toast
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage('✨ Welcome to QuickPal! Saphale 30-Min Express Delivery 🎉');
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  }, [palette, shapes]);

  // Main animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let isRunning = true;

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const current = particlesRef.current;
      for (let i = current.length - 1; i >= 0; i--) {
        const p = current[i];

        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.985; // air drag
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 20) {
          current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 1.5);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size / 1.5);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(0, 0, 5, p.size / 1.8, p.size / 3.8);
        }

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Event listener for manual or external sparkle triggers
  useEffect(() => {
    const handleCustomTrigger = (event: Event) => {
      const customEvt = event as CustomEvent;
      const x = customEvt.detail?.originX ?? 0.5;
      const y = customEvt.detail?.originY ?? 0.4;
      emitBlast(x, y);
    };

    window.addEventListener('quickpal:sparkle-blast', handleCustomTrigger);
    return () => {
      window.removeEventListener('quickpal:sparkle-blast', handleCustomTrigger);
    };
  }, [emitBlast]);

  return (
    <>
      {/* Fullscreen Non-blocking Canvas for Sparkle & Particle Explosions */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[100] w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      />
    </>
  );
};
