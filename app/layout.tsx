import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

// --- 1. CONFIGURACIÓN DE SEO (METADATOS) ---
export const metadata: Metadata = {
  title: "ARC Raiders Tracker | Crafting, Items & Maps",
  description: "The ultimate community companion for ARC Raiders. Find crafting recipes, item values, blueprint locations, and upgrade costs. Database updated for the latest beta.",
  keywords: ["ARC Raiders", "Tracker", "Database", "Crafting", "Loot", "Maps", "Embark Studios", "Wiki"],
  authors: [{ name: "MariaGLunaDev" }], // Tu nombre o marca
  openGraph: {
    title: "ARC Raiders Tracker",
    description: "Find items, recipes, and maps for ARC Raiders.",
    url: "https://arcraidertrackers.com/", // Tu URL real cuando la tengas
    siteName: "ARC Raiders Tracker",
    images: [
      {
        url: "/og-image.jpg", // Puedes subir una imagen 'og-image.jpg' a tu carpeta public
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC Raiders Tracker",
    description: "The ultimate community companion for ARC Raiders.",
    images: ["/og-image.jpg"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        {children}
      </body>
      
      {/* --- 2. GOOGLE ANALYTICS --- */}
      <GoogleAnalytics gaId="G-BSK8G4MSXG" />
    </html>
  );
}