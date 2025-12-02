//@app/layout.tsx
/**
 * Rôle :
 *  - Layout principal de l’application Next.js.
 *  - Définit la structure globale (Header, Toaster, Thème, Fontes).
 *  - Fournit les variables de polices et le contexte de thème.
 * 
 * Dépendances :
 *  - next-themes : pour la gestion du mode clair/sombre.
 *  - shadcnUI : pour la cohérence des couleurs via bg-background / text-foreground.
 *  - sonner : pour les notifications visuelles.
 * 
 * Routes parentes :
 *  - racine : /app/
 * 
 * Composants enfants :
 *  - Header
 *  - Toaster
 *  - children (les pages de l’app)
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Editor",
  description: "Éditeur collaboratif de livres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          {/* Toaster pour les notifications */}
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              className: "font-sans",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
