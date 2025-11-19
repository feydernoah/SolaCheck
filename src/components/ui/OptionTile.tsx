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
        ${
          selected
            ? 'border-brand-primary bg-brand-primary/10 shadow-tile-hover scale-[0.98]'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-primary/50 hover:shadow-tile hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      {/* Icon Container */}
      {icon && (
        <div className={`
          text-4xl sm:text-5xl transition-transform duration-200
          ${selected ? 'scale-110' : ''}
        `}>
          {icon}
        </div>
      )}
      
      {/* Label */}
      <span className={`
        text-base sm:text-lg font-semibold text-center
        ${selected ? 'text-brand-primary' : 'text-gray-700 dark:text-gray-200'}
      `}>
        {label}
      </span>
      
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center animate-scale-in">
          <svg 
            className="w-4 h-4 text-white" 
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
