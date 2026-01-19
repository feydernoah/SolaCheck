'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const ANIMATION_FRAMES = {
  TOTAL: 11,
  INTERVAL_MS: 100,
  PATH_PATTERN: '/solacheck/solaCalculating/Sola_rechnet_',
  FILE_EXTENSION: '.png',
} as const;

export function SolaCalculatingAnimation() {
  const [currentFrame, setCurrentFrame] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev % ANIMATION_FRAMES.TOTAL) + 1);
    }, ANIMATION_FRAMES.INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const imageSrc = `${ANIMATION_FRAMES.PATH_PATTERN}${currentFrame.toString()}${ANIMATION_FRAMES.FILE_EXTENSION}`;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <Image
        src={imageSrc}
        alt="Dein Ergebnis wird berechnet"
        width={128}
        height={128}
        className="object-contain"
        priority
      />
    </div>
  );
}
