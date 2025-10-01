import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PropertyPhotosStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PropertyPhotosStep = ({ property, updateProperty, onNext, onPrev }: PropertyPhotosStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>(property.details?.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFiles = 10;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

    if (photos.length + validFiles.length > maxFiles) {
      toast({
        title: "Demasiadas fotos",
        description: `Máximo ${maxFiles} fotos permitidas`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newPhotos: string[] = [];
      
      for (const file of validFiles) {
        const photoUrl = URL.createObjectURL(file);
        newPhotos.push(photoUrl);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      
      updateProperty({
        details: {
          ...property.details,
          photos: updatedPhotos
        }
      });

      toast({
        title: "Fotos subidas",
        description: `${validFiles.length} foto(s) agregada(s) exitosamente`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Error al subir las fotos. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  }, [photos, property.details, updateProperty, toast]);

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    updateProperty({
      details: {
        ...property.details,
        photos: updatedPhotos
      }
    });
  };

  const handleNext = () => {
    const minPhotos = 5;
    if (photos.length < minPhotos) {
      toast({
        title: "Fotos insuficientes",
        description: `Se requieren mínimo ${minPhotos} fotos de la propiedad. Tienes ${photos.length} foto${photos.length === 1 ? '' : 's'}.`,
        variant: "destructive",
      });
      return;
    }

    updateProperty({
      details: {
        ...property.details,
        photos
      }
    });
    onNext();
  };

  const hasMinPhotos = photos.length >= 5;
  const hasPhotos = photos.length > 0;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.photos') || 'Fotos de la propiedad'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Sube mínimo 5 fotos de alta calidad de tu propiedad
        </p>
        <div className="mt-2">
          <span className={`text-sm font-medium ${hasMinPhotos ? 'text-green-600' : 'text-orange-600'}`}>
            {photos.length}/5 fotos mínimas {hasMinPhotos && '✓'}
          </span>
          <span className="text-xs text-muted-foreground ml-2">(máximo 10)</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isUploading 
                  ? (t('propertyFlow.uploading') || 'Subiendo fotos...') 
                  : (t('propertyFlow.click_to_upload') || 'Haz clic para subir fotos')
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {t('propertyFlow.upload_instructions') || 'JPG, PNG o WebP hasta 5MB cada una. Máximo 10 fotos.'}
              </p>
            </div>
          </label>
        </div>

        {/* Photo Grid */}
        {hasPhotos && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
            {t('propertyFlow.previous') || 'Anterior'}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!hasMinPhotos}
            className="order-1 sm:order-2"
          >
            {t('propertyFlow.continue') || 'Continuar'} ({photos.length}/10)
          </Button>
        </div>
      </div>
    </div>
  );
}; 