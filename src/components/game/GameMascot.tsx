'use client';

import React from 'react';

export type MascotType = 'cloud' | 'worm' | 'blob' | 'ghost' | 'duck' | 'cat' | 'cyclops' | 'star';

export const MASCOT_TYPES: MascotType[] = [
  'cloud',
  'worm',
  'blob',
  'ghost',
  'duck',
  'cat',
  'cyclops',
  'star',
];

export function getMascotForPlayer(identifier: string): MascotType {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MASCOT_TYPES.length;
  return MASCOT_TYPES[index];
}

interface GameMascotProps {
  type: MascotType;
  className?: string;
}

export function GameMascot({ type, className = 'w-10 h-10' }: GameMascotProps) {
  switch (type) {
    case 'cloud':
      // White puffy cloud mascot (like Yahi in reference)
      return (
        <svg viewBox="0 0 100 80" className={className} fill="none">
          {/* Cloud body */}
          <path
            d="M 25,65 Q 10,65 10,50 Q 10,35 25,35 Q 25,15 45,15 Q 60,15 70,25 Q 85,20 90,40 Q 95,55 85,65 Z"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <circle cx="42" cy="45" r="3" fill="#0F172A" />
          <circle cx="58" cy="45" r="3" fill="#0F172A" />
          {/* Cheeks */}
          <ellipse cx="34" cy="50" rx="4" ry="2" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="66" cy="50" rx="4" ry="2" fill="#FDA4AF" opacity="0.6" />
        </svg>
      );

    case 'worm':
      // Orange curved worm mascot with smile (like Chez in reference)
      return (
        <svg viewBox="0 0 80 100" className={className} fill="none">
          {/* Worm curved body */}
          <path
            d="M 25,90 C 15,70 50,75 55,60 C 60,45 25,45 35,25 C 40,15 55,10 65,22 C 75,35 60,50 48,65 C 40,78 20,80 25,90 Z"
            fill="#F97316"
            stroke="#431407"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <circle cx="48" cy="22" r="2.5" fill="#0F172A" />
          <circle cx="58" cy="24" r="2.5" fill="#0F172A" />
          {/* Smile */}
          <path
            d="M 50,30 Q 55,35 60,31"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'blob':
      // Dark shadowy ink splat/blob mascot with glowing eyes (like Lydiphobia in reference)
      return (
        <svg viewBox="0 0 100 90" className={className} fill="none">
          {/* Shadow puddle */}
          <ellipse cx="50" cy="80" rx="35" ry="8" fill="#090514" opacity="0.5" />
          {/* Blob body with splat spikes */}
          <path
            d="M 50,15 C 75,10 90,30 85,50 C 92,60 85,75 70,75 C 55,80 35,80 25,72 C 12,70 8,50 18,35 C 10,22 30,12 50,15 Z"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="3"
          />
          {/* Small splat drops */}
          <circle cx="15" cy="25" r="4" fill="#0F172A" />
          <circle cx="85" cy="28" r="3" fill="#0F172A" />
          {/* Glowing oval eyes */}
          <ellipse cx="40" cy="45" rx="5" ry="3" fill="#FACC15" />
          <ellipse cx="60" cy="45" rx="5" ry="3" fill="#FACC15" />
        </svg>
      );

    case 'ghost':
      // Cyan hooded creature with big circular eyes (like Pixel in reference)
      return (
        <svg viewBox="0 0 80 110" className={className} fill="none">
          {/* Hooded ghost body */}
          <path
            d="M 40,10 C 20,10 18,40 18,70 C 18,90 12,100 24,96 C 34,92 34,98 40,94 C 46,98 46,92 56,96 C 68,100 62,90 62,70 C 62,40 60,10 40,10 Z"
            fill="#06B6D4"
            stroke="#083344"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Left Eye */}
          <ellipse cx="32" cy="42" rx="7" ry="10" fill="#083344" />
          <circle cx="32" cy="42" r="4" fill="#FFFFFF" />
          <circle cx="32" cy="42" r="2" fill="#083344" />
          {/* Right Eye */}
          <ellipse cx="48" cy="42" rx="7" ry="10" fill="#083344" />
          <circle cx="48" cy="42" r="4" fill="#FFFFFF" />
          <circle cx="48" cy="42" r="2" fill="#083344" />
        </svg>
      );

    case 'duck':
      // Yellow duck character with orange beak
      return (
        <svg viewBox="0 0 90 90" className={className} fill="none">
          {/* Duck head */}
          <ellipse
            cx="45"
            cy="45"
            rx="32"
            ry="30"
            fill="#FACC15"
            stroke="#713F12"
            strokeWidth="4"
          />
          {/* Beak */}
          <path
            d="M 40,48 Q 55,42 70,50 Q 55,62 40,55 Z"
            fill="#FB923C"
            stroke="#713F12"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Eye */}
          <circle cx="34" cy="38" r="4" fill="#0F172A" />
          <circle cx="35.5" cy="36.5" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'cat':
      // Cute purple/pink kitty mascot
      return (
        <svg viewBox="0 0 90 90" className={className} fill="none">
          {/* Left ear */}
          <polygon points="20,40 15,15 40,25" fill="#EC4899" stroke="#831843" strokeWidth="4" />
          {/* Right ear */}
          <polygon points="70,40 75,15 50,25" fill="#EC4899" stroke="#831843" strokeWidth="4" />
          {/* Head */}
          <ellipse cx="45" cy="52" rx="35" ry="30" fill="#F472B6" stroke="#831843" strokeWidth="4" />
          {/* Eyes */}
          <ellipse cx="32" cy="48" rx="3" ry="5" fill="#0F172A" />
          <ellipse cx="58" cy="48" rx="3" ry="5" fill="#0F172A" />
          {/* Nose & Mouth */}
          <polygon points="45,55 42,52 48,52" fill="#831843" />
          <path d="M 41,58 Q 45,62 49,58" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'cyclops':
      // Friendly lime monster with one big cute eye
      return (
        <svg viewBox="0 0 90 90" className={className} fill="none">
          {/* Horns */}
          <path d="M 30,25 Q 25,12 18,15" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          <path d="M 60,25 Q 65,12 72,15" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          {/* Body */}
          <rect
            x="20"
            y="25"
            width="50"
            height="55"
            rx="25"
            fill="#84CC16"
            stroke="#15803D"
            strokeWidth="4"
          />
          {/* Big eye */}
          <circle cx="45" cy="48" r="14" fill="#FFFFFF" stroke="#15803D" strokeWidth="3" />
          <circle cx="45" cy="48" r="7" fill="#4338CA" />
          <circle cx="47" cy="46" r="2.5" fill="#FFFFFF" />
          {/* Tooth smile */}
          <path d="M 38,70 Q 45,76 52,70" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'star':
    default:
      // Cute golden star mascot
      return (
        <svg viewBox="0 0 90 90" className={className} fill="none">
          <polygon
            points="45,8 55,32 82,35 60,53 67,80 45,65 23,80 30,53 8,35 35,32"
            fill="#FBBF24"
            stroke="#78350F"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="38" cy="44" r="3" fill="#0F172A" />
          <circle cx="52" cy="44" r="3" fill="#0F172A" />
          <ellipse cx="32" cy="49" rx="3" ry="1.5" fill="#F472B6" />
          <ellipse cx="58" cy="49" rx="3" ry="1.5" fill="#F472B6" />
          <path d="M 42,50 Q 45,54 48,50" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
