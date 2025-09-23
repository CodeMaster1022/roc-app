import { useState } from "react"
import { ArrowLeft, Heart, Share2, MapPin, Home, Users, PawPrint, Bed, Bath, Car, Calendar, Cigarette, PartyPopper, Clock, Expand } from "lucide-react"
import { RocButton } from "@/components/ui/roc-button"
import { Badge } from "@/components/ui/badge"
import { type Property } from "@/data/mockProperties"
import { useLanguage } from "@/contexts/LanguageContext"
import MobilePropertyMap from "./MobilePropertyMap"

interface MobilePropertyDetailsProps {
  property: Property
  isFavorite: boolean
  onBack: () => void
  onFavoriteToggle: () => void
  onShare: () => void
  onApply: () => void
}

const MobilePropertyDetails = ({
  property,
  isFavorite,
  onBack,
  onFavoriteToggle,
  onShare,
  onApply
}: MobilePropertyDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useLanguage()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const previousImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  // Sample amenities with icons
  const amenities = [
    { icon: "🏊‍♂️", name: "Swimming Pool" },
    { icon: "🎬", name: "Cinema Room" },
    { icon: "🏠", name: "Rooftop" },
    { icon: "🐾", name: "Pet-Friendly" },
    { icon: "🛡️", name: "24/7 Security" },
    { icon: "🛗", name: "Elevator" },
    { icon: "🏋️‍♂️", name: "Fitness Center" },
    { icon: "🎉", name: "Party Room" },
    { icon: "🌿", name: "Garden" }
  ]

  return (
    <div className="min-h-screen bg-white max-w-full overflow-x-hidden">
      {/* Hero Image Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img
          src={property.images?.[currentImageIndex] || property.image}
          alt={property.title}
          className="w-full h-full object-cover object-center"
        />
        
        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onFavoriteToggle}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </button>
              <button
                onClick={onShare}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Image Navigation */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1}/{property.images.length}
            </div>
          </>
        )}
      </div>

      {/* Content Section - Overlapping the image with rounded top corners */}
      <div className="relative -mt-8 bg-white rounded-t-3xl px-4 py-6 space-y-6 max-w-full z-10">
        {/* Property Info */}
        <div className="w-full">
          <h1 className="text-[20px] font-bold text-gray-900 mb-2 break-words">{property.title}</h1>
          <div className="flex items-center gap-1 text-gray-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{property.zone}</span>
          </div>
          
          {/* Key Details */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 flex-wrap">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-gray-900 font-medium">Private</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{property.area} m²</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <PawPrint className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Pets</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-[18px] font-bold text-gray-900">
              {formatPrice(property.price)}
            </span>
            <span className="text-gray-600 ml-2">/ mes</span>
          </div>
        {/* Description */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
          <p className="text-gray-600 leading-relaxed mb-2 break-words">
            {property.description}
          </p>
          {/* <button className="text-blue-600 font-medium text-sm">... Leer más</button> */}
        </div>
          {/* Unfurnished Badge */}
          <div className="mb-6">
            <Badge className="bg-[#10116B] text-white px-4 py-2">
              📦 Unfurnished
            </Badge>
          </div>
        </div>



        {/* Amenities */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-2">
              {amenities.slice(0, 6).map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#E3E3E7] justify-center px-2 py-1 rounded-2xl min-w-0">
                  <div className="flex items-center gap-2 rounded-2xl px-2 py-1">
                  <div className="text-[13px] flex-shrink-0">{amenity.icon}</div>
                  <span className="text-[13px] text-gray-700 font-medium break-words leading-tight">
                    {amenity.name}
                  </span>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Space Rules */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reglas del espacio</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Pets */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <PawPrint className="h-4 w-4 text-gray-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Mascotas</div>
              </div>
              <div className="text-xs text-gray-600 mb-3 break-words">Se acepta una mascota pequeña por usuario</div>
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4 text-gray-600" />
                <div className="text-gray-600 font-bold text-sm">1</div>
              </div>
            </div>

            {/* Parking */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Car className="h-4 w-4 text-gray-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Estacionamiento</div>
              </div>
              <div className="text-xs text-gray-600 mb-3 break-words">Existen espacios disponibles para esta unidad</div>
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4 text-gray-600" />
                <div className="text-gray-600 font-bold text-sm">2</div>
              </div>
            </div>

            {/* Meetings */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Reuniones</div>
              </div>
              <div className="text-xs text-gray-600 mb-3 break-words">Reuniones los fines de semana hasta:</div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-600" />
                <div className="text-gray-900 font-bold text-sm">1 am</div>
              </div>
            </div>

            {/* Environment */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cigarette className="h-4 w-4 text-red-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Ambiente</div>
              </div>
              <div className="text-xs text-gray-600 mb-3 break-words">Libre de humo dentro del departamento</div>
              <div className="flex items-center gap-1">
                <Cigarette className="h-4 w-4 text-red-600" />
                <div className="text-red-600 font-bold text-xs">🚫 No se permite</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Every location tells a story,</h2>
          <p className="text-purple-600 font-medium mb-4">yours starts here.</p>
          
          {/* Real Mapbox Map */}
          <div className="mb-4">
            <MobilePropertyMap 
              property={property}
              onExpand={() => {
                // TODO: Open fullscreen map modal
                console.log('Open fullscreen map')
              }}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-bold text-gray-900">
              {formatPrice(property.price)} / mes
            </div>
            {/* <div className="text-sm text-gray-600">/ mes</div> */}
          </div>
          <RocButton
            onClick={onApply}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            disabled={!property.isAvailable}
          >
            {property.isAvailable ? 'Apply for rent' : 'Not Available'}
          </RocButton>
        </div>
      </div>

      {/* Bottom padding to account for fixed bottom section */}
      <div className="h-20"></div>
    </div>
  )
}

export default MobilePropertyDetails 