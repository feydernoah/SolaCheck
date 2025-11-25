import { useState, useCallback } from 'react';

export interface AddressData {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  coordinates?: { lat: number; lon: number };
}

interface UseReverseGeocodingReturn {
  isLoading: boolean;
  error: string | null;
  address: AddressData | null;
  getAddressFromCoordinates: (lat: number, lon: number) => Promise<AddressData | null>;
  clearError: () => void;
}

export function useReverseGeocoding(): UseReverseGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);

  const getAddressFromCoordinates = useCallback(async (lat: number, lon: number): Promise<AddressData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${String(lat)}&lon=${String(lon)}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'de',
            'User-Agent': 'SolaCheck/1.0 (Balkonkraftwerk Quiz)',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding-Anfrage fehlgeschlagen');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error('Adresse konnte nicht ermittelt werden');
      }

      const addressData: AddressData = {
        street: data.address?.road ?? data.address?.pedestrian ?? data.address?.footway ?? '',
        houseNumber: data.address?.house_number ?? '',
        postalCode: data.address?.postcode ?? '',
        city: data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.municipality ?? '',
        coordinates: { lat, lon },
      };

      setAddress(addressData);
      setIsLoading(false);
      return addressData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Adresse konnte nicht ermittelt werden';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    address,
    getAddressFromCoordinates,
    clearError,
  };
}
