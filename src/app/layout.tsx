import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "SolaCheck",
  description: "AWP Projekt für das Zukunftsforum Nachhaltigkeit",
  manifest: "/solacheck/manifest.json",
  icons: {
    icon: "/solacheck/icon-192x192.png",
    apple: "/solacheck/icon-192x192.png",
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
        <div className="fixed top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-50">
          <Logo size={80} resetOnClick />
        </div>

        {children}
      </body>
    </html>
  );
}
