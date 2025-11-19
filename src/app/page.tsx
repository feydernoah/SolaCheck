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
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % chatMessages.length);
    }, 5000); // 5 Sekunden

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Burger Menu - Top Right */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-white p-3 sm:p-4 md:p-4 lg:p-5 xl:p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          aria-label="Menu"
        >
          <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800 mb-2"></div>
          <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800 mb-2"></div>
          <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800"></div>
        </button>

        {/* Menu Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 md:w-56 lg:w-64 xl:w-64 bg-white rounded-lg shadow-xl p-2 border border-gray-200">
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
            >
              Home
            </button>
            <Link
              href="/quiz"
              className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
            >
              Quiz starten
            </Link>
          </div>
        )}
      </div>

      {/* Small Logo - Top Left (Placeholder for now) */}
      <div className="fixed top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-40">
        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
          Logo
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 md:py-8 -mt-0 md:-mt-16">
        {/* Main Logo */}
        <div className="md:-mb-8 w-full max-w-sm min-h-[600px]:max-w-md sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <Image
            src="/solacheck/LogoSolaCheck.png"
            alt="Sola Check Logo"
            width={700}
            height={700}
            className="w-full h-auto"
            priority
            unoptimized
          />
        </div>

        {/* Start Button */}
        <Link href="/quiz">
          <button className="mb-24 sm:mb-32 md:mb-32 lg:mb-32 xl:mb-0 px-10 py-4 sm:px-12 sm:py-4 md:px-12 md:py-4 lg:px-16 lg:py-6 xl:px-16 xl:py-6 bg-gray-400 text-white text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-2xl font-semibold rounded-full active:bg-yellow-400 active:text-gray-800 md:hover:bg-yellow-400 md:hover:text-gray-800 transition-colors shadow-lg active:shadow-xl md:hover:shadow-xl transform active:scale-105 md:hover:scale-105 transition-transform">
            Start
          </button>
        </Link>
      </div>

      {/* Chat Buddy - Bottom Left */}
      <div className="fixed bottom-1 left-1 md:bottom-6 md:left-6 z-30 max-w-[calc(100vw-1rem)]">
        <div className="flex items-start gap-2 sm:gap-2 md:gap-3">
          {/* Chat Buddy Image */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setSpeechBubbleVisible(!speechBubbleVisible)}
              className="cursor-pointer active:scale-95 transition-transform"
              aria-label="Toggle speech bubble"
            >
              <Image
                src="/solacheck/SolaWinkend.png"
                alt="Sola Chat Buddy"
                width={200}
                height={200}
                className="w-32 min-[375px]:w-36 sm:w-40 md:w-48 lg:w-52 xl:w-52 h-auto"
                unoptimized
              />
            </button>
          </div>

          {/* Speech Bubble */}
          {speechBubbleVisible && (
            <div className="bg-white p-3 min-[375px]:p-3.5 sm:p-4 md:p-6 lg:p-6 xl:p-6 rounded-2xl rounded-bl-none shadow-lg border border-gray-200 max-w-[160px] min-[375px]:max-w-[180px] sm:max-w-[200px] md:max-w-md lg:max-w-md xl:max-w-[280px] min-[1330px]:!max-w-[305px] min-[1380px]:!max-w-[330px] min-[1430px]:!max-w-[355px] min-[1480px]:!max-w-[380px] min-[1530px]:!max-w-[405px] min-[1580px]:!max-w-[430px] min-[1605px]:!max-w-md -mt-2 min-[375px]:-mt-3 sm:-mt-4 md:-mt-8">
              <p className="text-gray-800 text-[10px] min-[375px]:text-xs sm:text-xs md:text-lg lg:text-lg xl:text-lg leading-snug">
                {chatMessages[currentMessageIndex]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}