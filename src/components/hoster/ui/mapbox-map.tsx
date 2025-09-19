import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  address: string;
  onLocationChange: (address: string, lat: number, lng: number) => void;
  onConfirm?: () => void;
  className?: string;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  address,
  onLocationChange,
  onConfirm,
  className = ""
}) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [currentAddress, setCurrentAddress] = useState(address);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([-99.1332, 19.4326]); // Default to Mexico City

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
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
      }
    } catch (error) {
      console.error('Geocoding error:', error);
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
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible en este navegador');
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
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('No se pudo obtener tu ubicación actual');
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
        
        {/* {onConfirm && (
          <Button onClick={onConfirm} className="w-full" variant="default">
            {t('propertyFlow.confirm_location') || 'Confirmar ubicación'}
          </Button>
        )} */}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address-input">{t('propertyFlow.address') || 'Dirección'}</Label>
        <form onSubmit={handleAddressSubmit} className="flex gap-2">
          <Input
            id="address-input"
            value={currentAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={t('propertyFlow.address_placeholder') || 'Escribe la dirección...'}
            disabled={isGeocoding}
          />
          <Button 
            type="submit" 
            variant="outline" 
            disabled={isGeocoding || !currentAddress.trim()}
            className="shrink-0"
          >
            {isGeocoding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
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
        <p className="text-xs text-muted-foreground">
          {t('map.click_drag_instructions') || 'Haz clic en el mapa o arrastra el marcador para ajustar la ubicación'}
        </p>
      </div>
      
      {/* Real Mapbox Map */}
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
      
      {/* Coordinates display */}
      <div className="text-xs text-muted-foreground">
        <span className="font-mono">
          {t('map.coordinates') || 'Coordenadas'}: {currentCoords[1].toFixed(6)}, {currentCoords[0].toFixed(6)}
        </span>
      </div>
      
      {/* {onConfirm && (
        <Button onClick={onConfirm} className="w-full" variant="default">
          {t('propertyFlow.confirm_location') || 'Confirmar ubicación'}
        </Button>
      )} */}
    </div>
  );
};