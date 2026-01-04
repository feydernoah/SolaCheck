'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const ANIMATION_FRAMES = {
  TOTAL: 9,
  INTERVAL_MS: 100, // Faster frame changes
  PATH_PATTERN: '/solacheck/solaWalking/Sola_walk_',
  FILE_EXTENSION: '.svg',
  DURATION_MS: 1500, // Faster movement across screen
} as const;

interface SolaWalkingAnimationProps {
  onComplete?: () => void;
}

export function SolaWalkingAnimation({ onComplete }: SolaWalkingAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Frame animation interval
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev % ANIMATION_FRAMES.TOTAL) + 1);
    }, ANIMATION_FRAMES.INTERVAL_MS);

    // Position animation - move from left to right and beyond
    const startTime = Date.now();
    const positionInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / ANIMATION_FRAMES.DURATION_MS;
      setPosition(progress * 100); // No limit, let it go past 100%

      // Only complete when fully off screen (at ~110%)
      if (progress >= 1.1) {
        clearInterval(positionInterval);
        clearInterval(frameInterval);
        onComplete?.();
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(frameInterval);
      clearInterval(positionInterval);
    };
  }, [onComplete]);

  const imageSrc = `${ANIMATION_FRAMES.PATH_PATTERN}${currentFrame.toString()}${ANIMATION_FRAMES.FILE_EXTENSION}`;

  return (
    <div className="fixed inset-0 bg-white flex items-end z-50 overflow-hidden">
      <div 
        className="absolute bottom-4"
        style={{ 
          left: `${position.toString()}%`,
        }}
      >
        <Image
          src={imageSrc}
          alt="Sola geht"
          width={150}
          height={150}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
