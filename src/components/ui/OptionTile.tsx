import { ReactNode } from 'react';

interface OptionTileProps {
  label: string;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionTile({ 
  label, 
  icon, 
  selected, 
  onClick, 
  disabled = false 
}: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full min-h-[120px] sm:min-h-[140px] p-6 
        rounded-xl border-2 transition-all duration-200
        flex flex-col items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed
        bg-white
        ${
          selected
            ? 'border-yellow-400 shadow-lg scale-[0.98]'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      {/* Icon Container */}
      {icon && (
        <div className={`
          text-5xl sm:text-6xl transition-all duration-200
          ${selected ? 'scale-110 text-yellow-400' : 'text-gray-600'}
        `}>
          {icon}
        </div>
      )}
      
      {/* Label */}
      <span className={`
        text-base sm:text-lg font-semibold text-center
        ${selected ? 'text-gray-800' : 'text-gray-700'}
      `}>
        {label}
      </span>
      
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-scale-in">
          <svg 
            className="w-4 h-4 text-gray-800" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="3" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
    </button>
  );
}
