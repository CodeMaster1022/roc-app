import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, Share2, MapPin, Home, Users, PawPrint, Bed, Bath, Wifi, Car, Utensils, Waves, Shield, Calendar, CheckCircle, XCircle, Cigarette, PartyPopper, FileText, CreditCard, UserCheck, ChevronLeft, ChevronRight, Expand, X, Clock, DollarSign } from "lucide-react"
import { RocButton } from "@/components/ui/roc-button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader as CardHeaderComponent, CardTitle as CardTitleComponent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type Property } from "@/data/mockProperties"
import { useIsMobile } from "@/hooks/use-mobile"
import { RentalApplicationFlow } from "@/components/forms/RentalApplicationFlow"
import { propertyService } from "@/services/propertyService"
import { favoriteService } from "@/services/favoriteService"
import { applicationService } from "@/services/applicationService"
import { transformBackendPropertyToFrontend } from "@/utils/propertyTransform"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import MobilePropertyDetails from "@/components/properties/MobilePropertyDetails"
import AuthPromptModal from "@/components/modals/AuthPromptModal"
import MobilePropertyMap from "@/components/properties/MobilePropertyMap"

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isApplicationFlowOpen, setIsApplicationFlowOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showFavoriteAuthPrompt, setShowFavoriteAuthPrompt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendProperty, setBackendProperty] = useState<any>(null)
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [savedProgressStep, setSavedProgressStep] = useState(1)

  // Check for saved application progress
  const checkSavedProgress = async (propertyId: string) => {
    if (!isAuthenticated) return

    try {
      const response = await applicationService.getApplicationProgress(propertyId)
      setHasSavedProgress(true)
      setSavedProgressStep(response.data.draft.currentStep)
    } catch (error) {
      // No saved progress found - this is normal
      setHasSavedProgress(false)
      setSavedProgressStep(1)
    }
  }


  // Load property data and favorite status
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError('No property ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Load property details
        console.log('Loading property with ID:', id)
        const response = await propertyService.getProperty(id)
        console.log('Property API response:', response)
        const backendProp = response.data.property
        console.log('Backend property:', backendProp)
        
        // Store the full backend property for additional details
        setBackendProperty(backendProp)
        
        const transformedProperty = transformBackendPropertyToFrontend(backendProp)
        console.log('Transformed property:', transformedProperty)
        
        // Create property with multiple images for gallery and preserve contracts field
        const propertyWithImages = {
          ...transformedProperty,
          contracts: backendProp.contracts, // Preserve contracts field for RentalApplicationFlow
          images: backendProp.images && backendProp.images.length > 0 
            ? backendProp.images 
            : [transformedProperty.image] // Fallback to single image
        }
        
        setProperty(propertyWithImages)

        // Load favorite status
        try {
          const isFav = await favoriteService.isFavorite(id)
          setIsFavorite(isFav)
        } catch (favError) {
          console.warn('Failed to load favorite status:', favError)
        }

        // Check for saved application progress
        await checkSavedProgress(id)

      } catch (err) {
        console.error('Failed to load property:', err)
        setError('Failed to load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">{t('details.loading_property')}</h2>
          <p className="text-muted-foreground">{t('details.please_wait')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">{t('details.error_load')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <RocButton onClick={() => window.location.reload()}>
              {t('details.try_again')}
            </RocButton>
            <RocButton variant="outline" onClick={() => navigate("/")}>
              {t('details.back_home')}
            </RocButton>
          </div>
        </div>
      </div>
    )
  }

  // Property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-4">{t('details.property_not_found')}</h2>
          <p className="text-muted-foreground mb-6">{t('details.property_deleted')}</p>
          <RocButton onClick={() => navigate("/")}>
            {t('details.back_home')}
          </RocButton>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getSchemeText = (scheme?: string) => {
    switch(scheme) {
      case "mixto": return t('details.mixto')
      case "hombres": return t('details.solo_hombres')
      case "mujeres": return t('details.solo_mujeres')
      default: return ""
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleFavoriteToggle = async () => {
    if (!id) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowFavoriteAuthPrompt(true)
      return
    }

    const wasAdding = !isFavorite

    try {
      const success = await favoriteService.toggleFavorite(id)
      if (success) {
        setIsFavorite(!isFavorite)
        
        // Show success toast
        toast({
          title: wasAdding ? t('favorites.added_title') : t('favorites.removed_title'),
          description: wasAdding ? t('favorites.added_description') : t('favorites.removed_description'),
        })
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      
      // Show error toast
      toast({
        title: t('favorites.error_title'),
        description: t('favorites.error_description'),
        variant: "destructive"
      })
    }
  }

  const handleFavoriteAuthLogin = () => {
    setShowFavoriteAuthPrompt(false)
            navigate('/signin')
  }

  const handleFavoriteAuthClose = () => {
    setShowFavoriteAuthPrompt(false)
  }

  const handleShare = async () => {
    if (!property) return

    const shareData = {
      title: property.title,
      text: `${property.title} - ${formatPrice(property.price)}/mes`,
      url: window.location.href
    }

    try {
      // Check if Web Share API is supported and prefer it on mobile
      if (navigator.share && isMobile) {
        await navigator.share(shareData)
        toast({
          title: t('details.share_title'),
          description: t('details.share_description'),
        })
      } else {
        // On desktop, show share modal with more options
        if (!isMobile) {
          setIsShareModalOpen(true)
        } else {
          // Mobile fallback to clipboard
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: t('details.link_copied_title'),
            description: t('details.link_copied_description'),
          })
        }
      }
    } catch (error) {
      console.error('Share failed:', error)
      
      // Final fallback - try to copy to clipboard manually
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: t('details.link_copied_title'),
          description: t('details.link_copied_description'),
        })
      } catch (clipboardError) {
        // Last resort - show the URL in a toast
        toast({
          title: t('details.share_property'),
          description: `${t('details.copy_link')} ${window.location.href}`,
          duration: 8000,
        })
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: t('details.link_copied_title'),
        description: t('details.link_copied_description'),
      })
      setIsShareModalOpen(false)
    } catch (error) {
      console.error('Copy failed:', error)
      toast({
        title: t('details.error_title'),
        description: t('details.link_error'),
        variant: "destructive"
      })
    }
  }

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`${property?.title} - ${formatPrice(property?.price || 0)}/mes`)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    setIsShareModalOpen(false)
    
    toast({
      title: t('details.share_title'),
      description: `${t('details.shared_on_platform')} ${platform}.`,
    })
  }

  // Mobile version
  if (isMobile) {
    return (
      <>
        <MobilePropertyDetails
          property={property}
          backendProperty={backendProperty}
          isFavorite={isFavorite}
          onBack={() => navigate("/")}
          onFavoriteToggle={handleFavoriteToggle}
          onShare={handleShare}
          onApply={() => setIsApplicationFlowOpen(true)}
        />
        
        {/* Rental Application Flow */}
        {property && (
          <RentalApplicationFlow
            isOpen={isApplicationFlowOpen}
            onClose={() => setIsApplicationFlowOpen(false)}
            property={property}
          />
        )}
      </>
    )
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <RocButton
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {isMobile ? "" : t('details.back_button')}
            </RocButton>
            
            <div className="flex items-center gap-2">
              <RocButton
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </RocButton>
              <RocButton 
                variant="ghost" 
                size="icon"
                onClick={handleShare}
                title={t('details.share_property')}
              >
                <Share2 className="h-5 w-5" />
              </RocButton>
            </div>
          </div>
        </div>
      </header>

      {/* Full Width Image Gallery */}
      <div className="w-full flex justify-center">
        <div className="relative overflow-hidden group max-w-6xl w-full rounded-lg">
          <img
            src={property.images?.[currentImageIndex] || property.image}
            alt={property.title}
            className="w-full h-64 md:h-96 lg:h-[500px] object-cover cursor-pointer"
            onClick={() => setIsGalleryOpen(true)}
          />
        
        {/* Navigation arrows */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="absolute bottom-4 left-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <Expand className="h-4 w-4" />
        </button>

          <div className="absolute top-4 left-4">
            <Badge variant={property.isAvailable ? "default" : "secondary"}>
              {property.isAvailable ? t('details.disponible') : t('details.no_disponible')}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {property.type === "propiedad" ? t('details.property_complete') : t('details.habitacion')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">

            {/* Property Title and Location */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{backendProperty?.location?.address || property.zone}</span>
              </div>
            </div>
            {/* Description */}
            <div className="space-y-4 bg-white rounded-lg p-4">
              <h2 className="text-xl text-gray-900">{t('details.description')}</h2>
              <p className="text-gray-600 text-md">{property.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm text-white px-3 py-1 bg-[#10116B]">
                  {getFurnishingText(property.furnishing)}
                </Badge>
                {backendProperty?.location?.zone && (
                  <Badge variant="outline" className="text-sm px-3 py-1 text-white bg-[#10116B]">
                    {backendProperty.location.zone}
                  </Badge>
                )}
              </div>
            </div>




            {/* Roommates Section with Personality Tags */}
            {backendProperty?.roommates && backendProperty.roommates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('details.personality_title')}</h2>
                <div className="p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-2">
                      {backendProperty.roommates.slice(0, 3).map((roommate: any, index: number) => (
                        <div 
                          key={roommate.id || index}
                          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold border-2 border-background"
                        >
                          {roommate.gender === 'male' ? '👨' : roommate.gender === 'female' ? '👩' : '👤'}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-medium">
                      {backendProperty.roommates.length} roommate{backendProperty.roommates.length !== 1 ? 's' : ''} out of {backendProperty?.bedrooms || 5}
                    </div>
                  </div>
                  
                  {/* Personality Tags */}
                  <div className="flex flex-wrap gap-2">
                    {backendProperty.roommates.map((roommate: any) => 
                      roommate.personality?.split(',').map((trait: string, idx: number) => (
                        <Badge key={`${roommate.id}-${idx}`} variant="secondary" className="px-3 py-1">
                          {trait.trim()}
                        </Badge>
                      ))
                    )}
                    {/* Add some default personality traits if none exist */}
                    {(!backendProperty.roommates.some((r: any) => r.personality)) && (
                      <>
                        <Badge variant="secondary" className="px-3 py-1">{t('details.calmado')}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{t('details.pet_friendly')}</Badge>
                        <Badge variant="secondary" className="px-3 py-1 bg-primary text-primary-foreground">{t('details.creativo')}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{t('details.fiesteros')}</Badge>
                        <Badge variant="secondary" className="px-3 py-1 bg-primary text-primary-foreground">{t('details.nocturno')}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{t('details.deportistas')}</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            


            {/* Amenities */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{t('details.amenities_title')}</h2>
              {backendProperty?.amenities && backendProperty.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {backendProperty.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <div className="text-sm font-medium">{amenity}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">{t('details.no_amenities')}</div>
              )}
            </div>

            {/* Rules - 4 Card Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('details.house_rules')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pets Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.rules?.pets ? 'bg-green-100' : 'bg-red-100'}`}>
                        <PawPrint className={`h-5 w-5 ${backendProperty?.rules?.pets ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <h3 className="font-semibold">{t('details.pets')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.rules?.pets 
                        ? (backendProperty.rules.petPolicy || t('details.pets_allowed')) 
                        : t('details.not_allowed')}
                    </p>
                    <div className="flex items-center gap-2">
                      {backendProperty?.rules?.pets ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {t('details.max_pets')} {backendProperty.rules.maxPetsPerUser || 1} {t('details.pets_allowed')}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">{t('details.not_allowed')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Smoking Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.rules?.smoking ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <Cigarette className={`h-5 w-5 ${backendProperty?.rules?.smoking ? 'text-yellow-600' : 'text-green-600'}`} />
                      </div>
                      <h3 className="font-semibold">{t('details.smoking')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.rules?.smoking 
                        ? (backendProperty.rules.smokingDetails || 
                           (backendProperty.rules.smokingPolicy === 'not-allowed-inside' ? t('details.outside_only') :
                            backendProperty.rules.smokingPolicy === 'designated-areas' ? t('details.designated_areas') :
                            backendProperty.rules.smokingPolicy === 'allowed-everywhere' ? t('details.everywhere') : t('details.allowed')))
                        : t('details.not_allowed')}
                    </p>
                    <div className="flex items-center gap-2">
                      {backendProperty?.rules?.smoking ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">
                            {backendProperty.rules.smokingPolicy === 'not-allowed-inside' ? t('details.outside_only') :
                             backendProperty.rules.smokingPolicy === 'designated-areas' ? t('details.designated_areas') :
                             backendProperty.rules.smokingPolicy === 'allowed-everywhere' ? t('details.everywhere') : t('details.allowed')}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">🚫 {t('details.not_allowed')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Events & Meetings Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.rules?.meetings?.allowed ? 'bg-blue-100' : 'bg-red-100'}`}>
                        <Clock className={`h-5 w-5 ${backendProperty?.rules?.meetings?.allowed ? 'text-blue-600' : 'text-red-600'}`} />
                      </div>
                      <h3 className="font-semibold">{t('details.events_meetings')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.rules?.meetings?.allowed 
                        ? (backendProperty.rules.meetings.description || t('details.allowed')) 
                        : t('details.not_allowed')}
                    </p>
                    <div className="flex items-center gap-2">
                      {backendProperty?.rules?.meetings?.allowed ? (
                        <>
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            {t('details.until')} {backendProperty.rules.meetings.endTimeLimit || "10:00 PM"}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">{t('details.not_allowed')}</span>
                        </>
                      )}
                    </div>
                    {backendProperty?.rules?.meetings?.allowed && (
                      <div className="space-y-2">
                        {backendProperty.rules.meetings.allowedDays && backendProperty.rules.meetings.allowedDays.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {backendProperty.rules.meetings.allowedDays.join(', ')}
                            </span>
                          </div>
                        )}
                        {backendProperty.rules.meetings.maxGuests && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t('details.max_guests')} {backendProperty.rules.meetings.maxGuests} {t('details.guests')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Parking Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.parking > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Car className={`h-5 w-5 ${backendProperty?.parking > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="font-semibold">{t('details.parking')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.parking > 0 
                        ? (backendProperty.parkingDescription || t('details.allowed')) 
                        : t('details.no_spaces')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {backendProperty?.parking > 0 ? `${backendProperty.parking} ${backendProperty.parking > 1 ? t('details.spaces') : t('details.space')}` : `0 ${t('details.spaces')}`}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Location Map */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('details.location_title')}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t('details.find_new_home')} {backendProperty?.location?.zone || property.zone}
              </p>
              <div className="rounded-lg overflow-hidden h-96">
                <MobilePropertyMap property={property} />
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{t('details.address_title')}</h3>
                    {backendProperty?.location?.address ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">
                          {backendProperty.location.address}
                        </p>
                        {backendProperty.location.zone && (
                          <p className="text-sm text-muted-foreground">
                            {backendProperty.location.zone}, Ciudad de México, México
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {property.zone}, Ciudad de México, México
                      </p>
                    )}
                    {backendProperty?.location?.lat && backendProperty?.location?.lng && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('details.coordinates')} {backendProperty.location.lat.toFixed(4)}, {backendProperty.location.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Individual Rooms */}
          <div className="space-y-4">
            {/* Rooms Available Badge */}
            {backendProperty?.rooms && backendProperty.rooms.length > 0 && (
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {backendProperty.rooms.length} {t('details.rooms_available')} {t('details.out_of')} {backendProperty?.bedrooms || backendProperty.rooms.length}
                  </span>
                </div>

                {/* Individual Room Cards */}
                <div className="space-y-4">
                  {backendProperty.rooms.map((room: any, index: number) => (
                    <Card key={room.id || index} className="overflow-hidden">
                      {room.photos && room.photos.length > 0 && (
                        <div className="relative h-32">
                          <img
                            src={room.photos[0]}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          <button 
                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"
                            onClick={handleFavoriteToggle}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      )}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Bed className="h-4 w-4" />
                            <span>{room.beds || 1} {t('details.bed')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{formatPrice(room.price)}</span>
                          <span className="text-sm text-muted-foreground">{t('details.monthly')}</span>
                        </div>

                        <RocButton 
                          className="w-full"
                          onClick={() => setIsApplicationFlowOpen(true)}
                          disabled={!property?.isAvailable}
                        >
                          {property?.isAvailable 
                            ? (hasSavedProgress 
                                ? `Continue Application (Step ${savedProgressStep})` 
                                : t('details.apply_to_rent_button')
                              ) 
                            : t('details.not_available')
                          }
                        </RocButton>

                        <div className="text-xs text-muted-foreground">
                          {t('details.available_from_date')} <span className="font-medium">{formatDate(room.availableFrom)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* If no individual rooms, show property-level info */}
            {(!backendProperty?.rooms || backendProperty.rooms.length === 0) && (
              <div className="sticky top-24 space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md">{t('details.available_from')}</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{formatDate(property.availableFrom)}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="grid grid-cols-2">
                    {(backendProperty?.bedrooms || property.bedrooms) > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="shadow-sm">
                          <Bed className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{backendProperty?.bedrooms || property.bedrooms}</div>
                          <div className="text-sm text-muted-foreground">{t('details.bedrooms')}</div>
                        </div>
                      </div>
                    )}  
                    <div className="flex items-center gap-3">
                      <div className="shadow-sm">
                        <Home className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex">
                        <div className="text-sm font-bold">{property.area}</div>
                        <div className="text-sm text-muted-foreground ml-1">m²</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="shadow-sm">
                        <PawPrint className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{property.rules.pets ? t('details.allowed') : t('details.not_allowed')}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="shadow-sm">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                          <div className="text-sm font-bold">{backendProperty?.roommates?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="rounded-lg pl-8">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>{t('details.security_deposit_required')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span>{t('details.lease_agreement_required')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>{t('details.identity_verification_required')}</span>
                    </div>
                  </div>
                  <div className="px-6 py-2">
                      <div className="text-center space-y-0 flex">
                        <div className="text-xl font-bold">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-lg font-bold ml-2">/ {t('details.monthly')}</div>
                      </div>
                    </div>
                    {backendProperty?.contracts?.requiresDeposit && backendProperty?.contracts?.depositAmount && (
                      <div className="flex items-center justify-between py-2 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{t('details.security_deposit_lower')}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(backendProperty.contracts.depositAmount)}
                        </div>
                      </div>
                    )}
                    {backendProperty?.contracts?.standardOptions && backendProperty.contracts.standardOptions.length > 0 && (
                      <div className="px-6 py-2">
                        <div className="text-sm font-medium mb-2">{t('details.contract_options')}</div>
                        <ul className="flex space-x-3">
                          {backendProperty.contracts.standardOptions.map((option: string, index: number) => (
                            <li key={index} className="text-xs text-muted-foreground bg-gray-100 round-lg px-2">{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-4">
                      <RocButton 
                        className="w-full text-base py-3 font-semibold"
                        onClick={() => setIsApplicationFlowOpen(true)}
                        disabled={!property?.isAvailable}
                      >
                        {property?.isAvailable 
                          ? (hasSavedProgress 
                              ? `Continue Application (Step ${savedProgressStep})` 
                              : t('details.apply_to_rent')
                            ) 
                          : t('details.not_available')
                        }
                      </RocButton>
                      {hasSavedProgress && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          You have saved progress for this property
                        </p>
                      )}
                    </div>
                </div>

                {/* Property Features Card */}
                <Card>
                  <CardHeaderComponent>
                    <CardTitleComponent className="text-lg">{t('details.property_features')}</CardTitleComponent>
                  </CardHeaderComponent>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('details.property_type')}</span>
                      <span className="text-sm font-medium">
                        {property.type === "propiedad" ? t('details.entire_property') : t('details.room')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Furnishing</span>
                      <span className="text-sm font-medium">{getFurnishingText(property.furnishing)}</span>
                    </div>
                    {backendProperty?.location?.zone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Zone</span>
                        <span className="text-sm font-medium">{backendProperty.location.zone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            
            <img
              src={property?.images?.[currentImageIndex] || property?.image}
              alt={property?.title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {property?.images && property.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {t('details.share_property_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {t('details.share_with_contacts')}
            </div>
            
            {/* Social Media Options */}
            <div className="grid grid-cols-2 gap-3">
              <RocButton
                variant="outline"
                onClick={() => shareToSocial('whatsapp')}
                className="justify-start"
              >
                <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  W
                </div>
                WhatsApp
              </RocButton>
              
              <RocButton
                variant="outline"
                onClick={() => shareToSocial('telegram')}
                className="justify-start"
              >
                <div className="w-5 h-5 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  T
                </div>
                Telegram
              </RocButton>
              
              <RocButton
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="justify-start"
              >
                <div className="w-5 h-5 mr-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  f
                </div>
                Facebook
              </RocButton>
              
              <RocButton
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="justify-start"
              >
                <div className="w-5 h-5 mr-2 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                  X
                </div>
                Twitter
              </RocButton>
            </div>
            
            {/* Copy Link Option */}
            <Separator />
            <RocButton
              variant="outline"
              onClick={copyToClipboard}
              className="w-full justify-start"
            >
              <div className="w-5 h-5 mr-2 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                📋
              </div>
              {t('details.copy_link_button')}
            </RocButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rental Application Flow */}
      {property && (
        <RentalApplicationFlow
          isOpen={isApplicationFlowOpen}
          onClose={() => setIsApplicationFlowOpen(false)}
          property={property}
        />
      )}

      {/* Favorite Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showFavoriteAuthPrompt}
        onClose={handleFavoriteAuthClose}
        onLogin={handleFavoriteAuthLogin}
        title={t('details.save_to_favorites')}
        description={t('details.sign_in_to_save')}
        actionText={t('details.sign_in_to_save_action')}
      />
    </div>
  )
}

export default PropertyDetails;