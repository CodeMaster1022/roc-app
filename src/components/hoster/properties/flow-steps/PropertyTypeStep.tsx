import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, Users, Key, ArrowRight } from "lucide-react";
import { Property, PropertyType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTypeStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
}

type UnitType = 'property' | 'rooms';
type StepPhase = 'unit-type' | 'property-type';

export const PropertyTypeStep = ({ property, updateProperty, onNext }: PropertyTypeStepProps) => {
  const { t } = useLanguage();
  const [currentPhase, setCurrentPhase] = useState<StepPhase>('unit-type');
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(property.type || null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(property.propertyType || null);

  const handleUnitTypeSelect = (type: UnitType) => {
    setSelectedUnitType(type);
    updateProperty({ type });
    // Reset property type when unit type changes
    setSelectedPropertyType(null);
    updateProperty({ propertyType: undefined });
  };

  const handlePropertyTypeSelect = (type: PropertyType) => {
    setSelectedPropertyType(type);
    updateProperty({ propertyType: type });
  };

  const handleUnitTypeNext = () => {
    if (selectedUnitType) {
      setCurrentPhase('property-type');
    }
  };

  const handlePropertyTypeBack = () => {
    setCurrentPhase('unit-type');
  };

  const handleComplete = () => {
    if (selectedUnitType && selectedPropertyType) {
      setTimeout(onNext, 300);
    }
  };

  const unitTypes = [
    {
      id: 'property' as UnitType,
      title: t('propertyFlow.full_property') || 'Propiedad Completa',
      description: t('propertyFlow.full_property_desc') || 'Renta toda la propiedad como una unidad',
      icon: Key
    },
    {
      id: 'rooms' as UnitType,
      title: t('propertyFlow.by_rooms') || 'Por Habitaciones',
      description: t('propertyFlow.by_rooms_desc') || 'Renta habitaciones individuales',
      icon: Users
    }
  ];

  const propertyTypes = [
    {
      id: 'casa' as PropertyType,
      title: t('propertyFlow.house') || 'Casa',
      description: t('propertyFlow.house_desc') || 'Propiedad independiente con jardín o patio',
      icon: Home
    },
    {
      id: 'departamento' as PropertyType,
      title: t('propertyFlow.apartment') || 'Departamento',
      description: t('propertyFlow.apartment_desc') || 'Unidad dentro de un edificio o complejo',
      icon: Building2
    }
  ];

  // Unit Type Selection Phase
  if (currentPhase === 'unit-type') {
    return (
      <div className="p-3 space-y-3">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            <span className="text-highlight">{t('propertyFlow.offer_type') || 'Tipo de Oferta'}</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('propertyFlow.offer_type_desc') || '¿Cómo quieres rentar tu propiedad?'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
          {unitTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedUnitType === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all animate-fade-in hover:shadow-lg hover:scale-105 ${
                  isSelected ? 'ring-2 ring-primary bg-section-contrast shadow-lg scale-105' : ''
                }`}
                onClick={() => handleUnitTypeSelect(type.id)}
              >
                <CardContent className="p-3 text-center space-y-4">
                  <div className={`w-8 h-8 md:w-16 md:h-12 mx-auto rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-button-gradient shadow-lg' : 'bg-muted'
                  }`}>
                    <Icon className={`w-7 h-7 md:w-8 md:h-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{type.title}</h3>
                    <p className="text-sm text-muted-foreground leading-snug">{type.description}</p>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center text-primary animate-fade-in">
                      <span className="text-xs font-medium mr-2">Seleccionado</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedUnitType && (
          <div className="flex justify-center pt-4 animate-fade-in">
            <Button 
              onClick={handleUnitTypeNext}
              size="default"
              className="px-6 py-2"
            >
              {t('propertyFlow.continue') || 'Continuar'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Property Type Selection Phase
  return (
    <div className="p-3 space-y-3">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.property_type') || 'Tipo de Propiedad'}</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('propertyFlow.property_type_desc') || '¿Qué tipo de propiedad es?'}
        </p>
      </div>

      {/* Show selected unit type */}
      <div className="bg-muted/30 rounded-lg p-3 max-w-sm mx-auto animate-fade-in">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            {selectedUnitType === 'property' ? 
              <Key className="w-3 h-3 text-white" /> : 
              <Users className="w-3 h-3 text-white" />
            }
          </div>
          <span className="text-sm font-medium">
            {selectedUnitType === 'property' ? 
              (t('propertyFlow.full_property') || 'Propiedad Completa') : 
              (t('propertyFlow.by_rooms') || 'Por Habitaciones')
            }
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedPropertyType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all animate-fade-in hover:shadow-lg hover:scale-105 ${
                isSelected ? 'ring-2 ring-primary bg-section-contrast shadow-lg scale-105' : ''
              }`}
              onClick={() => handlePropertyTypeSelect(type.id)}
            >
              <CardContent className="p-3 text-center space-y-4">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-button-gradient shadow-lg' : 'bg-muted'
                }`}>
                  <Icon className={`w-7 h-7 md:w-8 md:h-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">{type.description}</p>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center text-primary animate-fade-in">
                    <span className="text-xs font-medium mr-2">Seleccionado</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={handlePropertyTypeBack}
          className="order-2 sm:order-1"
          size="default"
        >
          {t('propertyFlow.previous') || 'Anterior'}
        </Button>
        
        {selectedPropertyType && (
          <Button 
            onClick={handleComplete}
            size="default"
            className="px-6 py-2 order-1 sm:order-2 animate-fade-in"
          >
            {t('propertyFlow.continue') || 'Continuar'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};