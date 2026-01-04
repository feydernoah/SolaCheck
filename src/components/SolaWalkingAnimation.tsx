'use client';

import { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';

const ANIMATION_FRAMES = {
  TOTAL: 9,
  INTERVAL_MS: 100,
  PATH_PATTERN: '/solacheck/solaWalking/Sola_walk_',
  FILE_EXTENSION: '.svg',
  DURATION_MS: 2500, // Total duration for the transition
  GAP_WIDTH: 200, // Gap width in pixels between pages
} as const;

interface SolaWalkingAnimationProps {
  onComplete?: () => void;
  fromPage?: ReactNode; // Content of the page we're leaving
  toPage?: ReactNode; // Content of the page we're entering
}

export function SolaWalkingAnimation({ onComplete, fromPage, toPage }: SolaWalkingAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Frame animation interval
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev % ANIMATION_FRAMES.TOTAL) + 1);
    }, ANIMATION_FRAMES.INTERVAL_MS);

    // Overall progress animation
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
    }, 16); // ~60fps

    return () => {
      clearInterval(frameInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const imageSrc = `${ANIMATION_FRAMES.PATH_PATTERN}${currentFrame.toString()}${ANIMATION_FRAMES.FILE_EXTENSION}`;
  
  // Calculate positions
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const fromPageOffset = -(progress * (viewportWidth + ANIMATION_FRAMES.GAP_WIDTH));
  const toPageOffset = viewportWidth + ANIMATION_FRAMES.GAP_WIDTH - (progress * (viewportWidth + ANIMATION_FRAMES.GAP_WIDTH));
  
  // Start Sola at bottom-left (matching landing page buddy position)
  // Then walk across with the animation
  const startPosition = 4; // 4px from left (matching bottom-1 left-1)
  const endPosition = viewportWidth + 150; // Walk off screen to the right
  const solaPosition = startPosition + (progress * (endPosition - startPosition));

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* From Page - sliding out to the left */}
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

      {/* To Page - sliding in from the right */}
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

      {/* Sola walking - starts from bottom left */}
      <div 
        className="absolute bottom-1"
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
