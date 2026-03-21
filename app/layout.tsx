import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Equanima — Philosophical AI Companion",
  description:
    "Where ancient wisdom meets modern challenges. Draw on Stoicism, Buddhism, Existentialism, Taoism and more to navigate life with greater clarity.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Equanima",
  },
  openGraph: {
    title: "Equanima — Philosophical AI Companion",
    description: "Where ancient wisdom meets modern challenges",
    type: "website",
    siteName: "Equanima",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equanima — Philosophical AI Companion",
    description: "Where ancient wisdom meets modern challenges",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a84c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-charcoal text-ivory antialiased">
        {children}
      </body>
    </html>
  );
}
