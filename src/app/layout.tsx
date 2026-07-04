import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FuelVoice — Honest Petrol Pump & Gas Station Reviews',
    template: '%s | FuelVoice',
  },
  description: 'Community-driven platform for honest fuel station reviews. Discover quality petrol pumps, report fraud, and make informed choices about fuel quality and service worldwide.',
  keywords: ['petrol pump reviews', 'gas station reviews', 'fuel station', 'fuel quality', 'consumer complaints', 'petrol bunk'],
  authors: [{ name: 'FuelVoice Community' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FuelVoice',
    title: 'FuelVoice — Honest Petrol Pump & Gas Station Reviews',
    description: 'Community-driven platform for honest fuel station reviews worldwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FuelVoice — Honest Fuel Station Reviews',
    description: 'Community-driven platform for honest fuel station reviews worldwide.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      {/* Inline script to prevent dark mode flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('fuelvoice-theme');
                const isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              } catch {}
            `,
          }}
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⛽</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
