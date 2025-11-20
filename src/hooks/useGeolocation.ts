import { useState } from 'react';

interface GeolocationState {
  isLoading: boolean;
  error: string | null;
  coordinates: { lat: number; lon: number } | null;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => void;
  clearError: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  const getCurrentLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Geolocation wird von deinem Browser nicht unterstützt.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoordinates(coords);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht ermittelt werden.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standortinformationen sind nicht verfügbar.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Zeitüberschreitung bei der Standortabfrage.';
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    coordinates,
    getCurrentLocation,
    clearError,
  };
}
