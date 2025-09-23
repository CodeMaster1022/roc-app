import { Heart, Bed, Ruler, PawPrint } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface MobilePropertyCardProps {
  id: string
  title: string
  image: string
  price: number
  type: "propiedad" | "habitacion"
  propertyType: "departamento" | "casa"
  area: number
  bedrooms: number
  allowsPets: boolean
  location?: string
  isFavorite?: boolean
  isAvailable?: boolean
  onFavoriteToggle: (id: string) => void
  onViewDetails: (id: string) => void
}

const MobilePropertyCard = ({
  id,
  title,
  image,
  price,
  type,
  propertyType,
  area,
  bedrooms,
  allowsPets,
  location,
  isFavorite = false,
  isAvailable = true,
  onFavoriteToggle,
  onViewDetails
}: MobilePropertyCardProps) => {
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

  return (
    <div 
      className={`relative w-full h-64 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
        !isAvailable ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
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
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFavoriteToggle(id)
        }}
        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-all duration-200 z-10"
      >
        <Heart 
          className={`h-5 w-5 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-400'
          }`} 
        />
      </button>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        {/* Title and Location */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold leading-tight mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-white/80 text-base font-medium">
            {location || 'Mexico City'}
          </p>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
          {/* Bedrooms */}
          {type === "propiedad" && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
              <Bed className="h-4 w-4" />
              <span className="font-medium">
                {bedrooms} {bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
              </span>
            </div>
          )}

          {/* Area */}
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
            <Ruler className="h-4 w-4" />
            <span className="font-medium">{area}m²</span>
          </div>

          {/* Pet Friendly */}
          {allowsPets && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
              <PawPrint className="h-4 w-4" />
              <span className="font-medium">Pet</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {formatPrice(price)}
          </span>
          <span className="text-lg font-medium text-white/80">
            / monthly
          </span>
        </div>
      </div>

      {/* Availability indicator */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
            Not Available
          </div>
        </div>
      )}
    </div>
  )
}

export default MobilePropertyCard 