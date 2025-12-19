import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Spectral, Orbitron } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  // ВАЖНО: Добавили 'italic', иначе курсив не подгрузится
  style: ["normal", "italic"], 
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// --- OGP НАСТРОЙКИ ---
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "cataclysm",
    template: "%s | cataclysm",
  },
  description: "Cybernetic Culture & Theory Fiction",
  openGraph: {
    title: "cataclysm",
    description: "Cybernetic Culture & Theory Fiction",
    url: "/",
    siteName: "cataclysm",
    locale: "ru_RU",
    type: "website",
    images: [
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
    description: "Cybernetic Culture & Theory Fiction",
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
  return (
    <html lang="ru" className={`${jetbrainsMono.variable} ${spectral.variable} ${orbitron.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-serif bg-[var(--background)] text-[var(--foreground)]">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}