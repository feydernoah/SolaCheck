import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface SolaCalculationAnimationProps {
  frameCount?: number; // Number of frames in the animation
  frameRateMs?: number; // Time between frames in ms
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  fileNamePattern?: string; // e.g. 'Sola_rechnet_{index}.svg'
  startIndex?: number; // e.g. 1 if files start at 1
}

const SolaCalculationAnimation: React.FC<SolaCalculationAnimationProps> = ({
  frameCount = 9, // Sola_rechnet_1.svg ... Sola_rechnet_9.svg
  frameRateMs = 120,
  width = 160,
  height = 160,
  loop = true,
  fileNamePattern = 'Sola_rechnet_{index}.svg',
  startIndex = 1,
}) => {
  const [frame, setFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all frames before starting animation
  useEffect(() => {
    let loaded = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      const frameNumber = (i + startIndex).toString();
      img.src = `/solacheck/solaCalculating/${fileNamePattern.replace('{index}', frameNumber)}`;
      img.onload = () => {
        loaded++;
        if (loaded === frameCount) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === frameCount) setImagesLoaded(true);
      };
    }
  }, [frameCount, fileNamePattern, startIndex]);

  useEffect(() => {
    if (!imagesLoaded) return;
    intervalRef.current = setInterval(() => {
      setFrame((prev) => (loop ? (prev + 1) % frameCount : Math.min(prev + 1, frameCount - 1)));
    }, frameRateMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frameCount, frameRateMs, loop, imagesLoaded]);

  const frameNumber = ((frame % frameCount) + startIndex).toString();
  const frameSrc = `/solacheck/solaCalculating/${fileNamePattern.replace('{index}', frameNumber)}`;

  if (!imagesLoaded) {
    return <div style={{ width, height, display: 'block', margin: '0 auto', background: 'transparent' }} />;
  }
  const imgWidth = typeof width === 'number' ? width : parseInt(width, 10) || 160;
  const imgHeight = typeof height === 'number' ? height : parseInt(height, 10) || 160;
  return (
    <Image
      src={frameSrc}
      alt="Sola calculation animation"
      width={imgWidth}
      height={imgHeight}
      style={{ display: 'block', margin: '0 auto' }}
      draggable={false}
      unoptimized
      priority
    />
  );
};

export default SolaCalculationAnimation;
