/**
 * Hook for fetching and storing PVGIS solar radiation data
 * 
 * Uses cookies to store the PVGIS response to avoid repeated API calls
 * when users navigate back and forth in the quiz or reload the results page.
 */

import { useState, useCallback } from 'react';
import type { SolarData, Coordinates } from '@/types/economic';

// Cookie configuration
const SOLAR_DATA_COOKIE_NAME = 'solacheck_pvgis_data';
const COOKIE_MAX_AGE_DAYS = 1; // Data is valid for 1 day

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

/**
 * Serialize solar data to cookie-safe string
 */
function serializeSolarData(data: SolarData): string {
  return btoa(JSON.stringify(data));
}

/**
 * Deserialize solar data from cookie string
 */
function deserializeSolarData(cookieValue: string): SolarData | null {
  try {
    return JSON.parse(atob(cookieValue)) as SolarData;
  } catch {
    return null;
  }
}

/**
 * Get cookie value by name
 */
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

/**
 * Set cookie with value and expiration
 */
function setCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === 'undefined') return;
  
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${String(maxAgeSeconds)}; SameSite=Strict`;
}

/**
 * Delete cookie by name
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Check if coordinates match (within small tolerance for floating point)
 */
function coordinatesMatch(
  stored: { lat: number; lon: number },
  current: Coordinates
): boolean {
  const tolerance = 0.001; // ~100m tolerance
  return (
    Math.abs(stored.lat - current.lat) < tolerance &&
    Math.abs(stored.lon - current.lon) < tolerance
  );
}

export function useSolarData(): UseSolarDataReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);

  /**
   * Get solar data from cookie if available and coordinates match
   */
  const getSolarDataFromCookie = useCallback((): SolarData | null => {
    const cookieValue = getCookie(SOLAR_DATA_COOKIE_NAME);
    if (!cookieValue) return null;
    
    const data = deserializeSolarData(cookieValue);
    if (data) {
      setSolarData(data);
    }
    return data;
  }, []);

  /**
   * Check if we have valid cached data for the given coordinates
   */
  const getCachedDataForCoordinates = useCallback(
    (coordinates: Coordinates): SolarData | null => {
      const cookieValue = getCookie(SOLAR_DATA_COOKIE_NAME);
      if (!cookieValue) return null;
      
      const data = deserializeSolarData(cookieValue);
      if (!data) return null;
      
      // Check if cached data is for the same location
      if (coordinatesMatch(data.location, coordinates)) {
        return data;
      }
      
      return null;
    },
    []
  );

  /**
   * Fetch solar data from PVGIS API (via our proxy)
   */
  const fetchSolarData = useCallback(
    async (
      coordinates: Coordinates,
      orientation?: string,
      mounting?: string
    ): Promise<SolarData | null> => {
      // Check cookie first
      const cachedData = getCachedDataForCoordinates(coordinates);
      if (cachedData) {
        console.log('[useSolarData] Using cached PVGIS data from cookie');
        setSolarData(cachedData);
        return cachedData;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build query params
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
          // Log error for dev purposes but don't fail
          console.error('[useSolarData] PVGIS API failed:', result.error);
          setError(result.error ?? 'Failed to fetch solar data');
          setIsLoading(false);
          return null;
        }

        // Store in cookie for future use
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

  /**
   * Clear stored solar data (cookie and state)
   */
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
