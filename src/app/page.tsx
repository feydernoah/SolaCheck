"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const chatMessages = [
  "Hallo! Willkommen bei SolaCheck. Ich bin Sola und helfe dir gerne weiter! 👋",
  "Bereit für dein Quiz? Klick einfach auf den Start-Button! 🚀",
  "Ich bin hier, falls du Fragen hast! 😊",
  "Lass uns gemeinsam durchstarten! 💪",
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % chatMessages.length);
    }, 5000); // 5 Sekunden

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Burger Menu - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-gray-800 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-gray-800 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-gray-800"></div>
        </button>

        {/* Menu Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl p-2 border border-gray-200">
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors text-gray-800"
            >
              Home
            </button>
            <Link
              href="/quiz"
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors text-gray-800"
            >
              Quiz starten
            </Link>
          </div>
        )}
      </div>

      {/* Small Logo - Top Left (Placeholder for now) */}
      <div className="fixed top-6 left-6 z-40">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
          Logo
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 -mt-16">
        {/* Main Logo */}
        <div className="-mb-25">
          <Image
            src="/solacheck/LogoSolaCheck.png"
            alt="Sola Check Logo"
            width={700}
            height={700}
            className="max-w-full h-auto"
            priority
            unoptimized
          />
        </div>

        {/* Start Button */}
        <Link href="/quiz">
          <button className="px-14 py-5 bg-gray-400 text-white text-xl font-semibold rounded-full hover:bg-yellow-400 hover:text-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
            Start
          </button>
        </Link>
      </div>

      {/* Chat Buddy - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="flex items-start gap-3">
          {/* Chat Buddy Image */}
          <Image
            src="/solacheck/SolaWinkend.png"
            alt="Sola Chat Buddy"
            width={200}
            height={200}
            className="max-w-full h-auto"
            unoptimized
          />

          {/* Speech Bubble */}
          <div className="bg-white p-6 rounded-2xl rounded-bl-none shadow-lg border border-gray-200 max-w-md -mt-8">
            <p className="text-gray-800 text-lg">
              {chatMessages[currentMessageIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
