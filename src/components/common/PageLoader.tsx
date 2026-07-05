import React from 'react';

/**
 * Branded, education-themed page loader.
 *
 * Uses a pure CSS / inline SVG animated open-book motif with pulsing dots.
 * Respects `prefers-reduced-motion`: animations are disabled and a simple
 * opacity pulse is shown instead.
 */
export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading…',
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 select-none"
      role="status"
      aria-label={message}
    >
      {/* Animated open-book SVG */}
      <div className="relative w-20 h-20">
        <svg
          viewBox="0 0 80 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Left page */}
          <path
            d="M40 10 C30 10 8 14 8 14 L8 52 C8 52 28 47 40 52"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#f8fafc"
          />
          {/* Left page lines */}
          <line x1="15" y1="22" x2="35" y2="20" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="28" x2="35" y2="26" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="34" x2="35" y2="32" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="40" x2="28" y2="38.5" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />

          {/* Right page (animated flutter) */}
          <path
            d="M40 10 C50 10 72 14 72 14 L72 52 C72 52 52 47 40 52"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#eef2ff"
            className="origin-left motion-safe:animate-[flutter_1.6s_ease-in-out_infinite]"
          />
          {/* Right page lines */}
          <line x1="45" y1="20" x2="65" y2="22" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="45" y1="26" x2="65" y2="28" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="45" y1="32" x2="65" y2="34" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="45" y1="38.5" x2="58" y2="40" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />

          {/* Spine */}
          <line x1="40" y1="10" x2="40" y2="52" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Glow pulse ring */}
        <span className="absolute inset-0 rounded-full motion-safe:animate-ping opacity-10 bg-indigo-400 scale-75 pointer-events-none" />
      </div>

      {/* Brand text */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-semibold text-slate-500 tracking-wide">{message}</p>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400 motion-safe:animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes for the page-flutter effect */}
      <style>{`
        @keyframes flutter {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50%       { transform: scaleX(0.88); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};
