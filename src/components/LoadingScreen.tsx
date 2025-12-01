interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingScreen({ isVisible, message = 'Berechne deine Empfehlung...' }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fade-in">
      <style jsx>{`
        @keyframes rotateEarth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sunArc {
          0% {
            transform: translate(-55px, 20px) scale(0.7);
            opacity: 0.3;
          }
          5% {
            transform: translate(-52px, 15px) scale(0.75);
            opacity: 0.4;
          }
          10% {
            transform: translate(-48px, 8px) scale(0.8);
            opacity: 0.55;
          }
          15% {
            transform: translate(-43px, 0px) scale(0.85);
            opacity: 0.7;
          }
          20% {
            transform: translate(-38px, -10px) scale(0.9);
            opacity: 0.82;
          }
          25% {
            transform: translate(-32px, -20px) scale(0.95);
            opacity: 0.9;
          }
          30% {
            transform: translate(-25px, -28px) scale(0.98);
            opacity: 0.95;
          }
          35% {
            transform: translate(-18px, -35px) scale(1.02);
            opacity: 0.98;
          }
          40% {
            transform: translate(-10px, -40px) scale(1.06);
            opacity: 1;
          }
          45% {
            transform: translate(-5px, -43px) scale(1.08);
            opacity: 1;
          }
          50% {
            transform: translate(0px, -45px) scale(1.1);
            opacity: 1;
          }
          55% {
            transform: translate(5px, -43px) scale(1.08);
            opacity: 1;
          }
          60% {
            transform: translate(10px, -40px) scale(1.06);
            opacity: 1;
          }
          65% {
            transform: translate(18px, -35px) scale(1.02);
            opacity: 0.98;
          }
          70% {
            transform: translate(25px, -28px) scale(0.98);
            opacity: 0.95;
          }
          75% {
            transform: translate(32px, -20px) scale(0.95);
            opacity: 0.9;
          }
          80% {
            transform: translate(38px, -10px) scale(0.9);
            opacity: 0.82;
          }
          85% {
            transform: translate(43px, 0px) scale(0.85);
            opacity: 0.7;
          }
          90% {
            transform: translate(48px, 8px) scale(0.8);
            opacity: 0.55;
          }
          95% {
            transform: translate(52px, 15px) scale(0.75);
            opacity: 0.4;
          }
          100% {
            transform: translate(55px, 20px) scale(0.7);
            opacity: 0.3;
          }
        }
        .rotating-earth {
          animation: rotateEarth 12s linear infinite;
        }
        .sunrise-sunset {
          animation: sunArc 8s linear infinite;
        }
      `}</style>
      
      <div className="text-center">
        {/* Animated Earth with Sun */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-28 h-28">
            {/* Modern Globe Base - gradient ocean */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700"></div>
            
            {/* Atmospheric glow ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-radial from-blue-300/30 via-blue-400/10 to-transparent blur-md"></div>
            
            {/* Simplified continents - flat design style */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Geometric land shapes - modern minimal style */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
                <defs>
                  <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                
                {/* Simplified world map - organic shapes */}
                
                {/* Americas - vertical landmass left side */}
                <ellipse cx="22" cy="35" rx="8" ry="14" 
                         fill="url(#landGradient)" opacity="0.92" 
                         transform="rotate(-12 22 35)" />
                <ellipse cx="20" cy="55" rx="6" ry="10" 
                         fill="url(#landGradient)" opacity="0.92" 
                         transform="rotate(-8 20 55)" />
                <circle cx="24" cy="48" r="5" 
                        fill="url(#landGradient)" opacity="0.90" />
                
                {/* Europe - small cluster top-center */}
                <ellipse cx="50" cy="24" rx="7" ry="5" 
                         fill="url(#landGradient)" opacity="0.92" 
                         transform="rotate(15 50 24)" />
                
                {/* Africa - centered large mass */}
                <ellipse cx="56" cy="50" rx="10" ry="16" 
                         fill="url(#landGradient)" opacity="0.92" 
                         transform="rotate(-5 56 50)" />
                <circle cx="54" cy="45" r="6" 
                        fill="url(#landGradient)" opacity="0.88" />
                
                {/* Asia - large irregular mass top-right */}
                <ellipse cx="82" cy="28" rx="14" ry="10" 
                         fill="url(#landGradient)" opacity="0.92" 
                         transform="rotate(-8 82 28)" />
                <ellipse cx="88" cy="40" rx="8" ry="11" 
                         fill="url(#landGradient)" opacity="0.90" 
                         transform="rotate(12 88 40)" />
                <circle cx="76" cy="36" r="7" 
                        fill="url(#landGradient)" opacity="0.91" />
                
                {/* Southeast Asia islands */}
                <ellipse cx="85" cy="56" rx="4" ry="6" 
                         fill="url(#landGradient)" opacity="0.88" 
                         transform="rotate(25 85 56)" />
                
                {/* Australia - bottom right */}
                <ellipse cx="88" cy="78" rx="9" ry="7" 
                         fill="url(#landGradient)" opacity="0.90" 
                         transform="rotate(-18 88 78)" />
                
                {/* Additional connecting land patches for organic feel */}
                <circle cx="44" cy="36" r="4" 
                        fill="url(#landGradient)" opacity="0.85" />
                <circle cx="68" cy="48" r="3.5" 
                        fill="url(#landGradient)" opacity="0.82" />
              </svg>
            </div>
            
            {/* Glossy top highlight - modern glass effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-white/10 via-30% to-transparent"></div>
            
            {/* Soft white clouds - floating layer */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
              <div className="absolute top-12 left-8 w-14 h-4 bg-white/70 rounded-full blur-md"></div>
              <div className="absolute top-20 right-10 w-12 h-3 bg-white/60 rounded-full blur-md"></div>
              <div className="absolute bottom-16 left-14 w-10 h-3 bg-white/65 rounded-full blur-md"></div>
            </div>
            
            {/* Subtle night shadow - right side */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-l from-slate-900/30 via-transparent to-transparent"></div>
            
            {/* Bottom depth shadow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/25 via-transparent via-60% to-transparent"></div>
            
            {/* Outer rim - sphere definition */}
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"></div>
            
            {/* Sun with sunrise/sunset motion */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="sunrise-sunset">
                <div className="relative w-10 h-10">
                  {/* Sun outer glow */}
                  <div className="absolute -inset-2 bg-yellow-400/40 rounded-full blur-xl animate-pulse"></div>
                  {/* Sun middle glow */}
                  <div className="absolute -inset-1 bg-yellow-400/60 rounded-full blur-lg"></div>
                  {/* Sun core */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 rounded-full shadow-lg">
                    {/* Sun surface texture */}
                    <div className="absolute inset-1 bg-gradient-to-tr from-yellow-300/50 via-transparent to-transparent rounded-full"></div>
                  </div>
                  {/* Rotating sun rays */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-yellow-200 -translate-x-1/2 -translate-y-2 blur-sm"></div>
                    <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-yellow-200 -translate-x-1/2 translate-y-2 blur-sm"></div>
                    <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-yellow-200 -translate-y-1/2 -translate-x-2 blur-sm"></div>
                    <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-yellow-200 -translate-y-1/2 translate-x-2 blur-sm"></div>
                    {/* Diagonal rays */}
                    <div className="absolute top-1 left-1 w-1.5 h-0.5 bg-yellow-200 -translate-x-1.5 -translate-y-1.5 rotate-45 blur-sm"></div>
                    <div className="absolute top-1 right-1 w-1.5 h-0.5 bg-yellow-200 translate-x-1.5 -translate-y-1.5 -rotate-45 blur-sm"></div>
                    <div className="absolute bottom-1 left-1 w-1.5 h-0.5 bg-yellow-200 -translate-x-1.5 translate-y-1.5 -rotate-45 blur-sm"></div>
                    <div className="absolute bottom-1 right-1 w-1.5 h-0.5 bg-yellow-200 translate-x-1.5 translate-y-1.5 rotate-45 blur-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-heading-3 font-semibold text-gray-800 mb-2">
          {message}
        </p>
        <p className="text-body-sm text-gray-600">
          Das dauert nur einen Moment...
        </p>
      </div>
    </div>
  );
}
