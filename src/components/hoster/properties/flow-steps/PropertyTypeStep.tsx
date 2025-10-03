import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Building2 } from "lucide-react";
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
    // Auto-advance to next step after selection
    setTimeout(() => {
      onNext();
    }, 300); // Small delay for visual feedback
  };

  const propertyTypes = [
    {
      id: 'casa' as PropertyType,
      title: t('create.casa'),
      description: '',
      icon: Home
    },
    {
      id: 'departamento' as PropertyType,
      title: t('create.departamento'),
      description: '',
      icon: Building2
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t('create.property_type_title')}
        </h2>
        <p className="text-muted-foreground">
          {t('create.property_type_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedPropertyType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                isSelected ? 'ring-4 ring-primary bg-primary/5 shadow-xl' : 'hover:border-primary/50'
              }`}
              onClick={() => handlePropertyTypeSelect(type.id)}
            >
              <CardContent className="p-8 text-center space-y-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-primary scale-110' : 'bg-muted'
                }`}>
                  <Icon className={`w-10 h-10 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                  {type.description && (
                    <p className="text-base text-muted-foreground">{type.description}</p>
                  )}
                </div>
                
                {/* {isSelected && (
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-primary">Seleccionado</span>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};