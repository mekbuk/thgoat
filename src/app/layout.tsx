import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/branding/Header';
import { Footer } from '@/components/branding/Footer';

export const metadata: Metadata = {
  title: 'Throat Goat | Multiplayer Tattoo Party Game',
  description: 'A humorous multiplayer browser game where players create funny titles for questionable tattoos and vote for the best. Powered by Next.js & Supabase.',
  icons: {
    icon: '/icon/image.png',
    shortcut: '/icon/image.png',
    apple: '/icon/image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
