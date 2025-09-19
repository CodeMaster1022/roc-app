import React, { useState, useMemo } from 'react'
import { MapPin, Home, Bed, Heart, X, Search, Filter } from 'lucide-react'
import { RocButton } from '@/components/ui/roc-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { PropertyCluster } from './PropertyCluster'
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

const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 }

interface MobileMapViewProps {
  properties: Property[]
  favorites: string[]
  onFavoriteToggle: (propertyId: string) => void
  onPropertySelect: (propertyId: string) => void
  selectedZone?: string
  onZoneChange?: (zone: string) => void
}

interface MapProperty extends Property {
  lat: number
  lng: number
}

interface PropertyClusterGroup {
  properties: MapProperty[]
  center: { lat: number; lng: number }
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
}

export const MobileMapView: React.FC<MobileMapViewProps> = ({
  properties,
  favorites,
  onFavoriteToggle,
  onPropertySelect,
  selectedZone,
  onZoneChange
}) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  
  const [selectedCluster, setSelectedCluster] = useState<PropertyClusterGroup | null>(null)
  const [mapCenter] = useState(selectedZone ? ZONE_COORDINATES[selectedZone] || DEFAULT_CENTER : DEFAULT_CENTER)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Transform properties to include coordinates
  const mapProperties = useMemo<MapProperty[]>(() => {
    return properties.map(property => {
      const zoneCoords = ZONE_COORDINATES[property.zone] || DEFAULT_CENTER
      const randomOffset = 0.01
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
      property.zone.toLowerCase().includes(query)
    )
  }, [mapProperties, searchQuery])

  // Cluster nearby properties for better mobile experience
  const propertyClusters = useMemo<PropertyClusterGroup[]>(() => {
    const clusters: PropertyClusterGroup[] = []
    const processed = new Set<string>()
    const clusterRadius = 0.008 // Smaller radius for mobile clustering
    
    filteredMapProperties.forEach(property => {
      if (processed.has(property.id)) return
      
      const cluster: PropertyClusterGroup = {
        properties: [property],
        center: { lat: property.lat, lng: property.lng },
        bounds: {
          minLat: property.lat,
          maxLat: property.lat,
          minLng: property.lng,
          maxLng: property.lng
        }
      }
      
      processed.add(property.id)
      
      // Find nearby properties
      filteredMapProperties.forEach(otherProperty => {
        if (processed.has(otherProperty.id)) return
        
        const distance = Math.sqrt(
          Math.pow(property.lat - otherProperty.lat, 2) + 
          Math.pow(property.lng - otherProperty.lng, 2)
        )
        
        if (distance <= clusterRadius) {
          cluster.properties.push(otherProperty)
          processed.add(otherProperty.id)
          
          // Update bounds
          cluster.bounds.minLat = Math.min(cluster.bounds.minLat, otherProperty.lat)
          cluster.bounds.maxLat = Math.max(cluster.bounds.maxLat, otherProperty.lat)
          cluster.bounds.minLng = Math.min(cluster.bounds.minLng, otherProperty.lng)
          cluster.bounds.maxLng = Math.max(cluster.bounds.maxLng, otherProperty.lng)
        }
      })
      
      // Update cluster center
      if (cluster.properties.length > 1) {
        cluster.center = {
          lat: (cluster.bounds.minLat + cluster.bounds.maxLat) / 2,
          lng: (cluster.bounds.minLng + cluster.bounds.maxLng) / 2
        }
      }
      
      clusters.push(cluster)
    })
    
    return clusters
  }, [filteredMapProperties])

  const handleClusterClick = (cluster: PropertyClusterGroup) => {
    if (cluster.properties.length === 1) {
      onPropertySelect(cluster.properties[0].id)
    } else {
      setSelectedCluster(cluster)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Mobile Map Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('map.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <RocButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
          </RocButton>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-full pt-20 pb-4">
        <div className="relative h-full bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="text-gray-400">
              <defs>
                <pattern id="mobile-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mobile-grid)" />
            </svg>
          </div>

          {/* Property Clusters */}
          {propertyClusters.map((cluster, index) => {
            // Calculate position based on map center
            const offsetX = (cluster.center.lng - mapCenter.lng) * 2000
            const offsetY = (cluster.center.lat - mapCenter.lat) * 2000
            const x = 50 + offsetX
            const y = 50 - offsetY
            
            // Only show clusters within view
            if (x < -5 || x > 105 || y < -5 || y > 105) return null

            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-full z-10"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`
                }}
              >
                <PropertyCluster
                  properties={cluster.properties}
                  position={{ x, y }}
                  onClick={() => handleClusterClick(cluster)}
                  size="w-10 h-10"
                />
                
                {/* Price label for single properties */}
                {cluster.properties.length === 1 && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded px-2 py-1 text-xs font-medium shadow-sm whitespace-nowrap">
                    {formatPrice(cluster.properties[0].price)}
                  </div>
                )}
              </div>
            )
          })}

          {/* Results Counter */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
            <div className="text-sm font-medium">
              {filteredMapProperties.length} {t('map.properties_found')}
            </div>
          </div>
        </div>
      </div>

      {/* Property Cluster Sheet */}
      <Sheet open={!!selectedCluster} onOpenChange={() => setSelectedCluster(null)}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>
              {selectedCluster?.properties.length} {t('map.properties_found')}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-4 space-y-3 overflow-y-auto">
            {selectedCluster?.properties.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{property.title}</h3>
                        <Badge variant={property.type === 'propiedad' ? 'default' : 'secondary'} className="text-xs">
                          {property.type === 'propiedad' ? t('filter.property') : t('filter.room')}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{property.zone}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            {property.bedrooms}
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            {property.area}m²
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">
                            {formatPrice(property.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">/mes</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <RocButton
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFavoriteToggle(property.id)
                          }}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Heart className={`h-3 w-3 ${favorites.includes(property.id) ? 'fill-current text-red-500' : ''}`} />
                        </RocButton>
                        
                        <RocButton
                          size="sm"
                          onClick={() => {
                            onPropertySelect(property.id)
                            setSelectedCluster(null)
                          }}
                          className="flex-1 text-xs"
                        >
                          {t('property.view_details')}
                        </RocButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 