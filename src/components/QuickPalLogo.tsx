import React from 'react';

interface QuickPalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem-only' | 'full-horizontal' | 'full-stacked';
  showFestiveTag?: boolean;
}

export const QuickPalEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="q-emblem-orange" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5200" />
          <stop offset="50%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FFA200" />
        </linearGradient>

        <linearGradient id="q-emblem-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A859" />
          <stop offset="60%" stopColor="#008043" />
          <stop offset="100%" stopColor="#005B2E" />
        </linearGradient>

        <linearGradient id="q-emblem-blue" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#14418B" />
          <stop offset="100%" stopColor="#081B4E" />
        </linearGradient>

        <filter id="q-emblem-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity={0.15} />
        </filter>
      </defs>

      <g filter="url(#q-emblem-shadow)">
        {/* Top Orange Swoosh */}
        <path
          d="M 170 105 
             C 215 75, 305 75, 355 110
             C 388 135, 405 170, 400 205
             C 396 230, 380 248, 360 252
             C 365 200, 340 148, 290 132
             C 230 112, 175 140, 142 195
             C 125 225, 122 260, 130 295
             C 122 265, 128 200, 170 105 Z"
          fill="url(#q-emblem-orange)"
        />

        {/* Right Green Swoosh */}
        <path
          d="M 330 140
             C 375 165, 402 215, 395 270
             C 385 340, 325 390, 250 395
             C 285 365, 335 340, 350 280
             C 358 245, 345 200, 315 170
             C 330 155, 322 145, 330 140 Z"
          fill="url(#q-emblem-green)"
        />

        {/* Bottom Green Tail */}
        <path
          d="M 215 375
             C 260 380, 305 345, 340 310
             C 375 275, 405 330, 365 375
             C 320 425, 235 405, 175 350
             C 210 355, 255 355, 295 330
             C 270 360, 240 372, 215 375 Z"
          fill="url(#q-emblem-green)"
        />

        {/* Left Lower Green curve */}
        <path
          d="M 125 255
             C 130 310, 175 365, 230 385
             C 170 375, 135 325, 130 270
             C 126 240, 125 250, 125 255 Z"
          fill="url(#q-emblem-green)"
        />

        {/* Electric Bolt in Center */}
        <polygon
          points="278,75 210,230 282,230 200,380 325,200 252,200 330,75"
          fill="url(#q-emblem-blue)"
        />
      </g>
    </svg>
  );
};

export const QuickPalLogo: React.FC<QuickPalLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full-horizontal',
  showFestiveTag = false,
}) => {
  const pixelSize = size === 'sm' ? 28 : size === 'md' ? 38 : size === 'lg' ? 48 : 64;

  if (variant === 'emblem-only') {
    return <QuickPalEmblem size={pixelSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-1 shadow-sm border border-orange-200/50 dark:border-gray-800 flex items-center justify-center shrink-0">
        <QuickPalEmblem size={pixelSize} />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        {showFestiveTag && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-1">
              <span>🌸</span>
              <span>Ganesh Utsav</span>
            </span>
            <span className="text-[9px] font-bold text-amber-200/90 hidden sm:inline">
              • 10-Min Express
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl sm:text-3xl font-black italic tracking-tight text-white drop-shadow-sm">
            Quick<span className="text-orange-400">Pal</span>
          </span>
          <div className="ml-1 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
