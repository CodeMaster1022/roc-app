import { useState, useEffect } from "react"
import PropertyCard from "@/components/properties/PropertyCard"
import { RocButton } from "@/components/ui/roc-button"
import { type Property } from "@/data/mockProperties"
import { Trash2, Heart } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { favoriteService } from "@/services/favoriteService"
import { propertyService } from "@/services/propertyService"
import { transformBackendPropertyToFrontend } from "@/utils/propertyTransform"

interface FavoritesListProps {
  favoriteIds: string[]
  onRemoveFavorite: (id: string) => void
  onViewDetails: (id: string) => void
  onShowAuthPrompt?: () => void
}

const FavoritesList = ({ favoriteIds, onRemoveFavorite, onViewDetails, onShowAuthPrompt }: FavoritesListProps) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load favorite properties from backend
  useEffect(() => {
    const loadFavoriteProperties = async () => {
      if (favoriteIds.length === 0) {
        setFavoriteProperties([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Get properties by IDs
        const propertyPromises = favoriteIds.map(id => 
          propertyService.getProperty(id).catch(err => {
            console.warn(`Failed to load property ${id}:`, err)
            return null
          })
        )
        
        const results = await Promise.all(propertyPromises)
        const validProperties = results
          .filter(result => result !== null)
          .map(result => transformBackendPropertyToFrontend(result!.data.property))
        
        setFavoriteProperties(validProperties)
      } catch (err) {
        console.error('Failed to load favorite properties:', err)
        setError('Failed to load favorite properties')
        setFavoriteProperties([])
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteProperties()
  }, [favoriteIds])

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading favorites...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Error loading favorites</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <RocButton onClick={() => window.location.reload()}>
          Try Again
        </RocButton>
      </div>
    )
  }

  // Empty state - different for authenticated vs non-authenticated users
  if (favoriteProperties.length === 0) {
    if (!isAuthenticated) {
      // Non-authenticated empty state with heart icon and auth prompt
      return (
        <div className="text-center py-12 animate-fade-in">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your Favorites</h3>
          <p className="text-muted-foreground mb-4">
            Save properties you love by creating an account
          </p>
          <RocButton onClick={() => onShowAuthPrompt?.()}>
            Create Account
          </RocButton>
        </div>
      )
    }
    
    // Authenticated but no favorites
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">💜</div>
        <h3 className="text-xl font-semibold mb-2">{t('favorites.empty')}</h3>
        <p className="text-muted-foreground mb-4">
          {t('favorites.empty_subtitle')}
        </p>
        <RocButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {t('nav.inicio')}
        </RocButton>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 pt-6 md:px-0 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t('favorites.title')}</h2>
          <p className="text-muted-foreground">
            {favoriteProperties.length} {favoriteProperties.length === 1 ? t('filter.property').toLowerCase() : t('results.properties_available')}
          </p>
        </div>
        
        {favoriteProperties.length > 0 && (
          <RocButton 
            variant="outline" 
            size="sm"
            onClick={() => favoriteIds.forEach(id => onRemoveFavorite(id))}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground hidden md:flex"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('filter.clear_filters')}
          </RocButton>
        )}
      </div>

      {/* Mobile compact layout */}
      <div className="block md:hidden space-y-4">
        {favoriteProperties.map((property, index) => (
          <div 
            key={property.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div 
              className="bg-card rounded-lg border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewDetails(property.id)}
            >
              <div className="flex">
                {/* Image on the left */}
                <div className="w-32 h-36 flex-shrink-0 relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {!property.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">N/A</span>
                    </div>
                  )}
                </div>
                
                {/* Content on the right */}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1 mr-2">
                      {property.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFavorite(property.id)
                      }}
                      className="p-1 hover:bg-muted rounded-full flex-shrink-0"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="highlight-text font-bold">
                      ${property.price.toLocaleString('es-MX')}{t('units.month')}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>{property.area} {t('units.m2')}</span>
                      {property.type === "propiedad" && (
                        <span>{property.bedrooms} {property.bedrooms === 1 ? t('property.bedrooms').slice(0, -1) : t('property.bedrooms')}</span>
                      )}
                      {property.allowsPets && <span>🐕</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop grid layout */}
      <div className="hidden md:grid gap-6 grid-cols-2 xl:grid-cols-3">
        {favoriteProperties.map((property, index) => (
          <div 
            key={property.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PropertyCard
              id={property.id}
              title={property.title}
              image={property.image}
              price={property.price}
              type={property.type}
              propertyType={property.propertyType}
              area={property.area}
              bedrooms={property.bedrooms}
              allowsPets={property.allowsPets}
              bathType={property.bathType}
              scheme={property.scheme}
              isFavorite={true}
              isAvailable={property.isAvailable}
              onFavoriteToggle={onRemoveFavorite}
              onViewDetails={onViewDetails}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesList