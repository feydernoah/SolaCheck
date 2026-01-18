"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Sad Sola Character */}
      <div className="mb-8">
        <Image
          src="/solacheck/SolaNachdenklich.png"
          alt="Sola ist nachdenklich"
          width={200}
          height={200}
          className="w-40 sm:w-48 md:w-56 h-auto"
          unoptimized
        />
      </div>

      {/* Message */}
      <div className="text-center max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Du bist offline
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          Es scheint, als hättest du gerade keine Internetverbindung. 
          Bitte überprüfe deine Verbindung und versuche es erneut.
        </p>

        {/* Retry Button */}
        <Button onClick={handleRetry} size="lg">
          Erneut versuchen
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Einige Funktionen von SolaCheck benötigen eine Internetverbindung.</p>
      </div>
    </div>
  );
}
