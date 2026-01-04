'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const ANIMATION_FRAMES = {
  TOTAL: 9,
  INTERVAL_MS: 80,
  PATH_PATTERN: '/solacheck/solaWalking/Sola_walk_',
  FILE_EXTENSION: '.svg',
  DURATION_MS: 2500, // Total animation duration
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

    // Position animation - move from left to right
    const startTime = Date.now();
    const positionInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_FRAMES.DURATION_MS, 1);
      setPosition(progress * 100);

      if (progress >= 1) {
        clearInterval(positionInterval);
        clearInterval(frameInterval);
        // Call onComplete after a short delay
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(frameInterval);
      clearInterval(positionInterval);
    };
  }, [onComplete]);

  const imageSrc = `${ANIMATION_FRAMES.PATH_PATTERN}${currentFrame.toString()}${ANIMATION_FRAMES.FILE_EXTENSION}`;

  return (
    <div className="fixed inset-0 bg-white flex items-end z-50">
      <div 
        className="absolute bottom-4 transition-transform duration-100"
        style={{ 
          left: `${position.toString()}%`,
          transform: `translateX(-50%)`,
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
