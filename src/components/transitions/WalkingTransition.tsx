import React, { useEffect, useRef } from 'react';
import SolaWalkingAnimation from '../SolaWalkingAnimation';

interface WalkingTransitionProps {
  show: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}

/**
 * WalkingTransition animates the transition between two pages:
 * - The old page slides out to the left
 * - The new page slides in from the right
 * - Sola walks from left to right in between
 */
const WalkingTransition: React.FC<WalkingTransitionProps> = ({ show, onComplete, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && containerRef.current) {
      // Start animation
      containerRef.current.classList.add('walking-transition-active');
      // Animation duration should match CSS (3.5s)
      const timeout = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <div ref={containerRef} className={`walking-transition${show ? ' walking-transition-active' : ''}`}>
      <div className="walking-transition__old">
        {/* The old page will be slotted here by parent */}
      </div>
      <div className="walking-transition__sola">
        <SolaWalkingAnimation width={160} height={160} loop={false} frameRateMs={150} onAnimationEnd={onComplete} />
      </div>
      <div className="walking-transition__new">
        {children}
      </div>
    </div>
  );
};

export default WalkingTransition;
