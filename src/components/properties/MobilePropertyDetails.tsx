import { useState } from "react"
import { ArrowLeft, Heart, Share2, MapPin, Home, Users, PawPrint, Bed, Bath, Car, Calendar, Cigarette, PartyPopper, Clock, Expand, DollarSign, CheckCircle, XCircle, Shield, UserCheck, FileText } from "lucide-react"
import { RocButton } from "@/components/ui/roc-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type Property } from "@/data/mockProperties"
import { useLanguage } from "@/contexts/LanguageContext"
import MobilePropertyMap from "./MobilePropertyMap"

interface MobilePropertyDetailsProps {
  property: Property
  backendProperty?: any
  isFavorite: boolean
  onBack: () => void
  onFavoriteToggle: () => void
  onShare: () => void
  onApply: () => void
}

const MobilePropertyDetails = ({
  property,
  backendProperty,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFurnishingText = (furnishing: string) => {
    switch(furnishing) {
      case "furnished": return t('details.amueblado')
      case "semi-furnished": return t('details.semi_amueblado')
      case "unfurnished": return t('details.sin_amueblar')
      default: return furnishing
    }
  }

  const getGenderText = (gender: string) => {
    switch(gender) {
      case "male": return t('details.hombre')
      case "female": return t('details.mujer')
      case "other": return t('details.otro')
      default: return gender
    }
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
        
        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge variant={property.isAvailable ? "default" : "secondary"} className="bg-white/90 text-gray-900">
            {property.isAvailable ? t('details.disponible') : t('details.no_disponible')}
          </Badge>
        </div>
      </div>

      {/* Content Section - Overlapping the image with rounded top corners */}
      <div className="relative -mt-8 bg-white rounded-t-3xl px-4 py-6 space-y-6 max-w-full z-10">
        {/* Property Info */}
        <div className="w-full">
          <h1 className="text-[20px] font-bold text-gray-900 mb-2 break-words">{property.title}</h1>
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{backendProperty?.location?.address || property.zone}</span>
          </div>
          {backendProperty?.location?.zone && (
            <div className="text-xs text-gray-500 mb-4">
              Zona: {backendProperty.location.zone}
            </div>
          )}
          
          {/* Key Details Grid - Dynamic columns based on non-zero values */}
          <div className="gap-2 mb-4 p-1 flex flex-row flex-wrap">
            <div className="flex">
              <span className="text-md font-bold text-primary">
                {formatPrice(property.price)}
              </span>
              <span className="text-gray-600">{t('mobile.per_month')}</span>
            </div>
            
            {(backendProperty?.bedrooms || property.bedrooms) > 0 && (
              <div className="text-center flex items-center gap-1">
                <Bed className="h-4 w-4 mb-1 text-primary" />
                <div className="text-sm">{backendProperty?.bedrooms || property.bedrooms}</div>
                <div className="text-[10px] text-gray-500">{t('mobile.rooms')}</div>
              </div>
            )}
            {property.area > 0 && (
              <div className="text-center flex items-center gap-1">
                <Home className="h-4 w-4 mb-1 text-primary" />
                <div className="text-sm">{property.area}</div>
                <div className="text-[10px] text-gray-500">m²</div>
              </div>
            )}
            <div className="text-center flex items-center gap-1">
              <PawPrint className="h-4 w-4 mb-1 text-primary" />
              <div className="text-sm">{property.rules.pets ? t('details.allowed') : t('details.not_allowed')}</div>
              {/* <div className="text-[10px] text-gray-500">{t('mobile.pets')}</div> */}
            </div>
            {(backendProperty?.roommates?.length || 0) > 0 && (
              <div className="text-center flex items-center gap-1">
                <Users className="h-5 w-5 mb-1 text-primary" />
                <div className="text-sm font-bold">{backendProperty?.roommates?.length || 0}</div>
                <div className="text-[10px] text-gray-500">{t('mobile.roomies')}</div>
              </div>
            )}
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
              <Shield className="h-3 w-3" />
              <span>{t('details.security_deposit_required')}</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
              <UserCheck className="h-3 w-3" />
              <span>{t('details.identity_verification_required')}</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
              <FileText className="h-3 w-3" />
              <span>{t('details.lease_agreement_required')}</span>
            </div>
          </div>

        </div>

        {/* Description */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.description')}</h2>
          <p className="text-gray-600 leading-relaxed break-words">
            {property.description}
          </p>
        </div>

        {/* Furnishing */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.furnished')}</h2>
          <Badge className="bg-primary text-white px-4 py-2">
            {getFurnishingText(property.furnishing)}
          </Badge>
        </div>

        {/* Individual Rooms */}
        {backendProperty?.rooms && backendProperty.rooms.length > 0 && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.rooms_available')}</h2>
            <div className="space-y-3">
              {backendProperty.rooms.map((room: any, index: number) => (
                <Card key={room.id || index} className="overflow-hidden">
                  <div className="flex">
                    {/* Image on the left */}
                    {room.photos && room.photos.length > 0 && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img
                          src={room.photos[0]}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Content on the right */}
                    <CardContent className="p-3 flex-1">
                      <h3 className="font-semibold mb-2">{room.name}</h3>
                      {room.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{room.description}</p>
                      )}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('mobile.price')}</span>
                          <span className="font-bold text-primary">{formatPrice(room.price)}{t('mobile.per_month')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('mobile.furnished_label')}</span>
                          <span className="text-xs">{getFurnishingText(room.furniture || room.furnishing)}</span>
                        </div>
                        {(room.beds || 1) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('mobile.beds')}</span>
                            <span className="text-xs">{room.beds || 1} {t('details.bed')}</span>
                          </div>
                        )}
                        {room.requiresDeposit && (room.depositAmount || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('mobile.deposit')}</span>
                            <span className="text-xs">{formatPrice(room.depositAmount || 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('mobile.available_from')}</span>
                          <span className="text-xs">{formatDate(room.availableFrom)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Roommates with Personality Tags - Only show if there are roommates */}
        {backendProperty?.roommates && backendProperty.roommates.length > 0 && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.personality_title')}</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {backendProperty.roommates.slice(0, 3).map((roommate: any, index: number) => (
                    <div 
                      key={roommate.id || index}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                    >
                      {roommate.gender === 'male' ? '👨' : roommate.gender === 'female' ? '👩' : '👤'}
                    </div>
                  ))}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {backendProperty.roommates.length} {t('mobile.roommates_out_of')} {backendProperty?.bedrooms || 5}
                </div>
              </div>
              
              {/* Personality Tags */}
              <div className="flex flex-wrap gap-2">
                {backendProperty.roommates.map((roommate: any) => 
                  roommate.personality?.split(',').map((trait: string, idx: number) => (
                    <Badge key={`${roommate.id}-${idx}`} variant="secondary" className="text-xs px-2 py-1">
                      {trait.trim()}
                    </Badge>
                  ))
                )}
                {/* Add some default personality traits if none exist */}
                {(!backendProperty.roommates.some((r: any) => r.personality)) && (
                  <>
                    <Badge variant="secondary" className="text-xs px-2 py-1">{t('details.calmado')}</Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1">{t('details.pet_friendly')}</Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary text-primary-foreground">{t('details.creativo')}</Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1">{t('details.fiesteros')}</Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary text-primary-foreground">{t('details.nocturno')}</Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1">{t('details.deportistas')}</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Amenities - Show ALL */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.amenities')}</h2>
          {backendProperty?.amenities && backendProperty.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {backendProperty.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">{t('mobile.no_amenities')}</div>
          )}
        </div>

        {/* Rules - Dynamic Card Grid */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.house_rules')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Pets Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${backendProperty?.rules?.pets ? 'bg-green-100' : 'bg-red-100'}`}>
                  <PawPrint className={`h-3 w-3 ${backendProperty?.rules?.pets ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="font-semibold text-sm">{t('details.pets')}</div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {backendProperty?.rules?.pets 
                  ? (backendProperty.rules.petPolicy || t('mobile.pets_allowed')) 
                  : t('mobile.not_allowed')}
              </p>
              <div className="flex items-center gap-1">
                {backendProperty?.rules?.pets ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium">
                      {t('mobile.max')} {backendProperty.rules.maxPetsPerUser || 1}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs font-medium text-red-600">{t('mobile.not_allowed')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Parking Card - Only show if parking > 0 */}
            {backendProperty?.parking > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-full ${backendProperty?.parking > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Car className={`h-3 w-3 ${backendProperty?.parking > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="font-semibold text-sm">{t('details.parking')}</div>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {backendProperty?.parking > 0 
                    ? (backendProperty.parkingDescription || t('mobile.available_spaces')) 
                    : t('mobile.no_spaces')}
                </p>
                <div className="flex items-center gap-1">
                  <Car className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium">{backendProperty?.parking || 0} {t('mobile.spaces')}</span>
                </div>
              </div>
            )}

            {/* Events Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${backendProperty?.rules?.meetings?.allowed ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <Clock className={`h-3 w-3 ${backendProperty?.rules?.meetings?.allowed ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <div className="font-semibold text-sm">{t('mobile.events')}</div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {backendProperty?.rules?.meetings?.allowed 
                  ? (backendProperty.rules.meetings.description || t('mobile.events_allowed')) 
                  : t('mobile.not_allowed')}
              </p>
              <div className="flex items-center gap-1">
                {backendProperty?.rules?.meetings?.allowed ? (
                  <>
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium">
                      {t('mobile.until')} {backendProperty.rules.meetings.endTimeLimit || "10:00 PM"}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs font-medium text-red-600">{t('mobile.not_allowed')}</span>
                  </>
                )}
              </div>
              {backendProperty?.rules?.meetings?.allowed && backendProperty.rules.meetings.maxGuests && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{t('mobile.max_guests')} {backendProperty.rules.meetings.maxGuests} {t('mobile.guests')}</span>
                </div>
              )}
            </div>

            {/* Environment (Smoking) Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${backendProperty?.rules?.smoking ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <Cigarette className={`h-3 w-3 ${backendProperty?.rules?.smoking ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
                <div className="font-semibold text-sm">{t('details.smoking')}</div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {backendProperty?.rules?.smoking 
                  ? (backendProperty.rules.smokingDetails || 
                     (backendProperty.rules.smokingPolicy === 'not-allowed-inside' ? t('mobile.not_allowed_inside') :
                      backendProperty.rules.smokingPolicy === 'designated-areas' ? t('mobile.designated_areas_only') :
                      backendProperty.rules.smokingPolicy === 'allowed-everywhere' ? t('mobile.allowed_everywhere') : t('mobile.smoking_allowed')))
                  : t('mobile.smoke_free')}
              </p>
              <div className="flex items-center gap-1">
                {backendProperty?.rules?.smoking ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium">
                      {backendProperty.rules.smokingPolicy === 'not-allowed-inside' ? t('mobile.outside_only') :
                       backendProperty.rules.smokingPolicy === 'designated-areas' ? t('mobile.designated_areas') :
                       backendProperty.rules.smokingPolicy === 'allowed-everywhere' ? t('mobile.everywhere') : t('details.allowed')}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs font-medium text-red-600">🚫 {t('mobile.not_allowed')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contract & Deposit Info */}
        {backendProperty?.contracts && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900">{t('mobile.contract_info')}</h2>
            <div className="space-y-3">
              {backendProperty.contracts.requiresDeposit && backendProperty.contracts.depositAmount && backendProperty.contracts.depositAmount > 0 && (
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('mobile.deposit_required_title')}</span>
                  </div>
                  <div className="text-md font-bold text-primary">
                    {formatPrice(backendProperty.contracts.depositAmount)}
                  </div>
                </div>
              )}
              {backendProperty.contracts.standardOptions && backendProperty.contracts.standardOptions.length > 0 && (
                <div className="rounded-lg px-4">
                  <div className="font-medium mb-2">{t('mobile.contract_options')}</div>
                  <ul className="flex flex-row flex-wrap space-x-3">
                    {backendProperty.contracts.standardOptions.map((option: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 bg-gray-100 rounded-md px-2 py-1">{option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('mobile.availability')}</h2>
          <div className="flex items-center gap-2 rounded-lg p-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-600">{t('details.available_from_date')}</div>
              <div className="font-semibold">{formatDate(property.availableFrom)}</div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t('mobile.location')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('mobile.find_new_home')}</p>
          
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

          {/* Address Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t('mobile.address')}</h3>
                {backendProperty?.location?.address ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      {backendProperty.location.address}
                    </p>
                    {backendProperty.location.zone && (
                      <p className="text-sm text-gray-600">
                        {backendProperty.location.zone}, Ciudad de México, México
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    {property.zone}, Ciudad de México, México
                  </p>
                )}
                {backendProperty?.location?.lat && backendProperty?.location?.lng && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t('mobile.coordinates')} {backendProperty.location.lat.toFixed(4)}, {backendProperty.location.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(property.price)}
            </div>
            <div className="text-xs text-gray-600">{t('mobile.per_month_bottom')}</div>
          </div>
          <RocButton
            onClick={onApply}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
            disabled={!property.isAvailable}
          >
            {property.isAvailable ? t('mobile.apply_to_rent') : t('mobile.not_available')}
          </RocButton>
        </div>
      </div>

      {/* Bottom padding to account for fixed bottom section */}
      <div className="h-24"></div>
    </div>
  )
}

export default MobilePropertyDetails 