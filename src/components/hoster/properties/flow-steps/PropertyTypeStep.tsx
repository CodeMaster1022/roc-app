import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, ArrowRight } from "lucide-react";
import { Property, PropertyType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTypeStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
}

export const PropertyTypeStep = ({ property, updateProperty, onNext }: PropertyTypeStepProps) => {
  const { t } = useLanguage();
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(property.propertyType || null);

  const handlePropertyTypeSelect = (type: PropertyType) => {
    setSelectedPropertyType(type);
    updateProperty({ propertyType: type });
  };

  const handleContinue = () => {
    if (selectedPropertyType) {
      onNext();
    }
  };

  const propertyTypes = [
    {
      id: 'casa' as PropertyType,
      title: 'Casa',
      description: 'Propiedad independiente con jardín o patio',
      icon: Home
    },
    {
      id: 'departamento' as PropertyType,
      title: 'Departamento',
      description: 'Unidad dentro de un edificio o complejo',
      icon: Building2
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Tipo de Propiedad
        </h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de propiedad que vas a registrar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedPropertyType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-primary/5 shadow-lg' : ''
              }`}
              onClick={() => handlePropertyTypeSelect(type.id)}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-primary' : 'bg-muted'
                }`}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">{type.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPropertyType && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleContinue}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};