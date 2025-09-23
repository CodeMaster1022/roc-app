import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, Share2, MapPin, Home, Users, PawPrint, Bed, Bath, Wifi, Car, Utensils, Waves, Shield, Calendar, CheckCircle, XCircle, Cigarette, PartyPopper, FileText, CreditCard, UserCheck, ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
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
import MobilePropertyDetails from "@/components/properties/MobilePropertyDetails"

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isApplicationFlowOpen, setIsApplicationFlowOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const backendProperty = response.data.property
        console.log('Backend property:', backendProperty)
        const transformedProperty = transformBackendPropertyToFrontend(backendProperty)
        console.log('Transformed property:', transformedProperty)
        
        // Create property with multiple images for gallery (using the same image for demo)
        const propertyWithImages = {
          ...transformedProperty,
          images: backendProperty.images && backendProperty.images.length > 0 
            ? backendProperty.images 
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
      // Still update local state as fallback
      setIsFavorite(!isFavorite)
      
      // Show error toast
      toast({
        title: t('favorites.error_title'),
        description: t('favorites.error_description'),
        variant: "destructive"
      })
    }
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

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
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

            {/* Property Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{property.zone}</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}/mes
                  </div>
                </div>
                
                {/* Mobile Share Button */}
                {isMobile && (
                  <div className="flex items-center gap-2">
                    <RocButton
                      variant="outline"
                      size="sm"
                      onClick={handleFavoriteToggle}
                      className={`${isFavorite ? "text-red-500 border-red-500" : ""}`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    </RocButton>
                    <RocButton
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </RocButton>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tipo</div>
                    <div className="font-semibold capitalize">{property.propertyType}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Habitaciones</div>
                    <div className="font-semibold">{property.bedrooms}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Área</div>
                    <div className="font-semibold">{property.area} m²</div>
                  </div>
                </div>

                {property.bathType && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Baño</div>
                      <div className="font-semibold capitalize">{property.bathType}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info for Rooms */}
              {property.type === "habitacion" && property.scheme && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Esquema de convivencia:</span>
                  </div>
                  <Badge variant="secondary">{getSchemeText(property.scheme)}</Badge>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Amenidades</h2>
                <div className="flex flex-wrap gap-2">
                  {randomAmenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Amueblado</h2>
                <Badge variant="outline" className="text-sm">
                  {getFurnishingText(property.furnishing)}
                </Badge>
              </div>

              {/* Rules */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Reglas de la propiedad</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <PawPrint className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Mascotas</span>
                    </div>
                    {property.rules.pets ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Permitidas</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>No permitidas</span>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Cigarette className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Fumar</span>
                    </div>
                    {property.rules.smoking ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Permitido</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>No permitido</span>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <PartyPopper className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Fiestas</span>
                    </div>
                    {property.rules.parties ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Permitidas</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>No permitidas</span>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
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

            {/* Security */}
            <Card>
              <CardHeaderComponent>
                <CardTitleComponent>Seguridad</CardTitleComponent>
              </CardHeaderComponent>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Depósito de seguridad requerido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Contrato de arrendamiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Verificación de identidad</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Card>
              <CardContent className="p-6">
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
    </div>
  )
}

export default PropertyDetails;