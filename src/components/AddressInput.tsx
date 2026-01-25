"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
}

const ALLOWED_COUNTRIES = ['DE', 'AT', 'CH'];

interface PhotonResponse {
  features: PhotonFeature[];
}

interface LocationSuggestion {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: 'city' | 'town' | 'village' | 'address' | 'street' | 'place';
  countryCode?: string;
}

function photonToSuggestion(feature: PhotonFeature): LocationSuggestion {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;
  
  const primaryName = props.name ?? props.city ?? props.town ?? props.village ?? props.municipality ?? '';
  
  const parts: string[] = [];
  
  if (props.street) {
    parts.push(props.housenumber ? `${props.street} ${props.housenumber}` : props.street);
  } else if (primaryName) {
    parts.push(primaryName);
  }
  
  const city = props.city ?? props.town ?? props.village ?? props.municipality;
  if (city && city !== primaryName) {
    parts.push(props.postcode ? `${props.postcode} ${city}` : city);
  } else if (props.postcode && city) {
    parts[0] = `${props.postcode} ${parts[0]}`;
  }
  
  if (props.state && parts.length < 2) {
    parts.push(props.state);
  }
  
  const displayName = parts.join(', ') || primaryName;
  
  let type: LocationSuggestion['type'] = 'place';
  
  if (props.type === 'street') {
    type = 'street';
  } else if (props.type === 'house' && props.housenumber) {
    type = 'address';
  } else if (props.type === 'city') {
    type = 'city';
  } else if (props.type === 'town') {
    type = 'town';
  } else if (props.type === 'village' || props.type === 'hamlet') {
    type = 'village';
  } else if (props.housenumber && props.street) {
    type = 'address';
  } else if (props.street) {
    type = 'street';
  } else if (props.city) {
    type = 'city';
  } else if (props.town) {
    type = 'town';
  } else if (props.village) {
    type = 'village';
  }
  
  return {
    id: `${props.osm_type ?? 'node'}-${String(props.osm_id ?? Math.random())}`,
    name: primaryName,
    displayName,
    lat,
    lon,
    type,
    countryCode: props.countrycode,
  };
}

