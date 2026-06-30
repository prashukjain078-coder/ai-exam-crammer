import React, { memo } from 'react';

interface MobiusLoaderProps {
  size?: number;
  className?: string;
}

export const MobiusLoader = memo(function MobiusLoader({
  size = 80,
  className = '',
}: MobiusLoaderProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size / 2 }}
    >
      <style>{`
        .mobius-container {
          animation: mobius-float 4s ease-in-out infinite;
          transform-origin: center;
        }
        .mobius-glow {
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))
                  drop-shadow(0 0 20px rgba(6, 182, 212, 0.2));
        }
        .mobius-ribbon-base {
          stroke-dasharray: 400;
          stroke-dashoffset: 0;
        }
        .mobius-ribbon-flow {
          stroke-dasharray: 80 180;
          animation: mobius-dash 3s linear infinite;
        }
        .mobius-ribbon-edge {
          stroke-dasharray: 100 160;
          animation: mobius-dash-reverse 4s linear infinite;
          opacity: 0.8;
        }
        @keyframes mobius-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-5px) rotate(2deg) scale(1.02);
          }
        }
        @keyframes mobius-dash {
          to {
            stroke-dashoffset: -260;
          }
        }
        @keyframes mobius-dash-reverse {
          to {
            stroke-dashoffset: 260;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mobius-container {
            animation: none !important;
            transform: none !important;
          }
          .mobius-ribbon-flow {
            animation: none !important;
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
          }
          .mobius-ribbon-edge {
            animation: none !important;
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
            display: none;
          }
        }
      `}</style>

      <svg
        className="mobius-container mobius-glow w-full h-full"
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mobiusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
            <stop offset="40%" stopColor="#4f46e5" /> {/* Indigo-600 */}
            <stop offset="70%" stopColor="#0ea5e9" /> {/* Sky-500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
          </linearGradient>
          <linearGradient id="mobiusEdgeGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Outer subtle shadow track */}
        <path
          d="M 50 25 C 35 10, 15 10, 15 25 C 15 40, 35 40, 50 25 C 65 10, 85 10, 85 25 C 85 40, 65 40, 50 25 Z"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Mobius Ribbon Base */}
        <path
          className="mobius-ribbon-base"
          d="M 50 25 C 35 10, 15 10, 15 25 C 15 40, 35 40, 50 25 C 65 10, 85 10, 85 25 C 85 40, 65 40, 50 25 Z"
          stroke="url(#mobiusGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />

        {/* Moving Flowing Ribbon Layer */}
        <path
          className="mobius-ribbon-flow"
          d="M 50 25 C 35 10, 15 10, 15 25 C 15 40, 35 40, 50 25 C 65 10, 85 10, 85 25 C 85 40, 65 40, 50 25 Z"
          stroke="url(#mobiusGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary thinner highlight track (for twisted 3D ribbon look) */}
        <path
          className="mobius-ribbon-edge"
          d="M 50 25 C 35 10, 15 10, 15 25 C 15 40, 35 40, 50 25 C 65 10, 85 10, 85 25 C 85 40, 65 40, 50 25 Z"
          stroke="url(#mobiusEdgeGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export default MobiusLoader;
