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
        {/* Top Saffron-Orange Gradient */}
        <linearGradient id="qp-orange-grad" x1="10%" y1="100%" x2="90%" y2="0%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="45%" stopColor="#FF6A00" />
          <stop offset="85%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FFA826" />
        </linearGradient>

        {/* Top Orange Shadow Depth */}
        <linearGradient id="qp-orange-depth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E03E00" />
          <stop offset="60%" stopColor="#FF5C00" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>

        {/* Emerald Green Main Gradient */}
        <linearGradient id="qp-green-grad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#00BA5A" />
          <stop offset="50%" stopColor="#009643" />
          <stop offset="100%" stopColor="#006E30" />
        </linearGradient>

        {/* Emerald Green Highlight */}
        <linearGradient id="qp-green-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#05C965" />
          <stop offset="70%" stopColor="#009F49" />
          <stop offset="100%" stopColor="#007A34" />
        </linearGradient>

        {/* Navy Blue Lightning Bolt Gradient */}
        <linearGradient id="qp-navy-bolt" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#143B7C" />
          <stop offset="50%" stopColor="#0A2458" />
          <stop offset="100%" stopColor="#06173B" />
        </linearGradient>

        {/* Subtle Soft Drop Shadow */}
        <filter id="qp-soft-shadow" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#qp-soft-shadow)">
        {/* 1. ORANGE TOP & LEFT ARC */}
        <path
          d="M 124 235
             C 120 165, 175 90, 260 65
             C 328 45, 396 75, 432 135
             C 438 145, 442 160, 442 168
             C 435 158, 412 118, 370 98
             C 310 70, 230 78, 178 124
             C 142 155, 126 195, 124 235 Z"
          fill="url(#qp-orange-depth)"
        />
        
        <path
          d="M 120 240
             C 118 175, 170 100, 255 70
             C 335 42, 408 80, 442 165
             C 425 130, 395 105, 350 92
             C 285 73, 215 92, 168 140
             C 134 175, 122 210, 120 240 Z"
          fill="url(#qp-orange-grad)"
        />

        <path
          d="M 148 198
             C 175 142, 235 102, 305 102
             C 350 102, 390 120, 420 152
             C 390 130, 350 115, 305 116
             C 240 118, 185 155, 158 208
             C 152 220, 146 210, 148 198 Z"
          fill="url(#qp-orange-grad)"
          opacity="0.9"
        />

        {/* 2. GREEN RIGHT & LOWER CRESCENT */}
        <path
          d="M 370 145
             C 418 185, 442 245, 432 308
             C 420 375, 368 425, 300 442
             C 255 454, 205 445, 165 420
             C 195 432, 240 435, 285 422
             C 345 405, 392 355, 400 292
             C 408 232, 385 180, 342 145
             C 355 142, 362 143, 370 145 Z"
          fill="url(#qp-green-grad)"
        />

        <path
          d="M 120 240
             C 124 295, 155 350, 200 388
             C 220 405, 248 418, 275 425
             C 240 415, 205 398, 178 370
             C 145 335, 128 290, 126 248
             C 124 240, 120 236, 120 240 Z"
          fill="url(#qp-green-light)"
        />

        {/* 3. ELEGANT 'Q' GREEN TAIL */}
        <path
          d="M 275 390
             C 310 392, 345 365, 375 330
             C 405 295, 435 340, 405 385
             C 375 430, 310 448, 260 410
             C 290 416, 325 412, 355 392
             C 382 375, 395 355, 400 340
             C 392 368, 360 402, 320 408
             C 295 412, 280 402, 275 390 Z"
          fill="url(#qp-green-grad)"
        />

        <path
          d="M 268 395
             C 310 398, 345 365, 380 325
             C 392 310, 412 300, 424 316
             C 436 332, 420 360, 402 385
             C 375 422, 335 448, 288 448
             C 330 440, 368 418, 395 382
             C 415 355, 418 335, 408 330
             C 395 324, 378 345, 352 372
             C 325 400, 292 405, 268 395 Z"
          fill="url(#qp-green-light)"
        />

        <path
          d="M 330 420
             C 370 445, 410 442, 442 418
             C 418 435, 385 436, 352 422
             C 342 418, 335 418, 330 420 Z"
          fill="url(#qp-green-grad)"
          opacity="0.8"
        />

        {/* 4. NAVY BLUE CENTRAL LIGHTNING BOLT */}
        <polygon
          points="
            372,72
            242,246
            336,246
            195,442
            286,220
            206,220
          "
          fill="url(#qp-navy-bolt)"
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