function getSuggestionTypeLabel(type: LocationSuggestion['type']): string {
  const labels: Record<LocationSuggestion['type'], string> = {
    city: 'Stadt',
    town: 'Stadt',
    village: 'Ort',
    address: 'Adresse',
    street: 'Straße',
    place: 'Ort',
  };
  return labels[type];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AddressInput({ value, onChange, onValidationChange }: AddressInputProps) {
  const { isLoading: isLoadingGeo, error: geoError, coordinates, getCurrentLocation } = useGeolocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchAbortController = useRef<AbortController | null>(null);
  const hasProcessedCoords = useRef(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (value && !selectedLocation) {
      try {
        const parsed = JSON.parse(value) as { lat?: number; lon?: number };
        if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          setSelectedLocation({
            name: 'Gespeicherter Standort',
            lat: parsed.lat,
            lon: parsed.lon,
          });
        }
      } catch { /* */ }
    }
  }, [value, selectedLocation]);

  useEffect(() => {
    if (coordinates && !hasProcessedCoords.current) {
      hasProcessedCoords.current = true;
      
      console.log('[SolaCheck] GPS coordinates received:', { lat: coordinates.lat, lon: coordinates.lon });
      
      void (async () => {
        try {
          const response = await fetch(
            `https://photon.komoot.io/reverse?lat=${String(coordinates.lat)}&lon=${String(coordinates.lon)}`,
            {
              headers: {
                'Accept-Language': 'de',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json() as PhotonResponse;
            if (data.features.length > 0) {
              const suggestion = photonToSuggestion(data.features[0]);
              
              console.log('[SolaCheck] GPS location resolved:', { name: suggestion.displayName, lat: coordinates.lat, lon: coordinates.lon });
              
              setSelectedLocation({
                name: suggestion.displayName,
                lat: coordinates.lat,
                lon: coordinates.lon,
              });
            } else {
              setSelectedLocation({
                name: `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
                lat: coordinates.lat,
                lon: coordinates.lon,
              });
            }
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            
            onChange(JSON.stringify({ lat: coordinates.lat, lon: coordinates.lon }));
            onValidationChange?.(true);
          }
        } catch {
          setSelectedLocation({
            name: `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
            lat: coordinates.lat,
            lon: coordinates.lon,
          });
          onChange(JSON.stringify({ lat: coordinates.lat, lon: coordinates.lon }));
          onValidationChange?.(true);
        }
      })();
    }
  }, [coordinates, onChange, onValidationChange]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    searchAbortController.current = new AbortController();

    const searchLocations = async () => {
      setIsSearching(true);
      
      try {
        const isPostalCode = /^\d{4,5}$/.test(debouncedQuery);
        let searchQuery = debouncedQuery;
        
        if (isPostalCode) {
          const digits = debouncedQuery.length;
          if (digits === 5) {
            searchQuery = `${debouncedQuery} Deutschland`;
          }
        }
        
        const response = await fetch(
          `https://photon.komoot.io/api/?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `lang=de&` +
          `limit=15&` +
          `bbox=5.8,45.8,17.2,55.1`,
          {
            signal: searchAbortController.current?.signal,
          }
        );

        if (response.ok) {
          const data = await response.json() as PhotonResponse;
          let suggestions = data.features
            .map(photonToSuggestion)
            .filter(s => !s.countryCode || ALLOWED_COUNTRIES.includes(s.countryCode))
            .filter((s, i, arr) => arr.findIndex(x => x.displayName === s.displayName) === i);
          
          if (isPostalCode && suggestions.length > 0) {
            const cityResults = suggestions.filter(s => 
              s.type === 'city' || s.type === 'town' || s.type === 'village'
            );
            
            if (cityResults.length > 0) {
              suggestions = cityResults;
            } else if (data.features.length > 0) {
              const firstResult = data.features[0];
              const cityName = firstResult.properties.city ?? 
                              firstResult.properties.town ?? 
                              firstResult.properties.village ?? 
                              firstResult.properties.municipality;
              
              if (cityName) {
                const [lon, lat] = firstResult.geometry.coordinates;
                const postcode = firstResult.properties.postcode ?? debouncedQuery;
                suggestions = [{
                  id: `postcode-${postcode}`,
                  name: cityName,
                  displayName: `${postcode} ${cityName}`,
                  lat,
                  lon,
                  type: 'city' as const,
                  countryCode: firstResult.properties.countrycode,
                }];
              }
            }
          }
          
          suggestions = suggestions.slice(0, 5);
          
          setSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Search error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    };

    void searchLocations();

    return () => {
      searchAbortController.current?.abort();
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    const { lat, lon, displayName } = suggestion;
    
    console.log('[SolaCheck] Location selected:', { name: displayName, lat, lon });
    
    setSelectedLocation({ name: displayName, lat, lon });
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    onChange(JSON.stringify({ lat, lon }));
    onValidationChange?.(true);
  }, [onChange, onValidationChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSuggestions([]);
    onChange('');
    onValidationChange?.(false);
    inputRef.current?.focus();
  };

  const handleGetLocation = () => {
    hasProcessedCoords.current = false;
    getCurrentLocation();
  };

  return (
    <div className="max-w-lg w-full mx-auto">
      {/* GPS Location Button */}
      <div className="mb-4">
        <button
          onClick={handleGetLocation}
          disabled={isLoadingGeo}
          className="w-full px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {isLoadingGeo ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Standort wird ermittelt...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Aktuellen Standort nutzen
            </>
          )}
        </button>

        {geoError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {geoError}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">oder</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Search Input */}
      {!selectedLocation ? (
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Stadt, Adresse oder PLZ eingeben..."
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors text-lg"
              autoComplete="off"
            />
            
            {/* Search/Loading Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-[100] w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-yellow-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">
                      {suggestion.displayName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getSuggestionTypeLabel(suggestion.type)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSuggestions && debouncedQuery.length >= 2 && !isSearching && suggestions.length === 0 && (
            <div className="absolute z-[100] w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
              Keine Ergebnisse gefunden
            </div>
          )}

          {/* Helper text */}
          <p className="mt-2 text-sm text-gray-500 text-center">
            Für mehr Privatsphäre kannst du auch nur deine Stadt eingeben
          </p>
        </div>
      ) : (
        /* Selected Location Display */
        <div className="relative">
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-green-900 font-medium">Standort ausgewählt</p>
                <p className="text-green-800 mt-0.5 wrap-break-word">{selectedLocation.name}</p>
              </div>
              <button
                onClick={handleClear}
                className="shrink-0 p-1 hover:bg-green-100 rounded-full transition-colors"
                title="Standort ändern"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
