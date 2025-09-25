import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapboxMap } from "@/components/hoster/ui/mapbox-map";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { propertyService } from "@/services/propertyService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LocationStep = ({ property, updateProperty, onNext, onPrev }: LocationStepProps) => {
  const { t } = useLanguage();
  const [address, setAddress] = useState(property.location?.address || '');
  const [coordinates, setCoordinates] = useState({
    lat: property.location?.lat || 19.4326,
    lng: property.location?.lng || -99.1332
  });
  const [selectedZone, setSelectedZone] = useState(property.location?.zone || '');
  const [zones] = useState(() => propertyService.getZones());

  // Update local state when property changes
  useEffect(() => {
    if (property.location?.address && property.location.address !== address) {
      setAddress(property.location.address);
    }
    if (property.location?.lat && property.location?.lng) {
      setCoordinates({
        lat: property.location.lat,
        lng: property.location.lng
      });
    }
    if (property.location?.zone && property.location.zone !== selectedZone) {
      setSelectedZone(property.location.zone);
    }
  }, [property.location]);

  const handleLocationChange = (newAddress: string, lat: number, lng: number) => {
    console.log('Location changed:', { newAddress, lat, lng }); // Debug log
    setAddress(newAddress);
    setCoordinates({ lat, lng });
    
    // Find the closest zone based on coordinates
    const closestZone = findClosestZone(lat, lng);
    if (closestZone) {
      setSelectedZone(closestZone.id);
    }

    updateProperty({
      location: {
        address: newAddress,
        lat,
        lng,
        zone: closestZone?.id || selectedZone
      }
    });
  };

  const findClosestZone = (lat: number, lng: number) => {
    let closestZone = null;
    let minDistance = Infinity;

    zones.forEach(zone => {
      const distance = calculateDistance(
        lat,
        lng,
        zone.coordinates.lat,
        zone.coordinates.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    });

    return closestZone;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId);
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setCoordinates(zone.coordinates);
      updateProperty({
        location: {
          ...property.location,
          zone: zoneId,
          lat: zone.coordinates.lat,
          lng: zone.coordinates.lng
        }
      });
    }
  };

  const handleConfirmLocation = () => {
    // If we have coordinates but no address, allow proceeding with coordinates
    const hasValidLocation = (address.trim() || (coordinates.lat !== 19.4326 || coordinates.lng !== -99.1332)) && selectedZone;
    
    console.log('Confirm location:', { address, coordinates, hasValidLocation, selectedZone }); // Debug log
    
    if (hasValidLocation) {
      // Ensure we have at least some location data
      if (!address.trim() && coordinates) {
        const fallbackAddress = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
        updateProperty({
          location: {
            address: fallbackAddress,
            lat: coordinates.lat,
            lng: coordinates.lng,
            zone: selectedZone
          }
        });
      }
      onNext();
    }
  };

  // Check if we have a valid location (either address or non-default coordinates) and a selected zone
  const hasValidLocation = (address.trim() || 
    (coordinates.lat !== 19.4326 || coordinates.lng !== -99.1332)) && selectedZone;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.location') || 'Ubicación'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('propertyFlow.location_description') || '¿Dónde se encuentra tu propiedad?'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <MapboxMap
          address={address}
          coordinates={coordinates}
          onLocationChange={handleLocationChange}
          onConfirm={handleConfirmLocation}
          className="animate-fade-in"
        />
        
        <div className="w-full">
          <Select value={selectedZone} onValueChange={handleZoneChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('propertyFlow.select_zone') || 'Selecciona una zona'} />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
            {t('propertyFlow.previous') || 'Anterior'}
          </Button>
          <Button 
            variant="default" 
            onClick={handleConfirmLocation}
            disabled={!hasValidLocation}
            className="order-1 sm:order-2"
          >
            {t('propertyFlow.confirm_location') || 'Confirmar ubicación'}
          </Button>
        </div>
      </div>
    </div>
  );
};