'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

// Social Media Icons
const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.19-.04 2.27-.72 2.81-1.77.34-.63.48-1.35.48-2.07V.02z" />
  </svg>
);

export interface SocialLink {
  name: string;
  url: string;
  icon: React.FC<{ className?: string }>;
  hoverClasses: string;
}

/**
 * Configure your social media links here.
 * Replace the url properties with your actual community / social pages.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Discord',
    url: 'https://discord.gg', // replace with your Discord invite link
    icon: DiscordIcon,
    hoverClasses: 'hover:text-[#5865F2] hover:border-[#5865F2]/60 hover:bg-[#5865F2]/10 hover:shadow-[0_0_15px_rgba(88,101,242,0.25)]',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com', // replace with your Instagram profile URL
    icon: InstagramIcon,
    hoverClasses: 'hover:text-[#E1306C] hover:border-[#E1306C]/60 hover:bg-[#E1306C]/10 hover:shadow-[0_0_15px_rgba(225,48,108,0.25)]',
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com', // replace with your Facebook page URL
    icon: FacebookIcon,
    hoverClasses: 'hover:text-[#1877F2] hover:border-[#1877F2]/60 hover:bg-[#1877F2]/10 hover:shadow-[0_0_15px_rgba(24,119,242,0.25)]',
  },
  {
    name: 'X',
    url: 'https://x.com', // replace with your X / Twitter URL
    icon: XIcon,
    hoverClasses: 'hover:text-white hover:border-slate-500 hover:bg-slate-800/80 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]',
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com', // replace with your TikTok URL
    icon: TikTokIcon,
    hoverClasses: 'hover:text-[#00F2FE] hover:border-[#00F2FE]/60 hover:bg-[#00F2FE]/10 hover:shadow-[0_0_15px_rgba(0,242,254,0.25)]',
  },
];

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on in-game room/lobby pages to maximize gameplay screen
  if (pathname?.startsWith('/room')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-5 text-center z-30">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3">
        {SOCIAL_LINKS.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${social.name}`}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 text-slate-400 text-xs font-bold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 ${social.hoverClasses}`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{social.name}</span>
            </a>
          );
        })}
      </div>
    </footer>
  );
};
