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

  // When coordinates are received, do reverse geocoding
  useEffect(() => {
    if (coordinates && !hasProcessedCoords.current) {
      hasProcessedCoords.current = true;
      void getAddressFromCoordinates(coordinates.lat, coordinates.lon).then((address) => {
        if (address) {
          setAddressData(address);
          setShowManualForm(true);
          onChange(JSON.stringify(address));
        }
      });
    }
  }, [coordinates, getAddressFromCoordinates, onChange]);

  const handleFieldChange = useCallback((field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...addressData, [field]: fieldValue };
    setAddressData(newAddress);
    onChange(JSON.stringify(newAddress));
  }, [addressData, onChange]);

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
              <input
                id="address-city"
                type="text"
                value={addressData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="Berlin"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {hasAddress && (
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
