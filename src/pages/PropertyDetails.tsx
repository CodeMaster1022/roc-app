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

  // Amenities list with emojis
  const amenitiesList = [
    "🏋️‍♂️ Gym",
    "🧸 Ludoteca", 
    "🌇 Roof Garden",
    "🍷 Lounge",
    "🌿 Jardines",
    "🏊‍♂️ Alberca",
    "📊 Sala de juntas",
    "🧘‍♂️ Área de yoga",
    "🎉 Salón de fiestas",
    "☕ Cafetería",
    "💼 Coworking",
    "🎮 Salón de juegos",
    "🐾 Pet friendly",
    "🍸 Sky bar",
    "🧖 Sauna",
    "💆‍♂️ Spa",
    "🧺 Lavandería",
    "🎾 Cancha de pádel",
    "💇‍♀️ Salón de belleza",
    "🏀 Cancha de básquet",
    "⚽ Cancha de fútbol",
    "🎥 Cine privado",
    "⛳ Acceso directo al campo de golf",
    "🏃 Zona de jogging"
  ]

  // Get random selection of amenities (memoized to prevent regeneration on re-renders)
  const randomAmenities = useMemo(() => {
    if (!property?.amenities) return []
    const shuffled = [...amenitiesList].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(6, property.amenities.length))
  }, [property?.amenities?.length])

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
          <h2 className="text-xl font-semibold mb-2">Cargando propiedad...</h2>
          <p className="text-muted-foreground">Por favor espera un momento</p>
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
          <h2 className="text-2xl font-bold mb-4">Error al cargar la propiedad</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <RocButton onClick={() => window.location.reload()}>
              Intentar de nuevo
            </RocButton>
            <RocButton variant="outline" onClick={() => navigate("/")}>
              Volver al inicio
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
          <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
          <p className="text-muted-foreground mb-6">La propiedad que buscas no existe o ha sido eliminada</p>
          <RocButton onClick={() => navigate("/")}>
            Volver al inicio
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
      case "mixto": return "Mixto"
      case "hombres": return "Solo hombres"
      case "mujeres": return "Solo mujeres"
      default: return ""
    }
  }

  const getFurnishingText = (furnishing: string) => {
    switch(furnishing) {
      case "furnished": return "Amueblado"
      case "semi-furnished": return "Semi-amueblado"
      case "unfurnished": return "Sin amueblar"
      default: return furnishing
    }
  }
  
  const getGenderText = (gender: string) => {
    switch(gender) {
      case "male": return "Hombre"
      case "female": return "Mujer"
      case "other": return "Otro"
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
          title: "¡Compartido!",
          description: "La propiedad ha sido compartida exitosamente.",
        })
      } else {
        // On desktop, show share modal with more options
        if (!isMobile) {
          setIsShareModalOpen(true)
        } else {
          // Mobile fallback to clipboard
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: "¡Enlace copiado!",
            description: "El enlace de la propiedad ha sido copiado al portapapeles.",
          })
        }
      }
    } catch (error) {
      console.error('Share failed:', error)
      
      // Final fallback - try to copy to clipboard manually
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace de la propiedad ha sido copiado al portapapeles.",
        })
      } catch (clipboardError) {
        // Last resort - show the URL in a toast
        toast({
          title: "Compartir propiedad",
          description: `Copia este enlace: ${window.location.href}`,
          duration: 8000,
        })
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace de la propiedad ha sido copiado al portapapeles.",
      })
      setIsShareModalOpen(false)
    } catch (error) {
      console.error('Copy failed:', error)
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace. Inténtalo de nuevo.",
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
      title: "¡Compartido!",
      description: `Propiedad compartida en ${platform}.`,
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
    <div className="min-h-screen bg-background">
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
              {isMobile ? "" : "Volver"}
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
                title="Compartir propiedad"
              >
                <Share2 className="h-5 w-5" />
              </RocButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image Gallery */}
            <div className="relative rounded-lg overflow-hidden group">
              <img
                src={property.images?.[currentImageIndex] || property.image}
                alt={property.title}
                className="w-full h-64 md:h-96 object-cover cursor-pointer"
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
                  {property.isAvailable ? "Disponible" : "No disponible"}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {property.type === "propiedad" ? "Propiedad completa" : "Habitación"}
                </Badge>
              </div>
            </div>

            {/* Property Title and Location */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{backendProperty?.location?.address || property.zone}</span>
              </div>
              {backendProperty?.location?.zone && (
                <div className="text-sm text-muted-foreground mb-4">
                  Zona: {backendProperty.location.zone}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">{property.description}</p>
              <Badge variant="outline" className="text-sm">
                {getFurnishingText(property.furnishing)}
              </Badge>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{backendProperty?.bedrooms || property.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">rooms</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{property.area}</div>
                  <div className="text-sm text-muted-foreground">m²</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{property.rules.pets ? "Yes" : "No"}</div>
                  <div className="text-sm text-muted-foreground">Mascotas</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{backendProperty?.roommates?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Roommates</div>
                </div>
              </div>
            </div>

            {/* Security & Verification */}
            <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Security deposit required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-green-600" />
                <span>Lease agreement required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span>Identity verification</span>
              </div>
            </div>

            {/* Roommates Section with Personality Tags */}
            {backendProperty?.roommates && backendProperty.roommates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Personality of roommates</h2>
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
                        <Badge variant="secondary" className="px-3 py-1">Calmado</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Pet friendly</Badge>
                        <Badge variant="secondary" className="px-3 py-1 bg-primary text-primary-foreground">Creativo</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Fiesteros</Badge>
                        <Badge variant="secondary" className="px-3 py-1 bg-primary text-primary-foreground">Nocturno</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Deportistas</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              {backendProperty?.amenities && backendProperty.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {backendProperty.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium">{amenity}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {randomAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium">{amenity}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rules - 4 Card Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pets Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${property.rules.pets ? 'bg-green-100' : 'bg-red-100'}`}>
                        <PawPrint className={`h-5 w-5 ${property.rules.pets ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <h3 className="font-semibold">Pets</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property.rules.pets 
                        ? "One small pet per user is allowed" 
                        : "Pets are not allowed in this property"}
                    </p>
                    <div className="flex items-center gap-2">
                      {property.rules.pets ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">1 pet allowed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Not allowed</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Environment (Smoking) Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${property.rules.smoking ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <Cigarette className={`h-5 w-5 ${property.rules.smoking ? 'text-yellow-600' : 'text-green-600'}`} />
                      </div>
                      <h3 className="font-semibold">Environment</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property.rules.smoking 
                        ? "Smoking is allowed in designated areas" 
                        : "Smoke-free inside the apartment"}
                    </p>
                    <div className="flex items-center gap-2">
                      {property.rules.smoking ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Allowed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">🚫 Not allowed</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Events (Meetings/Parties) Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.rules?.meetings?.allowed || property.rules.parties ? 'bg-blue-100' : 'bg-red-100'}`}>
                        <Clock className={`h-5 w-5 ${backendProperty?.rules?.meetings?.allowed || property.rules.parties ? 'text-blue-600' : 'text-red-600'}`} />
                      </div>
                      <h3 className="font-semibold">Events</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.rules?.meetings?.allowed 
                        ? "Meetings on weekends until:" 
                        : property.rules.parties 
                          ? "Parties allowed with time restrictions"
                          : "No events allowed"}
                    </p>
                    <div className="flex items-center gap-2">
                      {backendProperty?.rules?.meetings?.allowed ? (
                        <>
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{backendProperty.rules.meetings.schedule || "1 AM"}</span>
                        </>
                      ) : property.rules.parties ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Allowed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Not allowed</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Parking Card */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${backendProperty?.parking > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Car className={`h-5 w-5 ${backendProperty?.parking > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="font-semibold">Parking</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backendProperty?.parking > 0 
                        ? "There are available parking spaces for this unit" 
                        : "No parking spaces available"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {backendProperty?.parking > 0 ? `${backendProperty.parking}` : "0"}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Location Map */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Find your new home in {backendProperty?.location?.zone || property.zone}
              </p>
              <div className="rounded-lg overflow-hidden h-96">
                <MobilePropertyMap property={property} />
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Address</h3>
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
                        Coordinates: {backendProperty.location.lat.toFixed(4)}, {backendProperty.location.lng.toFixed(4)}
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
                    {backendProperty.rooms.length} Rooms Available out of {backendProperty?.bedrooms || backendProperty.rooms.length}
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
                            <span>No beds</span>
                          </div>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{formatPrice(room.price)}</span>
                          <span className="text-sm text-muted-foreground">/monthly</span>
                        </div>

                        <RocButton 
                          className="w-full"
                          onClick={() => setIsApplicationFlowOpen(true)}
                          disabled={!property?.isAvailable}
                        >
                          Apply to rent
                        </RocButton>

                        <div className="text-xs text-muted-foreground">
                          Available from: <span className="font-medium">{formatDate(room.availableFrom)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* If no individual rooms, show property-level info */}
            {(!backendProperty?.rooms || backendProperty.rooms.length === 0) && (
              <div className="sticky top-24 space-y-4">
                {/* Availability Card */}
                <Card>
                  <CardHeaderComponent>
                    <CardTitleComponent>Disponibilidad</CardTitleComponent>
                  </CardHeaderComponent>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Disponible desde:</span>
                    </div>
                    <div className="font-semibold">{formatDate(property.availableFrom)}</div>
                  </CardContent>
                </Card>

                {/* Price & Apply Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Precio mensual</div>
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(property.price)}
                      </div>
                    </div>

                    {backendProperty?.contracts?.requiresDeposit && backendProperty?.contracts?.depositAmount && (
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Depósito requerido</span>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {formatPrice(backendProperty.contracts.depositAmount)}
                        </div>
                      </div>
                    )}

                    <RocButton 
                      className="w-full text-lg py-6"
                      onClick={() => setIsApplicationFlowOpen(true)}
                      disabled={!property?.isAvailable}
                    >
                      {property?.isAvailable ? 'Aplicar para rentar' : 'No disponible'}
                    </RocButton>
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
              Compartir propiedad
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Comparte esta propiedad con tus contactos
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
              Copiar enlace
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
        title="Save to Favorites?"
        description="Sign in to save this property to your favorites and access them from any device."
        actionText="Sign In to Save"
      />
    </div>
  )
}

export default PropertyDetails;