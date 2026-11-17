import React from 'react';

interface QuickPalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem-only' | 'full-horizontal' | 'full-stacked' | 'badge-card';
  showFestiveTag?: boolean;
  showTagline?: boolean;
}

/**
 * Official QuickPal Compact Emblem / Badge
 * Vibrant Orange background with "quick" in dark & "pal" in white.
 */
export const QuickPalEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-[#FF6A00] flex items-center justify-center p-1 shadow-xs shrink-0 select-none overflow-hidden ${className}`}
    >
      <span className="font-black text-xs sm:text-sm tracking-tighter leading-none flex items-center">
        <span className="text-[#1A1A1A]">q</span>
        <span className="text-white">p</span>
      </span>
    </div>
  );
};

/**
 * Official QuickPal Logo
 * Exactly matching the official brand identity:
 * - Orange background (#FF6A00)
 * - "quick" in rich black/charcoal (#1A1A1A)
 * - "pal" in crisp white (#FFFFFF)
 * - Tagline: "Saphale's First Ever Online delivery at your doorstep"
 */
export const QuickPalLogo: React.FC<QuickPalLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full-horizontal',
  showFestiveTag = false,
  showTagline = true
}) => {
  const pixelSize = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 48 : 64;

  if (variant === 'emblem-only') {
    return <QuickPalEmblem size={pixelSize} className={className} />;
  }

  if (variant === 'badge-card') {
    return (
      <div className={`bg-[#FF6A00] rounded-2xl p-4 sm:p-5 text-center shadow-md select-none flex flex-col items-center justify-center ${className}`}>
        <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline">
          <span className="text-[#1A1A1A]">quick</span>
          <span className="text-white">pal</span>
        </div>
        {showTagline && (
          <p className="text-[11px] sm:text-xs font-serif text-[#111111] mt-1 font-medium tracking-normal">
            Saphale&apos;s First Ever Online delivery at your doorstep
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Orange Badge Emblem */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FF6A00] flex items-center justify-center shadow-sm shrink-0 border border-orange-400/40">
        <span className="font-black text-sm sm:text-base tracking-tighter leading-none flex items-center">
          <span className="text-[#1A1A1A]">q</span>
          <span className="text-white">p</span>
        </span>
      </div>

      {/* Typography & Tagline */}
      <div className="flex flex-col">
        {showFestiveTag && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-orange-500/30 flex items-center gap-1">
              <span>⚡</span>
              <span>30-Min Delivery</span>
            </span>
            <span className="text-[9px] font-bold text-neutral-300 hidden sm:inline">
              • Saphale 401102
            </span>
          </div>
        )}
        <div className="flex items-baseline leading-none">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white">
            quick<span className="text-[#FF6A00]">pal</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] font-serif text-gray-200 dark:text-gray-300 tracking-tight line-clamp-1 mt-0.5 opacity-90">
            Saphale&apos;s First Ever Online delivery at your doorstep
          </span>
        )}
      </div>
    </div>
  );
};
