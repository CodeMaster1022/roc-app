import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bed, Sofa, Package, Home } from "lucide-react";
import { Property, ROOM_CHARACTERISTICS, FurnitureType } from "@/types/property";

interface RoomCharacteristicsStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const RoomCharacteristicsStep = ({ property, updateProperty, onNext, onPrev }: RoomCharacteristicsStepProps) => {
  const updateRoomCharacteristics = (roomId: string, characteristics: string) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, characteristics } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const updateRoomFurniture = (roomId: string, furniture: FurnitureType) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, furniture } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const allRoomsConfigured = property.rooms?.every(room => 
    room.characteristics && room.furniture
  ) || false;

  const getFurnitureIcon = (furniture: FurnitureType) => {
    switch (furniture) {
      case 'amueblada': return Sofa;
      case 'semi-amueblada': return Package;
      default: return Home;
    }
  };

  const furnitureOptions = [
    { value: 'amueblada', label: 'Amueblada' },
    { value: 'semi-amueblada', label: 'Semi-amueblada' },
    { value: 'sin-amueblar', label: 'Sin amueblar' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Características de las <span className="text-highlight">Habitaciones</span>
        </h2>
        <p className="text-muted-foreground">Configura las características de cada habitación</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {property.rooms?.map((room, index) => {
          const FurnitureIcon = getFurnitureIcon(room.furniture);
          
          return (
            <Card key={room.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  {room.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Características</label>
                    <Select 
                      value={room.characteristics} 
                      onValueChange={(value) => updateRoomCharacteristics(room.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona las características" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_CHARACTERISTICS.map((char) => (
                          <SelectItem key={char.id} value={char.id}>
                            {char.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobiliario</label>
                    <Select 
                      value={room.furniture} 
                      onValueChange={(value: FurnitureType) => updateRoomFurniture(room.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el mobiliario" />
                      </SelectTrigger>
                      <SelectContent>
                        {furnitureOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {room.characteristics && room.furniture && (
                  <div className="flex items-center gap-2 pt-2 animate-fade-in">
                    <FurnitureIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics)?.name} - {furnitureOptions.find(f => f.value === room.furniture)?.label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          variant="gradient" 
          onClick={onNext}
          disabled={!allRoomsConfigured}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};