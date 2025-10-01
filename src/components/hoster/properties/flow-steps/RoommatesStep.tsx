import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, User } from "lucide-react";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface RoommatesStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface Roommate {
  id: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  occupation: string;
  personality: string;
}

export const RoommatesStep = ({ property, updateProperty, onNext, onPrev }: RoommatesStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [roommates, setRoommates] = useState<Roommate[]>(
    (property.details?.roommates as Roommate[]) || []
  );

  const addRoommate = () => {
    const newRoommate: Roommate = {
      id: `roommate-${Date.now()}`,
      gender: 'male',
      age: 25,
      occupation: '',
      personality: ''
    };
    
    const updatedRoommates = [...roommates, newRoommate];
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      }
    });
  };

  const removeRoommate = (roommateId: string) => {
    const updatedRoommates = roommates.filter(r => r.id !== roommateId);
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      }
    });
  };

  const updateRoommate = (roommateId: string, updates: Partial<Roommate>) => {
    const updatedRoommates = roommates.map(roommate =>
      roommate.id === roommateId ? { ...roommate, ...updates } : roommate
    );
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      }
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'other', label: 'Otro' }
  ];

  const occupationOptions = [
    'Estudiante',
    'Profesional',
    'Emprendedor',
    'Freelancer',
    'Empleado',
    'Otro'
  ];

  const personalityOptions = [
    'Tranquilo/a',
    'Sociable',
    'Estudioso/a',
    'Deportista',
    'Creativo/a',
    'Responsable',
    'Amigable',
    'Independiente'
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.roommates_title') || 'Compañeros de casa'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('propertyFlow.roommates_description') || 'Describe a las personas que actualmente viven en la propiedad'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Roommate Button */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Button 
              onClick={addRoommate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('propertyFlow.add_roommate') || 'Agregar compañero de casa'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t('propertyFlow.roommate_optional') || 'Opcional: Ayuda a los inquilinos a conocer el ambiente de la casa'}
            </p>
          </CardContent>
        </Card>

        {/* Roommates List */}
        {roommates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Compañeros de casa ({roommates.length})
              </h3>
            </div>

            {roommates.map((roommate, index) => (
              <Card key={roommate.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Compañero {index + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoommate(roommate.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gender */}
                    <div className="space-y-2">
                      <Label>Género</Label>
                      <Select 
                        value={roommate.gender} 
                        onValueChange={(value: 'male' | 'female' | 'other') => 
                          updateRoommate(roommate.id, { gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <Label>Edad</Label>
                      <Input
                        type="number"
                        value={roommate.age}
                        onChange={(e) => updateRoommate(roommate.id, { age: parseInt(e.target.value) || 18 })}
                        min="18"
                        max="100"
                      />
                    </div>

                    {/* Occupation */}
                    <div className="space-y-2">
                      <Label>Ocupación</Label>
                      <Select 
                        value={roommate.occupation} 
                        onValueChange={(value) => updateRoommate(roommate.id, { occupation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ocupación" />
                        </SelectTrigger>
                        <SelectContent>
                          {occupationOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="space-y-2">
                    <Label>Personalidad</Label>
                    <div className="flex flex-wrap gap-2">
                      {personalityOptions.map((trait) => (
                        <Badge
                          key={trait}
                          variant={roommate.personality.includes(trait) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const currentTraits = roommate.personality.split(', ').filter(t => t);
                            const updatedTraits = currentTraits.includes(trait)
                              ? currentTraits.filter(t => t !== trait)
                              : [...currentTraits, trait];
                            updateRoommate(roommate.id, { personality: updatedTraits.join(', ') });
                          }}
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                    <Textarea
                      value={roommate.personality}
                      onChange={(e) => updateRoommate(roommate.id, { personality: e.target.value })}
                      placeholder="Describe la personalidad (ej: Tranquilo, Sociable, Estudioso)"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {roommates.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin compañeros de casa</h3>
            <p className="text-muted-foreground text-sm">
              Agrega información sobre las personas que viven en la propiedad para ayudar a los inquilinos a conocer el ambiente
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
          {t('propertyFlow.previous') || 'Anterior'}
        </Button>
        <Button 
          onClick={onNext}
          className="order-1 sm:order-2"
        >
          {t('propertyFlow.continue') || 'Continuar'}
        </Button>
      </div>
    </div>
  );
}; 