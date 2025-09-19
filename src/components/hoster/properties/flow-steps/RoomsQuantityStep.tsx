import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Bed } from "lucide-react";
import { Property } from "@/types/property";

interface RoomsQuantityStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const RoomsQuantityStep = ({ property, updateProperty, onNext, onPrev }: RoomsQuantityStepProps) => {
  const [roomCount, setRoomCount] = useState(property.rooms?.length || 0);

  const updateRoomCount = (count: number) => {
    if (count < 0) return;
    
    setRoomCount(count);
    
    const rooms = Array.from({ length: count }, (_, index) => ({
      id: `room-${index + 1}`,
      name: `Habitación ${index + 1}`,
      characteristics: '',
      furniture: property.furniture || 'sin-amueblar'
    }));
    
    updateProperty({ rooms });
  };

  const handleNext = () => {
    if (roomCount > 0) {
      onNext();
    }
  };

  const title = property.type === 'rooms' 
    ? 'Cantidad de habitaciones a rentar'
    : 'Cantidad de habitaciones disponibles en la propiedad';

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          <span className="text-highlight">Habitaciones</span>
        </h2>
        <p className="text-muted-foreground">{title}</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-section-contrast flex items-center justify-center">
              <Bed className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-4">
              <p className="text-lg font-medium">Número de habitaciones</p>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateRoomCount(roomCount - 1)}
                  disabled={roomCount <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <div className="w-20 h-20 rounded-full bg-button-gradient text-white flex items-center justify-center">
                  <span className="text-2xl font-bold">{roomCount}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateRoomCount(roomCount + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {roomCount > 0 && (
                <p className="text-muted-foreground animate-fade-in">
                  {roomCount === 1 ? '1 habitación seleccionada' : `${roomCount} habitaciones seleccionadas`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 max-w-md mx-auto">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          variant="gradient" 
          onClick={handleNext}
          disabled={roomCount === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};