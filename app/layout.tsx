// ==========================================
// app\layout.tsx
// ==========================================
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Spectral, Orbitron, Tektur } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets:["latin", "cyrillic"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight:["400", "500", "600", "700"],
  style:["normal", "italic"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight:["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const tektur = Tektur({
  variable: "--font-chakra-petch",
  subsets: ["latin", "cyrillic"], 
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cataclysm-accd.vercel.app'),
  applicationName: 'cataclysm',
  appleWebApp: {
    title: 'cataclysm',
    statusBarStyle: 'black-translucent',
  },
  title: {
    default: "cataclysm",
    template: "%s",
  },
  description: "Журнал cataclysm. Публикация текстов в рамках современной философии и за её пределами.",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: "ziDM2wLodjMBXotd4EnzLBmpYNaOzE4TXbJPn_LycJ8",
  },
  openGraph: {
    title: "cataclysm",
    description: "Журнал cataclysm. Публикация текстов в рамках современной философии и за её пределами.",
    url: "/",
    siteName: "cataclysm",
    locale: "ru_RU",
    type: "website",
    images:[
      {
        url: "/og-image-default.jpg",
        width: 1200,
        height: 630,
        alt: "cataclysm cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "cataclysm",
    description: "Журнал cataclysm. Публикация текстов в рамках современной философии и за её пределами.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'cataclysm',
    alternateName:['cataclysm journal', 'ACCD'],
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cataclysm-accd.vercel.app',
  };

  const themeInitializationScript = `
    (function() {
      document.documentElement.setAttribute('data-theme', 'dark');
    })();
  `;

  return (
    <html lang="ru" className={`${jetbrainsMono.variable} ${spectral.variable} ${orbitron.variable} ${tektur.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-serif bg-theme-bg text-theme-text">
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
        <ThemeProvider>
          <main className="flex-grow">
            {children}
          </main>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}