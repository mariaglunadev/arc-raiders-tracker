import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

// --- 1. CONFIGURACIÓN DE SEO (METADATOS) ---
export const metadata: Metadata = {
  // Título: Destacamos la función principal (Vender vs Reciclar)
  title: "ARC Raiders Tracker | Sell vs Recycle Calculator & Crafting",
  
  // Descripción: Explicamos que es rápido, directo y para economía.
  description: "Stop guessing. Instantly check if you should SELL or RECYCLE your loot in ARC Raiders. The fastest item database for crafting recipes, upgrade costs, and market values.",
  
  // Keywords: Agregamos términos de "economía" y "rapidez"
  keywords: [
    "ARC Raiders", 
    "Item Tracker", 
    "Sell or Recycle", 
    "Loot Value", 
    "Crafting Recipes", 
    "Economy Calculator", 
    "Embark Studios", 
    "Cheat Sheet", 
    "Companion App"
  ],
  
  authors: [{ name: "MariaGluna Dev" }],
  
  // Open Graph (Cómo se ve en Discord/WhatsApp/Twitter)
  openGraph: {
    title: "ARC Raiders Tracker | Sell or Recycle?",
    description: "Instant loot decisions. Check item values, crafting recipes, and upgrade costs in seconds.",
    url: "https://arcraiderstracker.com/", // Asegúrate que esta sea tu URL final
    siteName: "ARC Raiders Tracker",
    images: [
      {
        url: "/og-image.jpg", // Recuerda crear esta imagen y ponerla en /public
        width: 1200,
        height: 630,
        alt: "ARC Raiders Tracker Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "ARC Raiders Tracker | Pro Economy Tool",
    description: "Don't lose money. Check if you should Sell or Recycle your items instantly.",
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