import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2 } from "lucide-react";
import { Property, PropertyType } from "@/types/property";

interface PropertyTypeStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
}

export const PropertyTypeStep = ({ property, updateProperty, onNext }: PropertyTypeStepProps) => {
  const handleSelect = (type: PropertyType) => {
    updateProperty({ propertyType: type });
    setTimeout(onNext, 300);
  };

  const propertyTypes = [
    {
      id: 'casa' as PropertyType,
      title: 'Casa',
      icon: Home
    },
    {
      id: 'departamento' as PropertyType,
      title: 'Departamento',
      icon: Building2
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Tipo de <span className="text-highlight">Propiedad</span>
        </h2>
        <p className="text-muted-foreground">Selecciona el tipo de propiedad que vas a registrar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = property.propertyType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all animate-fade-in hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-section-contrast' : ''
              }`}
              onClick={() => handleSelect(type.id)}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-button-gradient' : 'bg-muted'
                }`}>
                  <Icon className={`w-10 h-10 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <h3 className="text-2xl font-semibold">{type.title}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};