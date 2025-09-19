import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Car, Bath } from "lucide-react";
import { Property } from "@/types/property";

interface AdditionalInfoStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AdditionalInfoStep = ({ property, updateProperty, onNext, onPrev }: AdditionalInfoStepProps) => {
  const [info, setInfo] = useState({
    area: property.additionalInfo?.area || 0,
    parking: property.additionalInfo?.parking || 0,
    bathrooms: property.additionalInfo?.bathrooms || 0
  });

  const updateInfo = (field: keyof typeof info, value: number) => {
    const newInfo = { ...info, [field]: value };
    setInfo(newInfo);
    updateProperty({ additionalInfo: newInfo });
  };

  const handleNext = () => {
    if (info.area > 0) {
      onNext();
    }
  };

  const isValid = info.area > 0;

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Información <span className="text-highlight">Adicional</span>
        </h2>
        <p className="text-muted-foreground">Completa los detalles de tu propiedad</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Detalles de la propiedad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Metros cuadrados
                </Label>
                <Input
                  type="number"
                  placeholder="m²"
                  value={info.area || ''}
                  onChange={(e) => updateInfo('area', parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Estacionamientos
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={info.parking || ''}
                  onChange={(e) => updateInfo('parking', parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  Baños totales
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={info.bathrooms || ''}
                  onChange={(e) => updateInfo('bathrooms', parseInt(e.target.value) || 0)}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  (Incluyendo los de las habitaciones)
                </p>
              </div>
            </div>

            {isValid && (
              <div className="p-4 bg-section-contrast rounded-lg animate-fade-in">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.area}</p>
                    <p className="text-sm text-muted-foreground">m²</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.parking}</p>
                    <p className="text-sm text-muted-foreground">Estacionamientos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.bathrooms}</p>
                    <p className="text-sm text-muted-foreground">Baños</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 max-w-2xl mx-auto">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          variant="default" 
          onClick={handleNext}
          disabled={!isValid}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};