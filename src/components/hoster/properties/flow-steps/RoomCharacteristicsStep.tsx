import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bed, Sofa, Package, Home, Upload, X, Calendar, DollarSign, Camera } from "lucide-react";
import { Property, ROOM_CHARACTERISTICS, FurnitureType, Room } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface RoomCharacteristicsStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const RoomCharacteristicsStep = ({ property, updateProperty, onNext, onPrev }: RoomCharacteristicsStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const handlePhotoUpload = async (roomId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const room = property.rooms?.find(r => r.id === roomId);
    const currentPhotos = room?.photos || [];

    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos JPG, PNG y WebP",
          variant: "destructive",
        });
        return false;
      }
      if (file.size > maxFileSize) {
        toast({
          title: "Archivo muy grande",
          description: `El archivo ${file.name} es muy grande. Máximo 5MB por archivo.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (currentPhotos.length + validFiles.length > maxFiles) {
      toast({
        title: "Demasiadas fotos",
        description: `Máximo ${maxFiles} fotos por habitación`,
        variant: "destructive",
      });
      return;
    }

    try {
      const newPhotos: string[] = [];
      
      for (const file of validFiles) {
        const photoUrl = URL.createObjectURL(file);
        newPhotos.push(photoUrl);
      }

      updateRoom(roomId, {
        photos: [...currentPhotos, ...newPhotos]
      });

      toast({
        title: "Fotos subidas",
        description: `${validFiles.length} foto(s) agregada(s) a ${room?.name}`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Error al subir las fotos. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      event.target.value = '';
    }
  };

  const removePhoto = (roomId: string, photoIndex: number) => {
    const room = property.rooms?.find(r => r.id === roomId);
    if (!room?.photos) return;

    const updatedPhotos = room.photos.filter((_, index) => index !== photoIndex);
    updateRoom(roomId, { photos: updatedPhotos });
  };

  const isRoomComplete = (room: Room) => {
    const minPhotos = 3;
    return !!(
      room.name &&
      room.characteristics &&
      room.furniture &&
      room.price &&
      room.price > 0 &&
      room.availableFrom &&
      room.photos &&
      room.photos.length >= minPhotos
    );
  };

  const getRoomValidationMessage = (room: Room) => {
    const minPhotos = 3;
    const issues = [];
    
    if (!room.characteristics) issues.push('características');
    if (!room.furniture) issues.push('mobiliario');
    if (!room.price || room.price <= 0) issues.push('precio');
    if (!room.availableFrom) issues.push('fecha disponible');
    if (!room.photos || room.photos.length < minPhotos) {
      issues.push(`${minPhotos} fotos mínimas (tienes ${room.photos?.length || 0})`);
    }
    
    return issues.length > 0 ? `Falta: ${issues.join(', ')}` : 'Completo ✓';
  };

  const allRoomsConfigured = property.rooms?.every(room => isRoomComplete(room)) || false;

  const getFurnitureIcon = (furniture: FurnitureType) => {
    switch (furniture) {
      case 'amueblada': return Sofa;
      case 'semi-amueblada': return Package;
      default: return Home;
    }
  };

  const furnitureOptions = [
    { value: 'amueblada', label: t('propertyFlow.furnished') || 'Amueblada' },
    { value: 'semi-amueblada', label: t('propertyFlow.semi_furnished') || 'Semi-amueblada' },
    { value: 'sin-amueblar', label: t('propertyFlow.unfurnished') || 'Sin amueblar' }
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.room_details') || 'Detalles de las Habitaciones'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('propertyFlow.room_details_desc') || 'Configura los detalles de cada habitación'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {property.rooms?.map((room, index) => {
          const isExpanded = expandedRoom === room.id;
          const isComplete = isRoomComplete(room);
          const FurnitureIcon = getFurnitureIcon(room.furniture);
          
          return (
            <Card key={room.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-primary" />
                    {room.name}
                    {isComplete && <Badge variant="secondary" className="bg-green-100 text-green-800">Completa</Badge>}
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? 'Colapsar' : 'Expandir'}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-6 animate-fade-in">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('propertyFlow.room_name') || 'Nombre de la habitación'}</Label>
                      <Input
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                        placeholder="Ej: Habitación principal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('propertyFlow.characteristics') || 'Características'}</Label>
                      <Select 
                        value={room.characteristics} 
                        onValueChange={(value) => updateRoom(room.id, { characteristics: value })}
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
                  </div>

                  {/* Furniture and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('propertyFlow.furniture') || 'Mobiliario'}</Label>
                      <Select 
                        value={room.furniture} 
                        onValueChange={(value: FurnitureType) => updateRoom(room.id, { furniture: value })}
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

                    <div className="space-y-2">
                      <Label>{t('propertyFlow.monthly_price') || 'Precio mensual (MXN)'}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={room.price || ''}
                          onChange={(e) => updateRoom(room.id, { price: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pl-10"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('propertyFlow.deposit') || 'Depósito (opcional)'}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={room.depositAmount || ''}
                          onChange={(e) => updateRoom(room.id, { depositAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="pl-10"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Availability Date */}
                  <div className="space-y-2">
                    <Label>{t('propertyFlow.available_from') || 'Disponible desde'}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={room.availableFrom ? new Date(room.availableFrom).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateRoom(room.id, { availableFrom: new Date(e.target.value) })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Room Photos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t('propertyFlow.room_photos') || 'Fotos de la habitación'}</Label>
                      <span className={`text-sm font-medium ${(room.photos?.length || 0) >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                        {room.photos?.length || 0}/3 mínimas {(room.photos?.length || 0) >= 3 && '✓'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sube mínimo 3 fotos de alta calidad de esta habitación
                    </p>
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(room.id, e)}
                        className="hidden"
                        id={`photo-upload-${room.id}`}
                      />
                      <label
                        htmlFor={`photo-upload-${room.id}`}
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {t('propertyFlow.upload_room_photos') || 'Subir fotos de la habitación'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('propertyFlow.room_photo_instructions') || 'Máximo 5 fotos por habitación'}
                        </p>
                      </label>
                    </div>

                    {/* Photo Grid */}
                    {room.photos && room.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {room.photos.map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative group">
                            <img
                              src={photo}
                              alt={`${room.name} photo ${photoIndex + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              onClick={() => removePhoto(room.id, photoIndex)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
              {!expandedRoom && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isRoomComplete(room) ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className={`text-sm ${isRoomComplete(room) ? 'text-green-600' : 'text-orange-600'}`}>
                          {getRoomValidationMessage(room)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• {ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics)?.name || 'Sin configurar'}</p>
                      <p>• {furnitureOptions.find(f => f.value === room.furniture)?.label || 'Sin configurar'}</p>
                      <p>• ${room.price?.toLocaleString() || '0'} MXN/mes</p>
                      {room.depositAmount && <p>• Depósito: ${room.depositAmount.toLocaleString()} MXN</p>}
                      <p>• Disponible desde: {room.availableFrom ? new Date(room.availableFrom).toLocaleDateString() : 'No especificado'}</p>
                      <p>• {room.photos?.length || 0} foto(s) {(room.photos?.length || 0) >= 3 ? '✓' : '(mín. 3)'}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
          {t('propertyFlow.previous') || 'Anterior'}
        </Button>
        <Button 
          onClick={onNext}
          disabled={!allRoomsConfigured}
          className="order-1 sm:order-2"
        >
          {t('propertyFlow.continue') || 'Continuar'} ({property.rooms?.filter(isRoomComplete).length || 0}/{property.rooms?.length || 0})
        </Button>
      </div>
    </div>
  );
};