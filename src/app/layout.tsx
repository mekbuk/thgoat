import type { Metadata } from 'next';
import { Russo_One } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/branding/Header';
import { Footer } from '@/components/branding/Footer';

const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-title',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Throat Goat | Multiplayer Tattoo Party Game',
  description: 'A humorous multiplayer browser game where players create funny titles for questionable tattoos and vote for the best. Powered by Next.js & Supabase.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${russoOne.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
