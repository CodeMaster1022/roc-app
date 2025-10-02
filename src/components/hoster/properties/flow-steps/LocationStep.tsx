import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapboxMap } from "@/components/hoster/ui/mapbox-map";
import { Property } from "@/types/property";
import { useToast } from "@/hooks/use-toast";

interface LocationStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ZONES = [
  { value: "auto", label: "Auto (Detect from address)" },
  { value: "centro", label: "Centro" },
  { value: "roma-norte", label: "Roma Norte" },
  { value: "roma-sur", label: "Roma Sur" },
  { value: "condesa", label: "Condesa" },
  { value: "polanco", label: "Polanco" },
  { value: "narvarte", label: "Narvarte" },
  { value: "del-valle", label: "Del Valle" },
  { value: "coyoacan", label: "Coyoacán" },
  { value: "san-angel", label: "San Ángel" },
  { value: "tlalpan", label: "Tlalpan" },
  { value: "xochimilco", label: "Xochimilco" },
  { value: "santa-fe", label: "Santa Fe" },
  { value: "interlomas", label: "Interlomas" },
  { value: "satelite", label: "Satélite" }
];

export const LocationStep = ({ property, updateProperty, onNext, onPrev }: LocationStepProps) => {
  const { toast } = useToast();
  const [zone, setZone] = useState(property.location?.zone || 'auto');
  const [address, setAddress] = useState(property.location?.address || '');
  const [coordinates, setCoordinates] = useState({
    lat: property.location?.lat || 0,
    lng: property.location?.lng || 0
  });

  // Update local state when property changes
  useEffect(() => {
    if (property.location?.zone && property.location.zone !== zone) {
      setZone(property.location.zone);
    }
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
    console.log('Location changed:', { newAddress, lat, lng });
    setAddress(newAddress);
    setCoordinates({ lat, lng });
  };

  const handleConfirm = () => {
    // Only check if coordinates are valid (not 0,0)
    if (coordinates.lat === 0 && coordinates.lng === 0) {
      toast({
        title: "Location required",
        description: "Please search for an address and confirm the location on the map",
        variant: "destructive",
      });
      return;
    }

    // If we have coordinates but no address, use a placeholder
    const finalAddress = address.trim() || 'Location selected on map';

    updateProperty({
      location: {
        address: finalAddress,
        lat: coordinates.lat,
        lng: coordinates.lng,
        zone: zone || 'auto'
      }
    });
    onNext();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Property Location</h2>
        <p className="text-muted-foreground">
          Search for your property address and confirm the exact location on the map
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Zone Selection */}
        <div className="space-y-2">
          <Label htmlFor="zone">Zone (Optional)</Label>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger>
              <SelectValue placeholder="Select a zone" />
            </SelectTrigger>
            <SelectContent>
              {ZONES.map((z) => (
                <SelectItem key={z.value} value={z.value}>
                  {z.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select "Auto" to automatically detect the zone from the address
          </p>
        </div>

        {/* Map */}
        <MapboxMap
          address={address}
          coordinates={coordinates}
          onLocationChange={handleLocationChange}
          onConfirm={handleConfirm}
          className="h-96"
        />
        
        {address && coordinates.lat !== 0 && coordinates.lng !== 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-1">
            <p className="text-sm">
              <strong>Zone:</strong> {ZONES.find(z => z.value === zone)?.label || 'Auto'}
            </p>
            <p className="text-sm">
              <strong>Address:</strong> {address}
            </p>
            <p className="text-sm">
              <strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={handleConfirm}>
          Continue
        </Button>
      </div>
    </div>
  );
};