import { Heart, Ruler, PawPrint, Users, Bath } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface MobileRoomCardProps {
  id: string
  title: string
  image: string
  price: number
  type: "propiedad" | "habitacion"
  propertyType: "departamento" | "casa"
  area: number
  bedrooms: number
  allowsPets: boolean
  bathType?: "privado" | "compartido"
  scheme?: "mixto" | "hombres" | "mujeres"
  location?: string
  isFavorite?: boolean
  isAvailable?: boolean
  onFavoriteToggle: (id: string) => void
  onViewDetails: (id: string) => void
}

const MobileRoomCard = ({
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
  location,
  isFavorite = false,
  isAvailable = true,
  onFavoriteToggle,
  onViewDetails
}: MobileRoomCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { t } = useLanguage()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCardClick = () => {
    if (isAvailable) {
      onViewDetails(id)
    }
  }

  const getSchemeLabel = (scheme?: string) => {
    switch (scheme) {
      case "hombres": return "Men only"
      case "mujeres": return "Women only"
      case "mixto": return "Mixed"
      default: return "Mixed"
    }
  }

  const getBathTypeLabel = (bathType?: string) => {
    return bathType === "privado" ? "Private" : "Shared"
  }

  return (
    <div 
      className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        !isAvailable ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Favorite Button - moved to top-right corner of entire card */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFavoriteToggle(id)
        }}
        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 z-20"
      >
        <Heart 
          className={`h-4 w-4 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
          }`} 
        />
      </button>

      <div className="flex h-48">
        {/* Image Section */}
        <div className="relative w-32 h-48 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          {/* Title and Location */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {location || 'Houston, Texas'}
            </p>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
            {/* Bath Type */}
            {bathType && (
              <div className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                <span className="font-medium">{getBathTypeLabel(bathType)}</span>
              </div>
            )}

            {/* Area */}
            <div className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              <span className="font-medium">{area}m²</span>
            </div>

            {/* Pet Friendly */}
            {allowsPets && (
              <div className="flex items-center gap-1">
                <PawPrint className="h-3 w-3" />
                <span className="font-medium">Pet</span>
              </div>
            )}

            {/* Scheme */}
            {scheme && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="font-medium">{getSchemeLabel(scheme)}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            <span className="text-sm font-medium text-gray-600">
              / monthly
            </span>
          </div>
        </div>
      </div>

      {/* Availability indicator */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
            Not Available
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileRoomCard 