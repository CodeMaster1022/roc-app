import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Loader2, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  onLocationChange: (address: string, lat: number, lng: number) => void;
  onConfirm?: () => void;
  className?: string;
}

interface AutocompleteSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  address,
  coordinates,
  onLocationChange,
  onConfirm,
  className = ""
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const abortController = useRef<AbortController | null>(null);
  
  const [currentAddress, setCurrentAddress] = useState(address);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(
    coordinates ? [coordinates.lng, coordinates.lat] : [-99.1332, 19.4326]
  );
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);

  // Debounced autocomplete search
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update map center when coordinates prop changes
  useEffect(() => {
    if (coordinates && map.current && marker.current) {
      const newCoords: [number, number] = [coordinates.lng, coordinates.lat];
      map.current.flyTo({ center: newCoords, zoom: 15 });
      marker.current.setLngLat(newCoords);
      setCurrentCoords(newCoords);
      reverseGeocode(newCoords[0], newCoords[1]);
    }
  }, [coordinates]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is available
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('demo-token')) {
      console.warn('Mapbox token not configured. Using fallback mock map.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: currentCoords,
        zoom: 15,
        language: 'es'
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#ef4444'
      })
        .setLngLat(currentCoords)
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          setCurrentCoords([lngLat.lng, lngLat.lat]);
          onLocationChange(currentAddress, lngLat.lat, lngLat.lng);
          reverseGeocode(lngLat.lng, lngLat.lat);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setCurrentCoords([lng, lat]);
        
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        
        onLocationChange(currentAddress, lat, lng);
        reverseGeocode(lng, lat);
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Geocode initial address if provided
      if (address) {
        geocodeAddress(address);
      }

    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      toast({
        title: "Error de Mapa",
        description: "No se pudo cargar el mapa. Verifica la configuración de Mapbox.",
        variant: "destructive"
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('demo-token')) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setIsLoadingAutocomplete(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&country=mx&language=es&limit=5&types=address,poi,place&autocomplete=true`,
        { signal: abortController.current.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      if (data.features) {
        const formattedSuggestions: AutocompleteSuggestion[] = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
          place_type: feature.place_type,
          context: feature.context
        }));
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Autocomplete error:', error);
      }
    } finally {
      setIsLoadingAutocomplete(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);

  // Geocoding function
  const geocodeAddress = async (searchAddress: string) => {
    if (!searchAddress.trim() || !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('demo-token')) return;

    setIsGeocoding(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${MAPBOX_TOKEN}&country=mx&language=es&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const placeName = feature.place_name;
        
        setCurrentCoords([lng, lat]);
        setCurrentAddress(placeName);
        onLocationChange(placeName, lat, lng);
        
        // Update map and marker
        if (map.current && marker.current) {
          map.current.flyTo({ center: [lng, lat], zoom: 16 });
          marker.current.setLngLat([lng, lat]);
        }

        toast({
          title: "Ubicación encontrada",
          description: "La dirección se ha localizado correctamente en el mapa.",
        });
      } else {
        toast({
          title: "Dirección no encontrada",
          description: "No se pudo encontrar la dirección especificada. Intenta con una dirección más específica.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo buscar la dirección. Verifica tu conexión a internet.",
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Reverse geocoding function
  const reverseGeocode = async (lng: number, lat: number) => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('demo-token')) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=mx&language=es&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        setCurrentAddress(placeName);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setCurrentAddress(newAddress);
    debouncedSearch(newAddress);
  };

  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    const [lng, lat] = suggestion.center;
    
    setCurrentAddress(suggestion.place_name);
    setCurrentCoords([lng, lat]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    onLocationChange(suggestion.place_name, lat, lng);
    
    // Update map and marker
    if (map.current && marker.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 16 });
      marker.current.setLngLat([lng, lat]);
    }

    toast({
      title: "Ubicación seleccionada",
      description: "La dirección se ha establecido correctamente.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else if (currentAddress.trim()) {
          geocodeAddress(currentAddress);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setCurrentAddress('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleDemoLocationConfirm = () => {
    // In demo mode, confirm the location with current address and coordinates
    console.log('Demo location confirm:', { currentAddress, currentCoords });
    if (currentAddress.trim()) {
      onLocationChange(currentAddress, currentCoords[1], currentCoords[0]);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAddress.trim()) {
      geocodeAddress(currentAddress);
      setShowSuggestions(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no disponible",
        description: "Tu navegador no soporta geolocalización.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords([longitude, latitude]);
        onLocationChange(currentAddress, latitude, longitude);
        
        if (map.current && marker.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
          marker.current.setLngLat([longitude, latitude]);
        }
        
        reverseGeocode(longitude, latitude);
        toast({
          title: "Ubicación obtenida",
          description: "Se ha obtenido tu ubicación actual correctamente.",
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "No se pudo obtener tu ubicación actual.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Acceso a la ubicación denegado. Permite el acceso a la ubicación en tu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado al obtener la ubicación.";
            break;
        }
        
        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive"
        });
      }
    );
  };

  // Fallback mock map if Mapbox is not configured
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('demo-token')) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <Label htmlFor="address-input">{t('propertyFlow.address') || 'Dirección'}</Label>
          <div className="flex gap-2">
            <Input
              id="address-input"
              value={currentAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder={t('propertyFlow.address_placeholder') || 'Escribe la dirección...'}
            />
            <Button 
              type="button"
              variant="outline"
              onClick={handleDemoLocationConfirm}
              disabled={!currentAddress.trim()}
              className="shrink-0"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ {t('map.demo_mode') || 'Modo demo - Configura VITE_MAPBOX_ACCESS_TOKEN para usar el mapa real'}
          </p>
        </div>
        
        {/* Mock Map Fallback */}
        <div 
          className="relative w-full h-80 rounded-lg border bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-colors"
          onClick={handleDemoLocationConfirm}
        >
          <div className="text-center space-y-2">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto" />
            <p className="text-sm font-medium text-blue-800">
              {t('map.configure_mapbox') || 'Configura Mapbox para ver el mapa interactivo'}
            </p>
            <p className="text-xs text-blue-600">
              {currentAddress || t('map.no_address') || 'Sin dirección especificada'}
            </p>
            {currentAddress && (
              <p className="text-xs text-blue-500 mt-2">
                💡 {t('map.click_to_confirm') || 'Haz clic aquí para confirmar la ubicación'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address-input">{t('propertyFlow.address') || 'Dirección'}</Label>
        <div className="relative">
          <form onSubmit={handleAddressSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="address-input"
                value={currentAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={t('propertyFlow.address_placeholder') || 'Escribe la dirección...'}
                disabled={isGeocoding}
                className="pr-8"
              />
              {currentAddress && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              {isLoadingAutocomplete && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              variant="outline" 
              disabled={isGeocoding || !currentAddress.trim()}
              className="shrink-0"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetCurrentLocation}
              className="shrink-0"
              title={t('map.get_current_location') || 'Obtener ubicación actual'}
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </form>

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                      index === selectedSuggestionIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.place_name.split(',')[0]}
                        </div>
                        {suggestion.place_name.includes(',') && (
                          <div className="text-gray-500 text-xs truncate">
                            {suggestion.place_name.split(',').slice(1).join(',').trim()}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          {t('map.click_drag_instructions') || 'Haz clic en el mapa o arrastra el marcador para ajustar la ubicación'}
        </p>
      </div>
      
      {/* Real Mapbox Map */}
      <div className="relative">
        <div 
          ref={mapContainer}
          className="relative w-full h-80 rounded-lg border overflow-hidden"
          style={{ minHeight: '320px' }}
        />
        
        {/* Loading indicator */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('map.loading') || 'Cargando mapa...'}
            </div>
          </div>
        )}
      </div>
      
      {/* Coordinates display */}
      <div className="text-xs text-muted-foreground">
        <span className="font-mono">
          {t('map.coordinates') || 'Coordenadas'}: {currentCoords[1].toFixed(6)}, {currentCoords[0].toFixed(6)}
        </span>
      </div>
    </div>
  );
};