import { useEffect, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationInput({ value, onChange, placeholder }: LocationInputProps) {
  const { isLoading, error, coordinates, getCurrentLocation } = useGeolocation();
  const hasUpdated = useRef(false);

  // Update parent component when coordinates are received
  useEffect(() => {
    if (coordinates && !hasUpdated.current) {
      const locationData = `${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`;
      onChange(locationData);
      hasUpdated.current = true;
    }
  }, [coordinates, onChange]);

  // Reset the flag when value is cleared
  useEffect(() => {
    if (!value) {
      hasUpdated.current = false;
    }
  }, [value]);

  return (
    <div className="max-w-md w-full">
      {/* Standort-Button */}
      <div className="mb-4">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Standort wird ermittelt...
            </>
          ) : (
            <>
              📍 Aktuellen Standort nutzen
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">oder</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
      
      {/* Text Input */}
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors text-lg"
        />
      </div>
      
      {/* Zeige Koordinaten an, wenn vorhanden */}
      {value && value.includes(',') && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ Standort erfasst: {value}
        </div>
      )}
    </div>
  );
}
