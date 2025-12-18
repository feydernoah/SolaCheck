import type { Metadata, Viewport } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";


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
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="de">
      <body className="min-h-screen bg-white relative">
        {/* Globales Logo oben links */}
        <div className="fixed top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-50">
          <Link href="/" aria-label="Zur Startseite">
            <Image
              src="/solacheck/LogoSolaCheck.png"
              alt="SolaCheck Logo"
              width={48}
              height={48}
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-lg"
              priority
            />
          </Link>
        </div>

        {/* Seiteninhalt */}
        {children}
      </body>
    </html>
  );
}
