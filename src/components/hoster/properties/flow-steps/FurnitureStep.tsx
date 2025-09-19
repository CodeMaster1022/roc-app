import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sofa, Package, Home } from "lucide-react";
import { Property, FurnitureType } from "@/types/property";

interface FurnitureStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const FurnitureStep = ({ property, updateProperty, onNext, onPrev }: FurnitureStepProps) => {
  const handleSelect = (furniture: FurnitureType) => {
    updateProperty({ furniture });
    setTimeout(onNext, 300);
  };

  const furnitureOptions = [
    {
      id: 'amueblada' as FurnitureType,
      title: 'Amueblada',
      description: 'Habitación equipada con muebles',
      icon: Sofa
    },
    {
      id: 'semi-amueblada' as FurnitureType,
      title: 'Semi-amueblada',
      description: 'Habitación con muebles básicos',
      icon: Package
    },
    {
      id: 'sin-amueblar' as FurnitureType,
      title: 'Sin amueblar',
      description: 'Habitación sin muebles',
      icon: Home
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          <span className="text-highlight">Mobiliario</span>
        </h2>
        <p className="text-muted-foreground">¿Cómo está amueblado tu {property.propertyType}?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {furnitureOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = property.furniture === option.id;
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all animate-fade-in hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-section-contrast' : ''
              }`}
              onClick={() => handleSelect(option.id)}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-button-gradient' : 'bg-muted'
                }`}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{option.title}</h3>
                  <p className="text-muted-foreground text-sm">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
      </div>
    </div>
  );
};