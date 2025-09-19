import React, { useRef, useEffect, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
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
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

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

interface DirectMapboxMapProps {
  properties: Property[]
  favorites: string[]
  onFavoriteToggle: (propertyId: string) => void
  onPropertySelect: (propertyId: string) => void
  selectedZone?: string
  onZoneChange?: (zone: string) => void
  className?: string
}

export const DirectMapboxMap: React.FC<DirectMapboxMapProps> = ({
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
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)

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

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return

    // Set the access token
    mapboxgl.accessToken = MAPBOX_TOKEN

    // Initialize the map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [
        selectedZone ? ZONE_COORDINATES[selectedZone]?.lng || DEFAULT_CENTER.lng : DEFAULT_CENTER.lng,
        selectedZone ? ZONE_COORDINATES[selectedZone]?.lat || DEFAULT_CENTER.lat : DEFAULT_CENTER.lat
      ],
      zoom: selectedZone ? 14 : 12,
      attributionControl: false
    })

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapInstance.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right')
    mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

    mapInstance.on('load', () => {
      setMapLoaded(true)
    })

    map.current = mapInstance

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [selectedZone])

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    filteredMapProperties.forEach(property => {
      // Create marker container
      const markerContainer = document.createElement('div')
      markerContainer.style.cssText = `
        position: relative;
        width: 32px;
        height: 32px;
      `
      
      // Create main marker element
      const el = document.createElement('div')
      el.className = 'property-marker'
      el.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background-color: ${property.type === 'propiedad' ? '#3b82f6' : '#10b981'};
        transform-origin: center center;
      `
      
      // Add home icon
      el.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      `
      
      // Add favorite indicator if needed
      if (favorites.includes(property.id)) {
        const favoriteEl = document.createElement('div')
        favoriteEl.style.cssText = `
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background-color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        `
        favoriteEl.innerHTML = `
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
            <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `
        el.appendChild(favoriteEl)
      }

      // Add price label to container (not to the marker element)
      const priceEl = document.createElement('div')
      priceEl.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
        margin-top: 2px;
        pointer-events: none;
      `
      priceEl.textContent = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(property.price)
      
      // Append elements to container
      markerContainer.appendChild(el)
      markerContainer.appendChild(priceEl)

      // Add hover effect with proper positioning
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)'
        el.style.zIndex = '1000'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.zIndex = 'auto'
      })

      // Create marker with proper anchor using the container
      const marker = new mapboxgl.Marker({
        element: markerContainer,
        anchor: 'center'
      })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedProperty(property)
        
        // Create popup content
        const popupContent = document.createElement('div')
        popupContent.innerHTML = `
          <div class="property-popup" style="
            width: 320px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          ">
            <!-- Header with property image placeholder and close button -->
            <div style="
              height: 45px; 
              background: linear-gradient(135deg, ${property.type === 'propiedad' ? '#3b82f6' : '#10b981'}, ${property.type === 'propiedad' ? '#1d4ed8' : '#059669'}); 
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <button id="close-btn" style="
                position: absolute; 
                top: 8px; 
                right: 8px; 
                width: 24px;
                height: 24px;
                background: rgba(255,255,255,0.2); 
                color: white; 
                border: none;
                border-radius: 50%; 
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
              " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m18 6-12 12"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
              <span style="
                position: absolute; 
                top: 12px; 
                right: 40px; 
                background: rgba(255,255,255,0.2); 
                color: white; 
                padding: 2px 6px; 
                border-radius: 12px; 
                font-size: 8px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">
                ${property.type === 'propiedad' ? t('filter.property') : t('filter.room')}
              </span>
            </div>     
            
            <!-- Content -->
            <div style="padding: 16px;">
              <!-- Title and Price -->
              <div style="margin-bottom: 2px;">
                <h3 style="
                  font-weight: 600; 
                  font-size: 14px; 
                  margin: 0 0 2px 0; 
                  color: #111827;
                  line-height: 1.3;
                ">${property.title}</h3>
                <p style="
                  color: #6b7280; 
                  font-size: 10px; 
                  margin: 0 0 2px 0;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  ${property.zone}
                </p>
                <div style="
                  display: flex; 
                  align-items: center; 
                  justify-content: space-between;
                  margin-bottom: 2px;
                ">
                  <div style="display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 10px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 4v16"/>
                        <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
                        <path d="M2 17h20"/>
                        <path d="M6 8v9"/>
                      </svg>
                      <span>${property.bedrooms} hab.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      <span>${property.area}m²</span>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="
                      font-size: 18px; 
                      font-weight: 700; 
                      color: #111827;
                      line-height: 1;
                    ">
                      ${new Intl.NumberFormat('es-MX', { 
                        style: 'currency', 
                        currency: 'MXN', 
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0
                      }).format(property.price)}
                    </div>
                    <div style="font-size: 8px; color: #9ca3af; font-weight: 500;">/mes</div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button id="favorite-btn" style="
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                  gap: 6px; 
                  padding: 2px 2px; 
                  border: 2px solid ${favorites.includes(property.id) ? '#ef4444' : '#e5e7eb'}; 
                  border-radius: 8px; 
                  background: ${favorites.includes(property.id) ? '#fef2f2' : 'white'}; 
                  cursor: pointer; 
                  font-size: 10px;
                  font-weight: 600;
                  color: ${favorites.includes(property.id) ? '#ef4444' : '#374151'};
                  transition: all 0.2s ease;
                  min-width: 100px;
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="${favorites.includes(property.id) ? '#ef4444' : 'none'}" stroke="${favorites.includes(property.id) ? '#ef4444' : 'currentColor'}" stroke-width="2">
                    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  ${favorites.includes(property.id) ? t('property.saved') : t('property.save')}
                </button>
                <button id="details-btn" style="
                  flex: 1; 
                  padding: 4px 8px; 
                  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                  color: white; 
                  border: none; 
                  border-radius: 8px; 
                  cursor: pointer; 
                  font-size: 10px;
                  font-weight: 600;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 6px;">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  ${t('property.view_details')}
                </button>
              </div>
            </div>
          </div>
        `

        // Remove existing popup
        if (popupRef.current) {
          popupRef.current.remove()
        }

        // Create new popup
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'bottom',
          offset: [0, -10]
        })
          .setLngLat([property.lng, property.lat])
          .setDOMContent(popupContent)
          .addTo(map.current!)

        popupRef.current = popup

        // Add event listeners to popup buttons
        const favoriteBtn = popupContent.querySelector('#favorite-btn')
        const detailsBtn = popupContent.querySelector('#details-btn')
        const closeBtn = popupContent.querySelector('#close-btn')

        favoriteBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          onFavoriteToggle(property.id)
        })

        detailsBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          onPropertySelect(property.id)
          popup.remove()
        })

        closeBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          popup.remove()
        })

        // Center map on property
        map.current!.flyTo({
          center: [property.lng, property.lat],
          zoom: 16,
          duration: 1000
        })
      })

      markersRef.current.push(marker)
    })
  }, [filteredMapProperties, favorites, mapLoaded, t, onFavoriteToggle, onPropertySelect])

  // Center map on selected zone
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedZone) return

    const zoneCoords = ZONE_COORDINATES[selectedZone]
    if (zoneCoords) {
      map.current.flyTo({
        center: [zoneCoords.lng, zoneCoords.lat],
        zoom: 14,
        duration: 1000
      })
    }
  }, [selectedZone, mapLoaded])

  // Check if Mapbox token is available
  if (!MAPBOX_TOKEN) {
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

      {/* Mapbox Container */}
      <div 
        ref={mapContainer}
        className={`${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'} rounded-lg overflow-hidden`}
        style={{ width: '100%' }}
      />

      {/* Results Counter */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <div className="text-sm font-medium">
          {filteredMapProperties.length} {t('map.properties_found')}
        </div>
      </div>
    </div>
  )
} 