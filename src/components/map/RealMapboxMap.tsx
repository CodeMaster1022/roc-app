import React, { useState, useCallback, useMemo } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl, ScaleControl } from 'react-map-gl'
import { MapPin, Home, Bed, Heart, X, Maximize2, Minimize2, Search } from 'lucide-react'
import { RocButton } from '@/components/ui/roc-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Property } from '@/data/mockProperties'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox access token - in production, this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoicmFrZXNoLW5ha3JhbmkiLCJhIjoiY2xsNjNkZm0yMGhvcDNlb3phdjF4dHlzeiJ9.ps6azYbr7M3rGk_QTguMEQ'

// Zone coordinates for Mexico City areas
const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Roma Norte': { lat: 19.4125, lng: -99.1625 },
  'Roma Sur': { lat: 19.4050, lng: -99.1600 },
  'Condesa': { lat: 19.4100, lng: -99.1700 },
  'Polanco': { lat: 19.4350, lng: -99.1950 },
  'Santa Fe': { lat: 19.3600, lng: -99.2700 },
  'Coyoacán': { lat: 19.3500, lng: -99.1600 },
  'Del Valle': { lat: 19.3800, lng: -99.1650 },
  'Doctores': { lat: 19.4200, lng: -99.1450 },
  'Narvarte': { lat: 19.3950, lng: -99.1550 },
  'Juárez': { lat: 19.4250, lng: -99.1550 }
}

// Default center (Mexico City)
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 }

interface MapProperty extends Property {
  lat: number
  lng: number
}

interface RealMapboxMapProps {
  properties: Property[]
  favorites: string[]
  onFavoriteToggle: (propertyId: string) => void
  onPropertySelect: (propertyId: string) => void
  selectedZone?: string
  onZoneChange?: (zone: string) => void
  className?: string
}

export const RealMapboxMap: React.FC<RealMapboxMapProps> = ({
  properties,
  favorites,
  onFavoriteToggle,
  onPropertySelect,
  selectedZone,
  onZoneChange,
  className = ''
}) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewState, setViewState] = useState({
    longitude: selectedZone ? ZONE_COORDINATES[selectedZone]?.lng || DEFAULT_CENTER.lng : DEFAULT_CENTER.lng,
    latitude: selectedZone ? ZONE_COORDINATES[selectedZone]?.lat || DEFAULT_CENTER.lat : DEFAULT_CENTER.lat,
    zoom: selectedZone ? 14 : 12
  })

  // Transform properties to include coordinates
  const mapProperties = useMemo<MapProperty[]>(() => {
    return properties.map(property => {
      const zoneCoords = ZONE_COORDINATES[property.zone] || DEFAULT_CENTER
      // Add some random offset to avoid overlapping markers in the same zone
      const randomOffset = 0.005
      return {
        ...property,
        lat: zoneCoords.lat + (Math.random() - 0.5) * randomOffset,
        lng: zoneCoords.lng + (Math.random() - 0.5) * randomOffset
      }
    })
  }, [properties])

  // Filter properties based on search query
  const filteredMapProperties = useMemo(() => {
    if (!searchQuery.trim()) return mapProperties
    
    const query = searchQuery.toLowerCase()
    return mapProperties.filter(property =>
      property.title.toLowerCase().includes(query) ||
      property.zone.toLowerCase().includes(query) ||
      property.description.toLowerCase().includes(query)
    )
  }, [mapProperties, searchQuery])

  const handlePropertyClick = useCallback((property: MapProperty) => {
    setSelectedProperty(property)
    setViewState(prev => ({
      ...prev,
      longitude: property.lng,
      latitude: property.lat,
      zoom: 16
    }))
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyColor = (property: Property) => {
    return property.type === 'propiedad' ? '#3b82f6' : '#10b981' // blue for properties, green for rooms
  }

  // Check if Mapbox token is available
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('placeholder')) {
    return (
      <div className={`relative bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2 text-orange-800">
            Mapbox Configuration Required
          </h3>
          <p className="text-orange-700 mb-4">
            To display real maps, please add your Mapbox access token to the environment variables.
          </p>
          <div className="bg-orange-100 rounded-lg p-4 text-left text-sm">
            <p className="font-medium mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-orange-800">
              <li>Sign up at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a></li>
              <li>Get your free access token</li>
              <li>Add <code className="bg-orange-200 px-1 rounded">VITE_MAPBOX_ACCESS_TOKEN=your_token</code> to .env file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <p className="text-sm text-orange-600 mt-4">
            Currently showing {filteredMapProperties.length} properties in mock mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className}`}>
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('map.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/90 backdrop-blur-sm border-white/20"
          />
        </div>
        
        {/* Map Controls */}
        <div className="flex items-center gap-2">
          <RocButton
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/90 backdrop-blur-sm border-white/20"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </RocButton>
        </div>
      </div>

      {/* Mapbox Map */}
      <div className={`${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'} rounded-lg overflow-hidden`}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          attributionControl={false}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {/* Property Markers */}
          {filteredMapProperties.map((property) => (
            <Marker
              key={property.id}
              longitude={property.lng}
              latitude={property.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                handlePropertyClick(property)
              }}
            >
              <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getPropertyColor(property) }}
                >
                  <Home className="h-4 w-4 text-white" />
                </div>
                
                {/* Favorite indicator */}
                {favorites.includes(property.id) && (
                  <Heart className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
                )}
                
                {/* Price label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded px-2 py-1 text-xs font-medium shadow-sm whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
              </div>
            </Marker>
          ))}

          {/* Property Popup */}
          {selectedProperty && (
            <Popup
              longitude={selectedProperty.lng}
              latitude={selectedProperty.lat}
              anchor="bottom"
              onClose={() => setSelectedProperty(null)}
              closeButton={false}
              className="property-popup"
            >
              <Card className="w-80 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{selectedProperty.title}</h3>
                        <Badge variant={selectedProperty.type === 'propiedad' ? 'default' : 'secondary'}>
                          {selectedProperty.type === 'propiedad' ? t('filter.property') : t('filter.room')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{selectedProperty.zone}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {selectedProperty.bedrooms}
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {selectedProperty.area}m²
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(selectedProperty.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">/mes</div>
                      </div>
                      <button
                        onClick={() => setSelectedProperty(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <RocButton
                      variant="outline"
                      size="sm"
                      onClick={() => onFavoriteToggle(selectedProperty.id)}
                      className="flex items-center gap-1"
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(selectedProperty.id) ? 'fill-current text-red-500' : ''}`} />
                      {favorites.includes(selectedProperty.id) ? t('property.saved') : t('property.save')}
                    </RocButton>
                    
                    <RocButton
                      size="sm"
                      onClick={() => {
                        onPropertySelect(selectedProperty.id)
                        setSelectedProperty(null)
                      }}
                      className="flex-1"
                    >
                      {t('property.view_details')}
                    </RocButton>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          )}
        </Map>
      </div>

      {/* Results Counter */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <div className="text-sm font-medium">
          {filteredMapProperties.length} {t('map.properties_found')}
        </div>
      </div>
    </div>
  )
} 