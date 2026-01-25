'use client';

import { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';

const ANIMATION_FRAMES = {
  TOTAL: 9,
  INTERVAL_MS: 100,
  PATH_PATTERN: '/solacheck/solaWalking/Sola_walk_',
  FILE_EXTENSION: '.svg',
  DURATION_MS: 2500,
  GAP_WIDTH: 200,
} as const;

interface SolaWalkingAnimationProps {
  onComplete?: () => void;
  fromPage?: ReactNode;
  toPage?: ReactNode;
}

export function SolaWalkingAnimation({ onComplete, fromPage, toPage }: SolaWalkingAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev % ANIMATION_FRAMES.TOTAL) + 1);
    }, ANIMATION_FRAMES.INTERVAL_MS);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / ANIMATION_FRAMES.DURATION_MS, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(progressInterval);
        clearInterval(frameInterval);
        setTimeout(() => {
          onComplete?.();
        }, 100);
      }
    }, 16);

    return () => {
      clearInterval(frameInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const imageSrc = `${ANIMATION_FRAMES.PATH_PATTERN}${currentFrame.toString()}${ANIMATION_FRAMES.FILE_EXTENSION}`;
  
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const fromPageOffset = -(progress * (viewportWidth + ANIMATION_FRAMES.GAP_WIDTH));
  const toPageOffset = viewportWidth + ANIMATION_FRAMES.GAP_WIDTH - (progress * (viewportWidth + ANIMATION_FRAMES.GAP_WIDTH));
  
  const startPosition = 4;
  const endPosition = viewportWidth + 150;
  const solaPosition = startPosition + (progress * (endPosition - startPosition));

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {fromPage && (
        <div 
          className="absolute inset-0 w-screen h-screen"
          style={{ 
            transform: `translateX(${fromPageOffset.toString()}px)`,
            transition: 'none',
          }}
        >
          {fromPage}
        </div>
      )}

      {toPage && (
        <div 
          className="absolute inset-0 w-screen h-screen"
          style={{ 
            transform: `translateX(${toPageOffset.toString()}px)`,
            transition: 'none',
          }}
        >
          {toPage}
        </div>
      )}

      <div 
        className="absolute bottom-1 pointer-events-none"
        style={{ 
          left: `${solaPosition.toString()}px`,
        }}
      >
        <Image
          src={imageSrc}
          alt="Sola geht"
          width={200}
          height={200}
          className="w-32 md:w-48 h-auto object-contain"
          priority
        />
      </div>
    </div>
  );
}
