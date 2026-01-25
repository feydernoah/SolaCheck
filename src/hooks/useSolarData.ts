import { useState, useCallback } from 'react';
import type { SolarData, Coordinates } from '@/types/economic';

const SOLAR_DATA_COOKIE_NAME = 'solacheck_pvgis_data';
const COOKIE_MAX_AGE_DAYS = 1;

interface SolarDataResponse {
  success: boolean;
  data?: SolarData;
  error?: string;
  fallbackUsed?: boolean;
}

interface UseSolarDataReturn {
  isLoading: boolean;
  error: string | null;
  solarData: SolarData | null;
  fetchSolarData: (
    coordinates: Coordinates,
    orientation?: string,
    mounting?: string
  ) => Promise<SolarData | null>;
  getSolarDataFromCookie: () => SolarData | null;
  clearSolarData: () => void;
}

function serializeSolarData(data: SolarData): string {
  return btoa(JSON.stringify(data));
}

function deserializeSolarData(cookieValue: string): SolarData | null {
  try {
    return JSON.parse(atob(cookieValue)) as SolarData;
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === 'undefined') return;
  
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${String(maxAgeSeconds)}; SameSite=Strict`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; path=/; max-age=0`;
}

function coordinatesMatch(
  stored: { lat: number; lon: number },
  current: Coordinates
): boolean {
  const tolerance = 0.001;
  return (
    Math.abs(stored.lat - current.lat) < tolerance &&
    Math.abs(stored.lon - current.lon) < tolerance
  );
}

export function useSolarData(): UseSolarDataReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);

  const getSolarDataFromCookie = useCallback((): SolarData | null => {
    const cookieValue = getCookie(SOLAR_DATA_COOKIE_NAME);
    if (!cookieValue) return null;
    
    const data = deserializeSolarData(cookieValue);
    if (data) {
      setSolarData(data);
    }
    return data;
  }, []);

  const getCachedDataForCoordinates = useCallback(
    (coordinates: Coordinates): SolarData | null => {
      const cookieValue = getCookie(SOLAR_DATA_COOKIE_NAME);
      if (!cookieValue) return null;
      
      const data = deserializeSolarData(cookieValue);
      if (!data) return null;
      
      if (coordinatesMatch(data.location, coordinates)) {
        return data;
      }
      
      return null;
    },
    []
  );

  const fetchSolarData = useCallback(
    async (
      coordinates: Coordinates,
      orientation?: string,
      mounting?: string
    ): Promise<SolarData | null> => {
      const cachedData = getCachedDataForCoordinates(coordinates);
      if (cachedData) {
        console.log('[useSolarData] Using cached PVGIS data from cookie');
        setSolarData(cachedData);
        return cachedData;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          lat: coordinates.lat.toString(),
          lon: coordinates.lon.toString(),
        });
        
        if (orientation) {
          params.set('orientation', orientation);
        }
        if (mounting) {
          params.set('mounting', mounting);
        }

        const response = await fetch(`/solacheck/api/solar-data?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${String(response.status)}`);
        }

        const result: SolarDataResponse = await response.json();

        if (!result.success || !result.data) {
          console.error('[useSolarData] PVGIS API failed:', result.error);
          setError(result.error ?? 'Failed to fetch solar data');
          setIsLoading(false);
          return null;
        }

        setCookie(
          SOLAR_DATA_COOKIE_NAME,
          serializeSolarData(result.data),
          COOKIE_MAX_AGE_DAYS
        );

        setSolarData(result.data);
        setIsLoading(false);
        
        console.log(
          `[useSolarData] PVGIS data fetched: ${String(result.data.annualYieldKwhPerKwp)} kWh/kWp/year`
        );
        
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useSolarData] Fetch error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    },
    [getCachedDataForCoordinates]
  );

  const clearSolarData = useCallback(() => {
    deleteCookie(SOLAR_DATA_COOKIE_NAME);
    setSolarData(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    solarData,
    fetchSolarData,
    getSolarDataFromCookie,
    clearSolarData,
  };
}
