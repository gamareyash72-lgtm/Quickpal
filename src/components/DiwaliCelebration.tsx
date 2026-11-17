import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  playRocketSound,
  playBurstSound,
  playAnarSound,
  playChakriSound,
  playSparklerSizzle
} from '../utils/diwaliAudio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
  flicker?: boolean;
}

interface RocketObject {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  burstType: 'stars' | 'ring' | 'glitter';
}

interface DiyaPlacement {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

// Global dispatcher to launch crackers from anywhere in the app
export function triggerDiwaliFirework(type: 'rocket' | 'anar' | 'chakri' | 'sparkler' | 'burst', coords?: { x?: number; y?: number }) {
  window.dispatchEvent(
    new CustomEvent('quickpal:diwali-firework', {
      detail: { type, coords }
    })
  );
}

export const DiwaliCelebration: React.FC = () => {
  const { isDiwaliTheme } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<RocketObject[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const [activeDiyas, setActiveDiyas] = useState<DiyaPlacement[]>([]);
  const [isSparklerActive, setIsSparklerActive] = useState<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Palettes strictly of vibrant Orange and White colors
  const fireworkColors = [
    '#FF6A00', // QuickPal Vibrant Orange
    '#ffffff', // Pure Diamond White
    '#ea580c', // Deep Rich Orange
    '#fff7ed', // Shimmering White-Orange
    '#f97316', // Bright Saffron Orange
    '#ffedd5', // Warm White Amber
    '#fb923c', // Sunset Orange
    '#ffffff'  // Sparkling White
  ];

  // Launch a realistic Rocket
  const launchRocket = useCallback((startX?: number, targetHeightRatio = 0.25) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    const x = startX ?? (w * 0.2 + Math.random() * (w * 0.6));
    const targetY = h * (targetHeightRatio + Math.random() * 0.25);
    const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

    rocketsRef.current.push({
      x,
      y: h,
      targetY,
      vy: -(11 + Math.random() * 4),
      color,
      burstType: Math.random() > 0.4 ? 'stars' : 'ring'
    });

    playRocketSound();
  }, [fireworkColors]);

  // Burst explosion
  const burstExplosion = useCallback((x: number, y: number, color?: string, count = 70) => {
    const chosenColor = color || fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    const secondaryColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * 8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? chosenColor : secondaryColor,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.016,
        gravity: 0.12,
        drag: 0.98,
        flicker: Math.random() > 0.4
      });
    }

