import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Home, 
  FileText, 
  Settings, 
  Wifi, 
  Car, 
  Tv, 
  Waves, 
  Dumbbell,
  PawPrint,
  Cigarette,
  Users,
  Clock,
  Send,
  X,
  Upload
} from "lucide-react";
import { Property, ROOM_CHARACTERISTICS } from "@/types/property";
import { useToast } from "@/hooks/use-toast";

interface PropertyDetailsStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export const PropertyDetailsStep = ({ property, updateProperty, onPrev, onComplete, isSubmitting }: PropertyDetailsStepProps) => {
  const [details, setDetails] = useState(property.details || {
    name: '',
    description: '',
    photos: [],
    amenities: [],
    included: [],
    advancedConfig: {
      enabled: false,
      rules: { pets: false, smoking: false, meetings: { allowed: false } },
      environment: { title: '', description: '' }
    }
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roomFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  const amenitiesOptions = [
    { id: 'gym', label: '🏋️‍♂️ Gym', emoji: '🏋️‍♂️' },
    { id: 'ludoteca', label: '🧸 Ludoteca', emoji: '🧸' },
    { id: 'roof_garden', label: '🌇 Roof Garden', emoji: '🌇' },
    { id: 'lounge', label: '🍷 Lounge', emoji: '🍷' },
    { id: 'jardines', label: '🌿 Jardines', emoji: '🌿' },
    { id: 'alberca', label: '🏊‍♂️ Alberca', emoji: '🏊‍♂️' },
    { id: 'sala_juntas', label: '📊 Sala de juntas', emoji: '📊' },
    { id: 'yoga', label: '🧘‍♂️ Área de yoga', emoji: '🧘‍♂️' },
    { id: 'salon_fiestas', label: '🎉 Salón de fiestas', emoji: '🎉' },
    { id: 'cafeteria', label: '☕ Cafetería', emoji: '☕' },
    { id: 'coworking', label: '💼 Coworking', emoji: '💼' },
    { id: 'salon_juegos', label: '🎮 Salón de juegos', emoji: '🎮' },
    { id: 'pet_friendly', label: '🐾 Pet friendly', emoji: '🐾' },
    { id: 'sky_bar', label: '🍸 Sky bar', emoji: '🍸' },
    { id: 'sauna', label: '🧖 Sauna', emoji: '🧖' },
    { id: 'spa', label: '💆‍♂️ Spa', emoji: '💆‍♂️' },
    { id: 'lavanderia', label: '🧺 Lavandería', emoji: '🧺' },
    { id: 'padel', label: '🎾 Cancha de pádel', emoji: '🎾' },
    { id: 'salon_belleza', label: '💇‍♀️ Salón de belleza', emoji: '💇‍♀️' },
    { id: 'basquet', label: '🏀 Cancha de básquet', emoji: '🏀' },
    { id: 'futbol', label: '⚽ Cancha de fútbol', emoji: '⚽' },
    { id: 'cine', label: '🎥 Cine privado', emoji: '🎥' },
    { id: 'golf', label: '⛳ Acceso directo al campo de golf', emoji: '⛳' },
    { id: 'jogging', label: '🏃 Zona de jogging', emoji: '🏃' }
  ];

  const includedOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'parking', label: 'Estacionamiento', icon: Car },
    { id: 'cleaning', label: 'Servicio de limpieza', icon: Settings },
  ];

  const updateDetails = (field: string, value: any) => {
    const updated = { ...details, [field]: value };
    setDetails(updated);
    updateProperty({ details: updated });
  };

  const updateAdvancedConfig = (field: string, value: any) => {
    const updated = {
      ...details,
      advancedConfig: {
        ...details.advancedConfig,
        [field]: value
      }
    };
    setDetails(updated);
    updateProperty({ details: updated });
  };

  const updateRule = (rule: string, value: any) => {
    const updated = {
      ...details,
      advancedConfig: {
        ...details.advancedConfig,
        rules: {
          ...details.advancedConfig.rules,
          [rule]: value
        }
      }
    };
    setDetails(updated);
    updateProperty({ details: updated });
  };

  const toggleAmenity = (amenityId: string) => {
    const updated = details.amenities.includes(amenityId)
      ? details.amenities.filter(a => a !== amenityId)
      : [...details.amenities, amenityId];
    
    updateDetails('amenities', updated);
  };

