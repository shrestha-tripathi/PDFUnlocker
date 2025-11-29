import type { Metadata, Viewport } from 'next';
import './globals.css';
// TODO: Re-enable PWA features in the future
// import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { ThemeProvider } from '@/lib/hooks/useTheme';

export const metadata: Metadata = {
  title: 'PDF Password Remover - Free & Private',
  description: 'Remove passwords from PDF files instantly. 100% free, works offline, your files never leave your device.',
  keywords: ['PDF', 'password remover', 'unlock PDF', 'decrypt PDF', 'free', 'privacy'],
  authors: [{ name: 'PDF Password Remover' }],
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PDF Unlock',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'PDF Password Remover - Free & Private',
    description: 'Remove passwords from PDF files instantly. 100% free, works offline.',
    siteName: 'PDF Password Remover',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icons/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark) || (theme === 'system' && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          {/* TODO: Re-enable PWA features in the future */}
          {/* <ServiceWorkerRegistration /> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
