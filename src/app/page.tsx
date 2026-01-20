"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Button } from "@/components/ui/Button";

const chatMessages = [
  "Hallo! Willkommen bei SolaCheck. Ich bin Sola und helfe dir gerne weiter! 👋",
  "Bereit für dein Quiz? Klick einfach auf den Start-Button! 🚀",
  "Ich bin hier, falls du Fragen hast! 😊",
  "Lass uns gemeinsam durchstarten! 💪",
];

export default function LandingPage() {
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
      <BurgerMenu showHome={false} showQuiz />
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
        {/* Intro Text */}
        <p className="mt-8 mb-12 max-w-xl text-center text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">
          SolaCheck hilft dir, schnell und unkompliziert zu verstehen,
          ob ein Balkonkraftwerk für dich die richtige Lösung ist.
        </p>
        {/* Buttons */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link href="/quiz">
            <Button
              size="lg"
              className="px-10 py-4 sm:px-12 sm:py-4 md:px-12 md:py-4 lg:px-16 lg:py-6 text-lg sm:text-xl md:text-xl lg:text-2xl"
            >
              Start
            </Button>
          </Link>

          <Link href="/info-page">
            <Button className="sola-secondary-button">
              Mehr Infos
            </Button>
          </Link>
        </div>

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
              <p className="text-gray-800 text-[10px] sm:text-xs md:text-sm leading-snug">
                {chatMessages[currentMessageIndex]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}