  const toggleIncluded = (includedId: string) => {
    const updated = (details.included || []).includes(includedId)
      ? (details.included || []).filter(a => a !== includedId)
      : [...(details.included || []), includedId];
    
    updateDetails('included', updated);
  };

  // Image upload handlers
  const handlePropertyImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file count (max 10 images)
    const currentPhotos = details.photos || [];
    if (currentPhotos.length + files.length > 10) {
      toast({
        title: "Error",
        description: "Máximo 10 fotos permitidas",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    const newPhotos = [...currentPhotos];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `${file.name} debe ser menor a 5MB`,
            variant: "destructive",
          });
          continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPhotos.push(previewUrl);
      }

      updateDetails('photos', newPhotos);
      toast({
        title: "Éxito",
        description: `${files.length} foto(s) agregada(s)`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Error al subir las imágenes",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removePropertyImage = (index: number) => {
    const updatedPhotos = details.photos.filter((_, i) => i !== index);
    updateDetails('photos', updatedPhotos);
  };

  const handleRoomImageUpload = async (roomId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    
    try {
      const room = property.rooms?.find(r => r.id === roomId);
      if (!room) return;

      const newPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const previewUrl = URL.createObjectURL(file);
        newPhotos.push(previewUrl);
      }

      // Update room with photos (you might need to extend the Room interface to include photos)
      const updatedRooms = property.rooms?.map(r => 
        r.id === roomId ? { ...r, photos: [...(r.photos || []), ...newPhotos] } : r
      ) || [];
      
      updateProperty({ rooms: updatedRooms });
      
      toast({
        title: "Éxito",
        description: `${newPhotos.length} foto(s) agregada(s) a ${room.name}`,
      });
    } catch (error) {
      console.error('Error uploading room images:', error);
      toast({
        title: "Error",
        description: "Error al subir las imágenes de la habitación",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const isValid = details.name.trim() && details.description.trim();

  const handleComplete = async () => {
    console.log('🏠 PropertyDetailsStep - handleComplete called');
    console.log('Property data:', property);
    console.log('Details data:', details);
    console.log('Is valid:', isValid);
    console.log('onComplete function:', onComplete);
    
    if (!isValid) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre y descripción de la propiedad.",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure the latest details are synced to the parent property
    const updatedProperty = { ...property, details };
    updateProperty({ details });
    
    console.log('Updated property before calling onComplete:', updatedProperty);
    console.log('🚀 About to call parent onComplete function');
    
    // Call the parent's onComplete function
    onComplete();
    
    console.log('✅ Parent onComplete function called');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Arma tu <span className="text-highlight">{property.type === 'rooms' ? 'Habitaciones' : 'Propiedad'}</span>
        </h2>
        <p className="text-muted-foreground">Completa la información para publicar tu propiedad</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Fotos de la propiedad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Fotos de la propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePropertyImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            
            {/* Image Preview Grid */}
            {details.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {details.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePropertyImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div 
              className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImages ? (
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-primary animate-pulse" />
                  <p className="text-primary">Subiendo imágenes...</p>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Haz clic para subir fotos de tu propiedad</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sube hasta 10 fotos ({details.photos.length}/10)
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la propiedad</Label>
              <Input
                placeholder="Ej: Casa en Roma Norte"
                value={details.name}
                onChange={(e) => updateDetails('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción general</Label>
              <Textarea
                placeholder="Describe tu propiedad, sus características principales y lo que la hace especial..."
                value={details.description}
                onChange={(e) => updateDetails('description', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Habitaciones individuales (solo para tipo habitaciones) */}
        {property.type === 'rooms' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Fotos de habitaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {property.rooms?.map((room, index) => {
                const characteristics = ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics);
                
                return (
                  <div key={room.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Input
                          placeholder={`Habitación ${index + 1}`}
                          value={room.name}
                          onChange={(e) => {
                            const updatedRooms = property.rooms?.map(r => 
                              r.id === room.id ? { ...r, name: e.target.value } : r
                            ) || [];
                            updateProperty({ rooms: updatedRooms });
                          }}
                          className="font-medium"
                        />
                      </div>
                      <div className="flex gap-2">
                        {characteristics && (
                          <Badge variant="secondary">
                            {characteristics.name}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {room.furniture}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={(el) => roomFileInputRefs.current[room.id] = el}
                        onChange={(e) => handleRoomImageUpload(room.id, e)}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {/* Room Image Preview */}
                      {room.photos && room.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {room.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative group">
                              <img
                                src={photo}
                                alt={`${room.name} ${photoIndex + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => {
                                  const updatedPhotos = room.photos?.filter((_, i) => i !== photoIndex) || [];
                                  const updatedRooms = property.rooms?.map(r => 
                                    r.id === room.id ? { ...r, photos: updatedPhotos } : r
                                  ) || [];
                                  updateProperty({ rooms: updatedRooms });
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2 h-2" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div 
                        className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => roomFileInputRefs.current[room.id]?.click()}
                      >
                        <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Fotos de {room.name}</p>
                        <p className="text-xs text-muted-foreground">({room.photos?.length || 0} fotos)</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* INCLUYE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              INCLUYE
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Servicios básicos incluidos en la renta
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {includedOptions.map((included) => {
                const Icon = included.icon;
                const isSelected = (details.included || []).includes(included.id);
                
                return (
                  <div
                    key={included.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted ${
                      isSelected ? 'bg-section-contrast border-primary' : ''
                    }`}
                    onClick={() => toggleIncluded(included.id)}
                  >
                    <div className="text-center space-y-2">
                      <Icon className={`w-6 h-6 mx-auto ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium">{included.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Amenidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Amenidades
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona las amenidades disponibles en el edificio o propiedad
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesOptions.map((amenity) => {
                const isSelected = details.amenities.includes(amenity.id);
                
                return (
                  <Badge
                    key={amenity.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`p-3 cursor-pointer transition-all hover:scale-105 justify-center text-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    {amenity.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Configuraciones avanzadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configuraciones avanzadas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Aquí podrás cargar reglas, tipo de ambiente, etc.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Habilitar configuraciones avanzadas</Label>
              <Switch 
                checked={details.advancedConfig.enabled}
                onCheckedChange={(checked) => updateAdvancedConfig('enabled', checked)}
              />
            </div>

            {details.advancedConfig.enabled && (
              <div className="space-y-6 animate-fade-in">
                {/* Reglas */}
                <div className="space-y-4">
                  <h4 className="font-medium">Reglas</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4" />
                        <Label>Mascotas</Label>
                      </div>
                      <Switch 
                        checked={details.advancedConfig.rules.pets}
                        onCheckedChange={(checked) => updateRule('pets', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cigarette className="w-4 h-4" />
                        <Label>Ambiente amigable para fumadores</Label>
                      </div>
                      <Switch 
                        checked={details.advancedConfig.rules.smoking}
                        onCheckedChange={(checked) => updateRule('smoking', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <Label>Reuniones</Label>
                        </div>
                        <Switch 
                          checked={details.advancedConfig.rules.meetings.allowed}
                          onCheckedChange={(checked) => updateRule('meetings', { allowed: checked })}
                        />
                      </div>
                      
                      {details.advancedConfig.rules.meetings.allowed && (
                        <div className="ml-6 animate-fade-in">
                          <Label className="text-sm">Horarios permitidos</Label>
                          <Input 
                            placeholder="Ej: Lunes a Viernes 6:00 PM - 10:00 PM"
                            value={details.advancedConfig.rules.meetings.schedule || ''}
                            onChange={(e) => updateRule('meetings', { 
                              allowed: true, 
                              schedule: e.target.value 
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tipo de ambiente */}
                <div className="space-y-4">
                  <h4 className="font-medium">Tipo de ambiente</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Título del ambiente"
                      value={details.advancedConfig.environment.title}
                      onChange={(e) => updateAdvancedConfig('environment', {
                        ...details.advancedConfig.environment,
                        title: e.target.value
                      })}
                    />
                    <Textarea
                      placeholder="Descripción del ambiente de la propiedad..."
                      value={details.advancedConfig.environment.description}
                      onChange={(e) => updateAdvancedConfig('environment', {
                        ...details.advancedConfig.environment,
                        description: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isSubmitting}
        >
          Anterior
        </Button>
        <Button 
          variant="default" 
          onClick={handleComplete}
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar a revisión
            </>
          )}
        </Button>
      </div>
    </div>
  );
};