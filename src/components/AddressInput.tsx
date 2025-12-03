"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding, AddressData } from '@/hooks/useReverseGeocoding';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EMPTY_ADDRESS: AddressData = {
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
};

// Function to lookup city by German postal code using the OpenPLZ API
async function lookupCityByPostalCode(postalCode: string): Promise<string | null> {
  if (postalCode.length !== 5) {
    return null;
  }
  
  try {
    // Use OpenPLZ API for German postal codes
    const response = await fetch(`https://openplzapi.org/de/Localities?postalCode=${postalCode}`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data?.[0]?.name) {
      return data[0].name;
    }
    return null;
  } catch {
    return null;
  }
}

// Validation result type
interface ValidationResult {
  isValid: boolean;
  postalCodeValid: boolean;
  cityMatchesPLZ: boolean | null; // null = not checked
  streetValid: boolean | null; // null = not checked yet
  plzMatchesAddress: boolean | null; // null = not checked
  message?: string;
  suggestedCity?: string; // City that belongs to the PLZ
  suggestedPLZ?: string; // Correct PLZ for the address
}

// Function to validate the full address using Nominatim
async function validateAddress(address: AddressData): Promise<ValidationResult> {
  const { street, houseNumber, postalCode, city } = address;
  
  // First check if postal code is valid (5 digits)
  if (postalCode.length === 5 && /^\d{5}$/.test(postalCode)) {
    // Check if postal code exists and get the city it belongs to
    const cityFromPLZ = await lookupCityByPostalCode(postalCode);
    if (!cityFromPLZ) {
      return {
        isValid: false,
        postalCodeValid: false,
        cityMatchesPLZ: null,
        streetValid: null,
        plzMatchesAddress: null,
        message: 'Die eingegebene PLZ existiert nicht.',
      };
    }
    
    // Check if the entered city matches the PLZ
    if (city) {
      const cityLower = city.toLowerCase().trim();
      const plzCityLower = cityFromPLZ.toLowerCase().trim();
      
      // Check if cities match (allow partial match for compound city names)
      const citiesMatch = cityLower === plzCityLower || 
                          cityLower.includes(plzCityLower) || 
                          plzCityLower.includes(cityLower);
      
      if (!citiesMatch) {
        return {
          isValid: false,
          postalCodeValid: true,
          cityMatchesPLZ: false,
          streetValid: null,
          plzMatchesAddress: null,
          message: `Die PLZ ${postalCode} gehört zu ${cityFromPLZ}, nicht zu ${city}.`,
          suggestedCity: cityFromPLZ,
        };
      }
    }
    
    // If street and house number are provided, validate the full address
    if (street && houseNumber && city) {
      try {
        // First, search for the address WITHOUT postal code to find the correct PLZ
        const addressSearchResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?` + 
          `street=${encodeURIComponent(`${houseNumber} ${street}`)}&` +
          `city=${encodeURIComponent(city)}&` +
          `country=Germany&` +
          `format=json&addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'SolaCheck/1.0',
            },
          }
        );
        
        if (!addressSearchResponse.ok) {
          // On API error, don't block the user - assume valid
          return { isValid: true, postalCodeValid: true, cityMatchesPLZ: true, streetValid: null, plzMatchesAddress: null };
        }
        
        const addressData = await addressSearchResponse.json();
        
        if (addressData && addressData.length > 0) {
          // Address found - check if the postal code matches
          const foundResult = addressData.find((result: { address?: { road?: string; postcode?: string } }) => {
            return result.address?.road !== undefined;
          }) as { address?: { road?: string; postcode?: string } } | undefined;
          
          if (foundResult?.address) {
            const actualPLZ = foundResult.address.postcode;
            
            // Check if the entered PLZ matches the actual PLZ for this address
            if (actualPLZ && actualPLZ !== postalCode) {
              return {
                isValid: false,
                postalCodeValid: true,
                cityMatchesPLZ: true,
                streetValid: true,
                plzMatchesAddress: false,
                message: `Die Adresse "${street} ${houseNumber}" in ${city} hat die PLZ ${actualPLZ}, nicht ${postalCode}.`,
                suggestedPLZ: actualPLZ,
              };
            }
            
            // Everything matches!
            return { isValid: true, postalCodeValid: true, cityMatchesPLZ: true, streetValid: true, plzMatchesAddress: true };
          }
        }
        
        // No results with house number - try without house number
        const streetSearchResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?` + 
          `street=${encodeURIComponent(street)}&` +
          `city=${encodeURIComponent(city)}&` +
          `country=Germany&` +
          `format=json&addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'SolaCheck/1.0',
            },
          }
        );
        
        if (streetSearchResponse.ok) {
          const streetData = await streetSearchResponse.json();
          if (streetData && streetData.length > 0) {
            // Street found - check postal codes
            const streetResult = streetData.find((result: { address?: { road?: string; postcode?: string } }) => {
              return result.address?.road !== undefined;
            }) as { address?: { road?: string; postcode?: string } } | undefined;
            
            if (streetResult?.address) {
              const actualPLZ = streetResult.address.postcode;
              
              // Check if the entered PLZ is in the same area
              if (actualPLZ && actualPLZ !== postalCode) {
                // Street exists but with different PLZ - warn but it could be a long street
                return {
                  isValid: false,
                  postalCodeValid: true,
                  cityMatchesPLZ: true,
                  streetValid: true,
                  plzMatchesAddress: false,
                  message: `Die Straße "${street}" in ${city} hat üblicherweise die PLZ ${actualPLZ}. Bitte überprüfen Sie Ihre Eingabe.`,
                  suggestedPLZ: actualPLZ,
                };
              }
              
              // Street found and PLZ matches (or no PLZ returned)
              return { isValid: true, postalCodeValid: true, cityMatchesPLZ: true, streetValid: true, plzMatchesAddress: true };
            }
          }
        }
        
        // Street really not found in this city
        return {
          isValid: false,
          postalCodeValid: true,
          cityMatchesPLZ: true,
          streetValid: false,
          plzMatchesAddress: null,
          message: 'Die Straße wurde in dieser Stadt nicht gefunden.',
        };
      } catch {
        // On error, don't block the user
        return { isValid: true, postalCodeValid: true, cityMatchesPLZ: true, streetValid: null, plzMatchesAddress: null };
      }
    }
    
    // PLZ is valid, city matches, but street not yet entered
    return { isValid: true, postalCodeValid: true, cityMatchesPLZ: true, streetValid: null, plzMatchesAddress: null };
  }
  
  // Not enough data to validate
  return { isValid: true, postalCodeValid: true, cityMatchesPLZ: null, streetValid: null, plzMatchesAddress: null };
}

