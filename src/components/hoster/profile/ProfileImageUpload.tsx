import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Camera, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showUploadButton?: boolean;
}

export const ProfileImageUpload = ({ 
  currentImage, 
  onImageChange, 
  size = 'md',
  className = '',
  showUploadButton = true
}: ProfileImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Crear URL temporal para mostrar la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageChange(imageUrl);
      setIsUploading(false);
      
      toast({
        title: "Imagen cargada",
        description: "Tu foto de perfil ha sido actualizada",
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Imagen eliminada",
      description: "Se ha eliminado tu foto de perfil",
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} cursor-pointer transition-opacity group-hover:opacity-80`}>
          {currentImage ? (
            <AvatarImage src={currentImage} alt="Foto de perfil" />
          ) : (
            <AvatarFallback className="bg-muted">
              <User className={iconSizes[size]} />
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Overlay con botón de cámara */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleUploadClick}
        >
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Botones de acción */}
      {showUploadButton && (
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                Cargando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {currentImage ? 'Cambiar foto' : 'Subir foto'}
              </>
            )}
          </Button>
          
          {currentImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="w-full text-destructive hover:text-destructive"
            >
              Eliminar foto
            </Button>
          )}
        </div>
      )}

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};