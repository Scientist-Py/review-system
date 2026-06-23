import React from 'react';

export default function Logo({ className = "w-20 h-20" }) {
  return (
    <div className="flex flex-col items-center justify-center select-none animate-float">
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Logo Gold Gradient */}
          <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1C5" /> {/* Highlight Gold */}
            <stop offset="50%" stopColor="#D4AF37" /> {/* Classic Gold */}
            <stop offset="100%" stopColor="#AA7C11" /> {/* Dark Rich Gold */}
          </linearGradient>
          
          {/* Subtle drop shadow */}
          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#logo-shadow)">
          {/* Black Background Circle to preserve your white/gold logo on the new light theme */}
          <circle cx="50" cy="50" r="48" fill="#121212" />

          {/* 1. White Crescent 'C' */}
          <path
            d="M 46 17 
               A 32 32 0 1 0 46 83 
               A 28 28 0 1 1 46 17 
               Z"
            fill="#FFFFFF"
          />

          {/* 2. Gold Serif '1' */}
          <path
            d="M 40.5 49
               L 43 49
               C 46.5 45.5 48.5 42.5 50 38.5
               L 54 38.5
               L 54 83
               L 58 83
               L 58 86
               L 42 86
               L 42 83
               L 46 83
               L 46 45
               L 40.5 47.2
               Z"
            fill="url(#logo-gold)"
          />
        </g>
      </svg>
    </div>
  );
}
