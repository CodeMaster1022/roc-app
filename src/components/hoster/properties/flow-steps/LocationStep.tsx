import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapboxMap } from "@/components/hoster/ui/mapbox-map";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

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
  }, [property.location]);

  const handleLocationChange = (newAddress: string, lat: number, lng: number) => {
    console.log('Location changed:', { newAddress, lat, lng }); // Debug log
    setAddress(newAddress);
    setCoordinates({ lat, lng });
    updateProperty({
      location: {
        address: newAddress,
        lat,
        lng
      }
    });
  };

  const handleConfirmLocation = () => {
    // If we have coordinates but no address, allow proceeding with coordinates
    const hasValidLocation = address.trim() || (coordinates.lat !== 19.4326 || coordinates.lng !== -99.1332);
    
    console.log('Confirm location:', { address, coordinates, hasValidLocation }); // Debug log
    
    if (hasValidLocation) {
      // Ensure we have at least some location data
      if (!address.trim() && coordinates) {
        const fallbackAddress = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
        updateProperty({
          location: {
            address: fallbackAddress,
            lat: coordinates.lat,
            lng: coordinates.lng
          }
        });
      }
      onNext();
    }
  };

  // Check if we have a valid location (either address or non-default coordinates)
  const hasValidLocation = address.trim() || 
    (coordinates.lat !== 19.4326 || coordinates.lng !== -99.1332);

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
          onLocationChange={handleLocationChange}
          onConfirm={handleConfirmLocation}
          className="animate-fade-in"
        />
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