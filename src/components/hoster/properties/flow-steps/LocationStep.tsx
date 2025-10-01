import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapboxMap } from "@/components/hoster/ui/mapbox-map";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
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

type LocationPhase = 'zone' | 'address' | 'map';

export const LocationStep = ({ property, updateProperty, onNext, onPrev }: LocationStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<LocationPhase>('zone');
  const [address, setAddress] = useState(property.location?.address || '');
  const [coordinates, setCoordinates] = useState({
    lat: property.location?.lat || 19.4326,
    lng: property.location?.lng || -99.1332
  });
  const [selectedZone, setSelectedZone] = useState(property.location?.zone || '');
  const [zones] = useState(() => propertyService.getZones());
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // Mock address autocomplete - in real implementation, use Google Places API or similar
  const handleAddressChange = async (value: string) => {
    setAddress(value);
    
    if (value.length > 2) {
      // Mock suggestions - replace with real API call
      const mockSuggestions = [
        `${value} 123, Colonia Centro, Ciudad de México`,
        `${value} 456, Colonia Roma Norte, Ciudad de México`,
        `${value} 789, Colonia Condesa, Ciudad de México`,
      ];
      setAddressSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setShowSuggestions(false);
    
    // Mock geocoding - replace with real API call
    const mockCoords = {
      lat: 19.4326 + (Math.random() - 0.5) * 0.1,
      lng: -99.1332 + (Math.random() - 0.5) * 0.1
    };
    setCoordinates(mockCoords);
  };

  const handleLocationChange = (newAddress: string, lat: number, lng: number) => {
    console.log('Location changed:', { newAddress, lat, lng });
    setAddress(newAddress);
    setCoordinates({ lat, lng });
    
    // Find the closest zone based on coordinates
    const closestZone = findClosestZone(lat, lng);
    if (closestZone && !selectedZone) {
      setSelectedZone(closestZone.id);
    }
  };

  const findClosestZone = (lat: number, lng: number) => {
    // Mock implementation - replace with real zone detection
    return zones[0];
  };

  const handleZoneNext = () => {
    if (selectedZone) {
      setCurrentPhase('address');
    } else {
      toast({
        title: "Zona requerida",
        description: "Por favor selecciona una zona para continuar",
        variant: "destructive",
      });
    }
  };

  const handleAddressNext = () => {
    if (address.trim()) {
      setCurrentPhase('map');
    } else {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingresa una dirección válida",
        variant: "destructive",
      });
    }
  };

  const handleMapConfirm = () => {
    updateProperty({
      location: {
        address: address.trim(),
        lat: coordinates.lat,
        lng: coordinates.lng,
        zone: selectedZone
      }
    });
    onNext();
  };

  const handlePhaseBack = () => {
    switch (currentPhase) {
      case 'address':
        setCurrentPhase('zone');
        break;
      case 'map':
        setCurrentPhase('address');
        break;
      default:
        onPrev();
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 'zone':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-highlight">Paso 1: Selecciona la zona</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                ¿En qué zona se encuentra tu propiedad?
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Label htmlFor="zone">Zona</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una zona" />
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={onPrev}>
                Anterior
              </Button>
              <Button onClick={handleZoneNext} disabled={!selectedZone}>
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-highlight">Paso 2: Ingresa la dirección</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Escribe la dirección completa de tu propiedad
              </p>
            </div>

            <div className="max-w-md mx-auto relative">
              <Label htmlFor="address">Dirección completa</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Ej: Av. Insurgentes Sur 123, Colonia Roma Norte"
                className="w-full"
              />
              
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleAddressSelect(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePhaseBack}>
                Anterior
              </Button>
              <Button onClick={handleAddressNext} disabled={!address.trim()}>
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-highlight">Paso 3: Confirma en el mapa</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Arrastra el pin para ajustar la ubicación exacta
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <MapboxMap
                address={address}
                coordinates={coordinates}
                onLocationChange={handleLocationChange}
                onConfirm={handleMapConfirm}
                className="animate-fade-in h-96"
              />
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Zona:</strong> {zones.find(z => z.id === selectedZone)?.name}
                </p>
                <p className="text-sm">
                  <strong>Dirección:</strong> {address}
                </p>
                <p className="text-sm">
                  <strong>Coordenadas:</strong> {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePhaseBack}>
                Anterior
              </Button>
              <Button onClick={handleMapConfirm}>
                Confirmar ubicación
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {renderPhase()}
    </div>
  );
};