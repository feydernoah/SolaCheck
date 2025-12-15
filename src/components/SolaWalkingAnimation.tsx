import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
interface SolaWalkingAnimationProps {
  frameCount?: number; // Number of frames in the animation
  frameRateMs?: number; // Time between frames in ms
  width?: number | string;
  height?: number | string;
  onAnimationEnd?: () => void;
  loop?: boolean;
  fileNamePattern?: string; // e.g. 'Sola_walk_1.svg'
  startIndex?: number; // e.g. 1 if files start at 1
}

// By default, we assume 130ms per frame and all frames are named frame0.svg, frame1.svg, ...
const SolaWalkingAnimation: React.FC<SolaWalkingAnimationProps> = ({
  frameCount = 9, // Display 9 frames: Sola_walk_1.svg ... Sola_walk_9.svg
  frameRateMs = 120,
  width = 120,
  height = 120,
  onAnimationEnd,
  loop = true,
  fileNamePattern = 'Sola_walk_{index}.svg',
  startIndex = 1,
}) => {
  const preloadCount = 8; // Preload 8 frames for smoothness
  const [frame, setFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all frames before starting animation
  useEffect(() => {
    let loaded = 0;
    for (let i = 0; i < preloadCount; i++) {
      const img = new window.Image();
      const frameNumber = (i + startIndex).toString();
      img.src = `/solacheck/solaWalking/${fileNamePattern.replace('{index}', frameNumber)}`;
      img.onload = () => {
        loaded++;
        if (loaded === preloadCount) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === preloadCount) setImagesLoaded(true);
      };
    }
  }, [preloadCount, fileNamePattern, startIndex]);

  useEffect(() => {
    if (!imagesLoaded) return;
    intervalRef.current = setInterval(() => {
      setFrame((prev) => {
        if (loop) {
          // Advance frame smoothly, looping with modulo
          return (prev + 1) % frameCount;
        } else {
          if (prev + 1 >= frameCount) {
            // Only call onAnimationEnd in a microtask after render
            if (onAnimationEnd) setTimeout(onAnimationEnd, 0);
            return prev; // Stop at last frame
          }
          return prev + 1;
        }
      });
    }, frameRateMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frameCount, frameRateMs, loop, onAnimationEnd, imagesLoaded]);


  // Frame files are named Sola_walk_1.svg, Sola_walk_2.svg, ... in public/solacheck
  // Use frameCount and startIndex for correct cycling
  const frameNumber = ((frame % frameCount) + startIndex).toString();
  const frameSrc = `/solacheck/solaWalking/${fileNamePattern.replace('{index}', frameNumber)}`;

  if (!imagesLoaded) {
    return (
      <div style={{ width, height, display: 'block', margin: '0 auto', background: 'transparent' }} />
    );
  }
  // Ensure width and height are numbers for <Image>
  const imgWidth = typeof width === 'number' ? width : parseInt(width, 10) || 120;
  const imgHeight = typeof height === 'number' ? height : parseInt(height, 10) || 120;
  return (
    <Image
      src={frameSrc}
      alt="Sola walking animation"
      width={imgWidth}
      height={imgHeight}
      style={{ display: 'block', margin: '0 auto' }}
      draggable={false}
      unoptimized
      priority
    />
  );
};

export default SolaWalkingAnimation;