    // Add trailing glitter dust
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        color: '#fef08a',
        alpha: 0.9,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.08,
        drag: 0.97,
        flicker: true
      });
    }
  }, [fireworkColors]);

  // Launch Anar (Flowerpot Fountain)
  const launchAnar = useCallback((xCoord?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const originX = xCoord ?? w * 0.5;
    const originY = h - 20;

    playAnarSound();

    let emitted = 0;
    const interval = setInterval(() => {
      emitted++;
      for (let i = 0; i < 14; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.65;
        const speed = 7 + Math.random() * 11;
        const color = Math.random() > 0.35 ? '#f59e0b' : Math.random() > 0.5 ? '#fef08a' : '#ea580c';
        particlesRef.current.push({
          x: originX + (Math.random() - 0.5) * 16,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3.5,
          color,
          alpha: 1,
          decay: 0.018 + Math.random() * 0.02,
          gravity: 0.22,
          drag: 0.985,
          flicker: true
        });
      }
      if (emitted >= 22) clearInterval(interval);
    }, 45);
  }, []);

  // Launch Chakri (Ground Spinner)
  const launchChakri = useCallback((xCoord?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const originX = xCoord ?? (w * 0.7);
    const originY = h - 55;

    playChakriSound();

    let rotation = 0;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      rotation += 0.45;
      for (let arm = 0; arm < 3; arm++) {
        const currentAngle = rotation + (arm * (Math.PI * 2)) / 3;
        const speed = 4 + Math.random() * 5;
        particlesRef.current.push({
          x: originX + Math.cos(currentAngle) * 14,
          y: originY + Math.sin(currentAngle) * 14,
          vx: Math.cos(currentAngle) * speed,
          vy: Math.sin(currentAngle) * speed - 1,
          size: 2 + Math.random() * 3,
          color: arm === 0 ? '#f59e0b' : arm === 1 ? '#ef4444' : '#fbbf24',
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02,
          gravity: 0.16,
          drag: 0.98,
          flicker: true
        });
      }
      if (ticks >= 35) clearInterval(interval);
    }, 35);
  }, []);

  // Light an interactive Diya on screen
  const lightDiyaOnScreen = useCallback((x?: number, y?: number) => {
    const defaultX = x ?? (window.innerWidth * (0.2 + Math.random() * 0.6));
    const defaultY = y ?? (window.innerHeight - 110 - Math.random() * 80);

    const newDiya: DiyaPlacement = {
      id: 'diya-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      x: defaultX,
      y: defaultY,
      createdAt: Date.now()
    };

    setActiveDiyas(prev => [...prev.slice(-7), newDiya]); // keep up to 8 diyas

    // Sparkle burst around the new diya
    burstExplosion(defaultX, defaultY, '#f59e0b', 30);
    playSparklerSizzle();
  }, [burstExplosion]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update & draw rising rockets
      const rockets = rocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Sparkle tail
        for (let t = 0; t < 2; t++) {
          particlesRef.current.push({
            x: r.x + (Math.random() - 0.5) * 3,
            y: r.y + (Math.random() * 8),
            vx: (Math.random() - 0.5) * 1.2,
            vy: 1.5 + Math.random() * 2,
            size: 2,
            color: '#fbbf24',
            alpha: 0.8,
            decay: 0.04,
            gravity: 0.05,
            drag: 0.98,
            flicker: true
          });
        }

        // Rocket body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r.x - 1.5, r.y, 3, 8);

        // Burst when target reached or velocity inverted
        if (r.y <= r.targetY) {
          rockets.splice(i, 1);
          burstExplosion(r.x, r.y, r.color, 80);
          playBurstSound();
        }
      }

      // 2. Continuous handheld sparkler when cursor moves and sparkler is active
      if (isSparklerActive && mousePosRef.current) {
        const m = mousePosRef.current;
        for (let s = 0; s < 4; s++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6;
          particlesRef.current.push({
            x: m.x,
            y: m.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1.5 + Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#FF6A00' : '#ffffff',
            alpha: 1,
            decay: 0.035 + Math.random() * 0.03,
            gravity: 0.18,
            drag: 0.98,
            flicker: true
          });
        }
      }

      // 3. Update & render particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 30) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        const displayAlpha = p.flicker && Math.random() > 0.5 ? p.alpha * 0.5 : p.alpha;
        ctx.globalAlpha = Math.max(0, displayAlpha);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [burstExplosion, isSparklerActive]);

  // Listen to mouse movement for sparkler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Listen to global custom events
  useEffect(() => {
    const handleCustomFirework = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      const type = customEvt.detail?.type || 'rocket';
      const coords = customEvt.detail?.coords;

      if (type === 'rocket') {
        launchRocket(coords?.x);
      } else if (type === 'anar') {
        launchAnar(coords?.x);
      } else if (type === 'chakri') {
        launchChakri(coords?.x);
      } else if (type === 'sparkler') {
        setIsSparklerActive(true);
        setTimeout(() => setIsSparklerActive(false), 3500);
      } else {
        burstExplosion(coords?.x ?? window.innerWidth * 0.5, coords?.y ?? window.innerHeight * 0.35);
        playBurstSound();
      }
    };

    window.addEventListener('quickpal:diwali-firework', handleCustomFirework);
    return () => window.removeEventListener('quickpal:diwali-firework', handleCustomFirework);
  }, [launchRocket, launchAnar, launchChakri, burstExplosion]);

  // Initial celebratory rocket on mount if Diwali theme is active
  useEffect(() => {
    if (isDiwaliTheme) {
      const timer = setTimeout(() => {
        launchRocket(window.innerWidth * 0.3, 0.25);
        setTimeout(() => launchRocket(window.innerWidth * 0.7, 0.2), 400);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isDiwaliTheme, launchRocket]);

  return (
    <>
      {/* Fullscreen Non-blocking Canvas for Diwali Fireworks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[90] w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Traditional Marigold & Mango Leaves Toran at the Top of the Page */}
      {isDiwaliTheme && (
        <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none flex justify-between items-start overflow-hidden h-7 select-none opacity-90">
          <div className="w-full flex justify-around items-center px-2">
            {[...Array(16)].map((_, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Marigold flower bloom & mango leaf */}
                <div className="flex items-center -space-x-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs border border-amber-300 transform rotate-12 flex items-center justify-center text-[8px]">
                    🌼
                  </span>
                  <span className="w-3 h-3 rounded-full bg-orange-600 shadow-xs border border-orange-400 -mt-1 flex items-center justify-center text-[7px]">
                    🏵️
                  </span>
                </div>
                {/* Tiny hanging golden diya bell */}
                {idx % 3 === 1 && (
                  <div className="w-2.5 h-3 text-[10px] animate-diya-flame -mt-0.5">
                    🪔
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Interactive Diyas Lit in Background */}
      {activeDiyas.map(diya => (
        <div
          key={diya.id}
          style={{ left: diya.x, top: diya.y }}
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-[85]"
        >
          <div className="relative flex flex-col items-center">
            {/* Flickering Flame */}
            <div className="w-3.5 h-5 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full animate-diya-flame shadow-lg shadow-amber-400/80 -mb-1 filter drop-shadow(0 0 6px #f59e0b)" />
            {/* Clay Diya Base */}
            <div className="w-9 h-4 bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900 rounded-b-xl border border-amber-600 shadow-md flex items-center justify-center text-[9px] text-amber-200 font-bold">
              🪔
            </div>
            {/* Warm Radial Glow */}
            <div className="absolute inset-0 w-16 h-16 -left-3.5 -top-3.5 bg-amber-400/20 rounded-full blur-md pointer-events-none animate-pulse-gentle" />
          </div>
        </div>
      ))}
    </>
  );
};