function parseInitialValue(value: string): AddressData {
  if (value) {
    try {
      const parsed = JSON.parse(value) as AddressData;
      if (parsed.city || parsed.postalCode) {
        return parsed;
      }
    } catch {
      // Not JSON, might be old format - ignore
    }
  }
  return EMPTY_ADDRESS;
}

export function AddressInput({ value, onChange }: AddressInputProps) {
  const { isLoading: isLoadingGeo, error: geoError, coordinates, getCurrentLocation } = useGeolocation();
  const { isLoading: isLoadingAddress, error: addressError, getAddressFromCoordinates } = useReverseGeocoding();
  
  const [addressData, setAddressData] = useState<AddressData>(() => parseInitialValue(value));
  const [showManualForm, setShowManualForm] = useState(() => parseInitialValue(value) !== EMPTY_ADDRESS);
  const hasProcessedCoords = useRef(false);
  const lastLookedUpPostalCode = useRef<string>('');
  const isLookingUpCityRef = useRef(false);
  const [isLookingUpCity, setIsLookingUpCity] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidatedAddress = useRef<string>('');

  // When coordinates are received, do reverse geocoding
  useEffect(() => {
    if (coordinates && !hasProcessedCoords.current) {
      hasProcessedCoords.current = true;
      void getAddressFromCoordinates(coordinates.lat, coordinates.lon).then((address) => {
        if (address) {
          setAddressData(address);
          setShowManualForm(true);
          // Update the last looked up postal code to prevent re-lookup
          lastLookedUpPostalCode.current = address.postalCode;
        }
      });
    }
  }, [coordinates, getAddressFromCoordinates]);

  // Auto-lookup city when postal code is complete (5 digits for Germany)
  // Also clear city when PLZ is removed/changed if it was auto-filled
  useEffect(() => {
    const postalCode = addressData.postalCode;
    
    // If PLZ is incomplete or empty, clear the auto-filled city
    if (postalCode.length < 5 && lastLookedUpPostalCode.current !== '') {
      // PLZ was cleared or is being changed
      lastLookedUpPostalCode.current = '';
      // Clear the city if it was auto-filled - use queueMicrotask to avoid sync setState
      queueMicrotask(() => {
        setAddressData((prev) => {
          if (prev.city) {
            return { ...prev, city: '' };
          }
          return prev;
        });
      });
      return;
    }
    
    // Only lookup if:
    // - Postal code is exactly 5 digits
    // - We haven't already looked up this postal code
    // - Not already looking up
    if (
      postalCode.length === 5 &&
      /^\d{5}$/.test(postalCode) &&
      postalCode !== lastLookedUpPostalCode.current &&
      !isLookingUpCityRef.current
    ) {
      lastLookedUpPostalCode.current = postalCode;
      isLookingUpCityRef.current = true;
      
      // Use a microtask to avoid synchronous setState in effect
      queueMicrotask(() => setIsLookingUpCity(true));
      
      void lookupCityByPostalCode(postalCode).then((city) => {
        isLookingUpCityRef.current = false;
        setIsLookingUpCity(false);
        if (city) {
          setAddressData((prev) => {
            // Update the city (replace any previous auto-filled value)
            return { ...prev, city };
          });
        }
      });
    }
  }, [addressData.postalCode]);

  // Sync addressData changes to parent - this is the only place we call onChange
  const addressDataJson = JSON.stringify(addressData);
  const prevAddressDataJson = useRef(addressDataJson);
  
  useEffect(() => {
    if (prevAddressDataJson.current !== addressDataJson) {
      prevAddressDataJson.current = addressDataJson;
      onChange(addressDataJson);
    }
  }, [addressDataJson, onChange]);

  // Validate address with debounce
  useEffect(() => {
    // Clear any pending validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    const { postalCode, street, houseNumber, city } = addressData;
    
    // Create a key for the current address state
    const addressKey = `${postalCode}-${street}-${houseNumber}-${city}`;
    
    // Don't validate if nothing meaningful has changed
    if (addressKey === lastValidatedAddress.current) {
      return;
    }

    // Check what data we have
    const hasFullPLZ = postalCode.length === 5 && /^\d{5}$/.test(postalCode);
    
    // Need at least a full PLZ to validate
    if (!hasFullPLZ) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setValidationResult(null));
      return;
    }

    // Debounce the validation to avoid too many API calls
    validationTimeoutRef.current = setTimeout(() => {
      lastValidatedAddress.current = addressKey;
      setIsValidating(true);
      
      void validateAddress(addressData).then((result) => {
        setIsValidating(false);
        setValidationResult(result);
      });
    }, 800); // Wait 800ms after user stops typing

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [addressData]);

  const handleFieldChange = useCallback((field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...addressData, [field]: fieldValue };
    setAddressData(newAddress);
  }, [addressData]);

  const handleGetLocation = () => {
    hasProcessedCoords.current = false;
    getCurrentLocation();
  };

  const isLoading = isLoadingGeo || isLoadingAddress;
  const error = geoError ?? addressError;
  const hasAddress = addressData.city || addressData.postalCode;

  return (
    <div className="max-w-lg w-full mx-auto">
      {/* GPS Standort Button */}
      <div className="mb-4 flex flex-col items-center">
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLoadingGeo ? 'Standort wird ermittelt...' : 'Adresse wird geladen...'}
            </>
          ) : (
            <>Aktuellen Standort nutzen</>
          )}
        </button>

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 w-full">
            {error}
          </div>
        )}

        <div className="my-4 flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">oder</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>

      {/* Manual Toggle Button */}
      {!showManualForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowManualForm(true)}
            className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors font-medium"
          >
            Adresse manuell eingeben
          </button>
        </div>
      )}

      {/* Manual Address Form */}
      {showManualForm && (
        <div className="space-y-4">
          {/* Street + House Number Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="address-street" className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
              <input
                id="address-street"
                type="text"
                value={addressData.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
                placeholder="Musterstraße"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
            <div className="w-24">
              <label htmlFor="address-housenumber" className="block text-sm font-medium text-gray-700 mb-1">Nr.</label>
              <input
                id="address-housenumber"
                type="text"
                value={addressData.houseNumber}
                onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
                placeholder="42"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* PLZ + City Row */}
          <div className="flex gap-3">
            <div className="w-28">
              <label htmlFor="address-postalcode" className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input
                id="address-postalcode"
                type="text"
                value={addressData.postalCode}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                placeholder="12345"
                maxLength={5}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
              <div className="relative">
                <input
                  id="address-city"
                  type="text"
                  value={addressData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="Berlin"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                />
                {isLookingUpCity && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {validationResult && !validationResult.isValid && validationResult.message && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Adresse prüfen</p>
              <p className="mt-0.5">{validationResult.message}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {validationResult.suggestedCity && (
                  <button
                    onClick={() => {
                      if (validationResult.suggestedCity) {
                        handleFieldChange('city', validationResult.suggestedCity);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-sm font-medium transition-colors"
                  >
                    Stadt zu &quot;{validationResult.suggestedCity}&quot; ändern
                  </button>
                )}
                {validationResult.suggestedPLZ && (
                  <button
                    onClick={() => {
                      if (validationResult.suggestedPLZ) {
                        handleFieldChange('postalCode', validationResult.suggestedPLZ);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-sm font-medium transition-colors"
                  >
                    PLZ zu &quot;{validationResult.suggestedPLZ}&quot; ändern
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validating Indicator */}
      {isValidating && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adresse wird überprüft...
        </div>
      )}

      {/* Success Message */}
      {hasAddress && (!validationResult || validationResult.isValid) && !isValidating && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
          Standort: {[addressData.street, addressData.houseNumber].filter(Boolean).join(' ')}{addressData.street ? ', ' : ''}{addressData.postalCode} {addressData.city}
          {addressData.coordinates && (
            <span className="block text-xs text-green-600 mt-1">
              Koordinaten: {addressData.coordinates.lat.toFixed(4)}, {addressData.coordinates.lon.toFixed(4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
