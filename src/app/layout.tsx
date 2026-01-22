import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SolaCheck",
  description: "AWP Projekt für das Zukunftsforum Nachhaltigkeit",
  manifest: "/solacheck/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SolaCheck",
  },
  icons: {
    icon: [
      { url: "/solacheck/favicon.ico", sizes: "any" },
      { url: "/solacheck/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/solacheck/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/solacheck/icon-192x192.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white relative">
        {/* Globales Logo */}
        <div className="fixed top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-50 h-14 flex items-center">
          <Logo size={80} resetOnClick />
        </div>
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
