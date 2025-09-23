import { Heart, Home, Users, PawPrint, Bath, Ruler, Building, Bed } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RocButton } from "@/components/ui/roc-button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface PropertyCardProps {
  id: string
  title: string
  image: string
  price: number
  type: "propiedad" | "habitacion"
  propertyType: "departamento" | "casa"
  area: number
  bedrooms: number
  allowsPets: boolean
  bathType?: "privado" | "compartido" // Solo para habitaciones
  scheme?: "mixto" | "hombres" | "mujeres" // Solo para habitaciones
  isFavorite?: boolean
  isAvailable?: boolean
  height?: string // New height prop
  className?: string // New className prop for additional styling
  onFavoriteToggle: (id: string) => void
  onViewDetails: (id: string) => void
}

const PropertyCard = ({
  id,
  title,
  image,
  price,
  type,
  propertyType,
  area,
  bedrooms,
  allowsPets,
  bathType,
  scheme,
  isFavorite = false,
  isAvailable = true,
  height, // New height parameter
  className, // New className parameter
  onFavoriteToggle,
  onViewDetails
}: PropertyCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { t } = useLanguage()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getSchemeColor = (scheme?: string) => {
    switch (scheme) {
      case "hombres": return "bg-blue-100 text-blue-800"
      case "mujeres": return "bg-pink-100 text-pink-800"
      case "mixto": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleCardClick = () => {
    if (isAvailable) {
      console.log('Viewing property:', { id, isAvailable, title });
      onViewDetails(id);
    }
  }

  return (
    <Card 
      className={`card-hover group overflow-hidden flex flex-col cursor-pointer ${className || ''} ${
        !isAvailable ? 'opacity-60 cursor-not-allowed' : ''
      }`} 
      style={height ? { height } : {}}
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Imagen principal */}
        <div className="h-[150px] bg-muted relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          )}
        </div>

        {/* Botón de favoritos */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(id)
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Etiqueta de disponibilidad */}
        {!isAvailable && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            {t('property.not_allowed')}
          </div>
        )}

        {/* Badge de tipo de propiedad */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground">
          
            {type === "propiedad" ? t('results.complete_properties') : t('filter.room')}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex-1 space-y-3">
          {/* Título y precio */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-xl leading-tight line-clamp-2 flex-1 mr-2">
              {title}
            </h3>
            <div className="text-right shrink-0">
              <p className="highlight-text text-xl font-bold">{formatPrice(price)}</p>
              <p className="text-sm text-muted-foreground">{t('units.month')}</p>
            </div>
          </div>

          {/* Información básica con iconos específicos */}
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            {/* Tipo de propiedad (departamento/casa) */}
            <div className="flex items-center gap-1.5">
              {propertyType === "departamento" ? (
                <Building className="h-4 w-4 text-primary" />
              ) : (
                <Home className="h-4 w-4 text-primary" />
              )}
              <span className="capitalize">{propertyType}</span>
            </div>

            {/* Área */}
            <div className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-primary" />
              <span>{area} {t('units.m2')}</span>
            </div>

            {/* Para propiedades completas: número de habitaciones */}
            {type === "propiedad" && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-primary" />
                <span>{bedrooms} {bedrooms === 1 ? t('property.bedrooms').slice(0, -1) : t('property.bedrooms')}</span>
              </div>
            )}

            {/* Para habitaciones: tipo de baño */}
            {type === "habitacion" && bathType && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary" />
                <span className="capitalize">{bathType === 'privado' ? t('property.private_bathroom') : t('property.shared_bathroom')}</span>
              </div>
            )}

            {/* Para habitaciones: esquema */}
            {type === "habitacion" && scheme && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span className="capitalize">{scheme}</span>
              </div>
            )}

            {/* Mascotas permitidas - siempre presente para mantener consistencia */}
            <div className="flex items-center gap-1.5">
              <PawPrint className={`h-4 w-4 ${allowsPets ? 'text-green-500' : 'text-gray-400'}`} />
              <span>{allowsPets ? t('property.pets_allowed') : t('property.not_allowed')}</span>
            </div>
          </div>
        </div>

        {/* Availability indicator */}
        {!isAvailable && (
          <div className="text-center text-sm text-red-500 font-medium">
            No disponible
          </div>
        )}
        
        {/* Click hint for available properties */}
        {isAvailable && (
          <div className="text-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click para ver detalles
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PropertyCard