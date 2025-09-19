import React, { useState, useMemo, useEffect } from 'react'
import { MapPin, Home, Bed, Bath, DollarSign, Heart, X, Maximize2, Minimize2, Filter, Search } from 'lucide-react'
import { RocButton } from '@/components/ui/roc-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Property } from '@/data/mockProperties'

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
const DEFAULT_ZOOM = 12

interface PropertyMapViewProps {
  properties: Property[]
  favorites: string[]
  onFavoriteToggle: (propertyId: string) => void
  onPropertySelect: (propertyId: string) => void
  selectedZone?: string
  onZoneChange?: (zone: string) => void
  className?: string
}

interface MapProperty extends Property {
  lat: number
  lng: number
}

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({
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
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null)

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

  // Update map center when zone changes
  useEffect(() => {
    if (selectedZone && ZONE_COORDINATES[selectedZone]) {
      setMapCenter(ZONE_COORDINATES[selectedZone])
      setMapZoom(14)
    } else {
      setMapCenter(DEFAULT_CENTER)
      setMapZoom(DEFAULT_ZOOM)
    }
  }, [selectedZone])

  const handlePropertyClick = (property: MapProperty) => {
    setSelectedProperty(property)
    setMapCenter({ lat: property.lat, lng: property.lng })
    setMapZoom(16)
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close popup if clicking on empty map area
    if (e.target === e.currentTarget) {
      setSelectedProperty(null)
    }
  }

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 8))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyColor = (property: Property) => {
    if (property.type === 'propiedad') return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getMarkerSize = () => {
    if (mapZoom >= 15) return 'w-8 h-8'
    if (mapZoom >= 12) return 'w-6 h-6'
    return 'w-4 h-4'
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

      {/* Map Container */}
      <div 
        className={`relative bg-gradient-to-br from-blue-50 to-green-50 cursor-grab ${
          isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'
        } rounded-lg overflow-hidden`}
        onClick={handleMapClick}
      >
        {/* Map Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="text-gray-400">
            <defs>
              <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
        </div>

        {/* Mock Streets for Visual Context */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bg-gray-400" style={{
            top: '25%', left: '0%', width: '100%', height: '3px',
            transform: `scale(${mapZoom / 12})`
          }} />
          <div className="absolute bg-gray-400" style={{
            top: '50%', left: '0%', width: '100%', height: '3px',
            transform: `scale(${mapZoom / 12})`
          }} />
          <div className="absolute bg-gray-400" style={{
            top: '75%', left: '0%', width: '100%', height: '3px',
            transform: `scale(${mapZoom / 12})`
          }} />
          <div className="absolute bg-gray-400" style={{
            top: '0%', left: '20%', width: '3px', height: '100%',
            transform: `scale(${mapZoom / 12})`
          }} />
          <div className="absolute bg-gray-400" style={{
            top: '0%', left: '50%', width: '3px', height: '100%',
            transform: `scale(${mapZoom / 12})`
          }} />
          <div className="absolute bg-gray-400" style={{
            top: '0%', left: '80%', width: '3px', height: '100%',
            transform: `scale(${mapZoom / 12})`
          }} />
        </div>

        {/* Property Markers */}
        {filteredMapProperties.map((property) => {
          // Calculate position based on map center and zoom
          const offsetX = (property.lng - mapCenter.lng) * 1000 * mapZoom
          const offsetY = (property.lat - mapCenter.lat) * 1000 * mapZoom
          const x = 50 + offsetX // 50% is center
          const y = 50 - offsetY // Invert Y axis
          
          // Only show markers that are within view
          if (x < -10 || x > 110 || y < -10 || y > 110) return null

          const isSelected = selectedProperty?.id === property.id
          const isHovered = hoveredProperty === property.id
          const isFavorite = favorites.includes(property.id)
          
          return (
            <div
              key={property.id}
              className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 cursor-pointer z-20 ${
                isSelected || isHovered ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{
                left: `${Math.max(0, Math.min(100, x))}%`,
                top: `${Math.max(0, Math.min(100, y))}%`
              }}
              onClick={(e) => {
                e.stopPropagation()
                handlePropertyClick(property)
              }}
              onMouseEnter={() => setHoveredProperty(property.id)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              {/* Property Marker */}
              <div className={`${getMarkerSize()} ${getPropertyColor(property)} rounded-full border-2 border-white shadow-lg flex items-center justify-center relative`}>
                <Home className="h-1/2 w-1/2 text-white" />
                
                {/* Favorite indicator */}
                {isFavorite && (
                  <Heart className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
                )}
                
                {/* Price label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded px-1 py-0.5 text-xs font-medium shadow-sm whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Zone Labels */}
        {mapZoom <= 13 && Object.entries(ZONE_COORDINATES).map(([zone, coords]) => {
          const offsetX = (coords.lng - mapCenter.lng) * 1000 * mapZoom
          const offsetY = (coords.lat - mapCenter.lat) * 1000 * mapZoom
          const x = 50 + offsetX
          const y = 50 - offsetY
          
          if (x < 0 || x > 100 || y < 0 || y > 100) return null
          
          return (
            <div
              key={zone}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{
                left: `${x}%`,
                top: `${y}%`
              }}
            >
              <div className="bg-black/20 text-white px-2 py-1 rounded text-sm font-medium">
                {zone}
              </div>
            </div>
          )
        })}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-1 z-10">
          <button
            onClick={handleZoomIn}
            className="block w-8 h-8 text-gray-600 hover:text-gray-800 text-lg font-bold hover:bg-gray-100 rounded"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="block w-8 h-8 text-gray-600 hover:text-gray-800 text-lg font-bold hover:bg-gray-100 rounded"
          >
            −
          </button>
        </div>

        {/* Results Counter */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
          <div className="text-sm font-medium">
            {filteredMapProperties.length} {t('map.properties_found')}
          </div>
        </div>
      </div>

      {/* Property Popup */}
      {selectedProperty && (
        <div className="absolute inset-x-4 bottom-4 z-30">
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
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
        </div>
      )}
    </div>
  )
} 