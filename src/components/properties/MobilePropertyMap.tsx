import React, { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { MapPin, Expand } from 'lucide-react'
import type { Property } from '@/data/mockProperties'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox access token
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

interface MobilePropertyMapProps {
  property: Property
  onExpand?: () => void
}

const MobilePropertyMap: React.FC<MobilePropertyMapProps> = ({ 
  property, 
  onExpand 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Get property coordinates based on zone or use default
  const getPropertyCoordinates = useCallback(() => {
    const zoneCoords = ZONE_COORDINATES[property.zone]
    if (zoneCoords) {
      return {
        lat: zoneCoords.lat,
        lng: zoneCoords.lng
      }
    }
    return {
      lat: DEFAULT_CENTER.lat,
      lng: DEFAULT_CENTER.lng
    }
  }, [property.zone])

  const coords = getPropertyCoordinates()

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return

    // Set the access token
    mapboxgl.accessToken = MAPBOX_TOKEN

    // Initialize the map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coords.lng, coords.lat],
      zoom: 14,
      attributionControl: false
    })

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

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
  }, [coords.lat, coords.lng])

  // Add marker when map loads
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing marker
    if (marker.current) {
      marker.current.remove()
    }

    // Create marker element
    const markerEl = document.createElement('div')
    markerEl.style.cssText = `
      position: relative;
      width: 32px;
      height: 32px;
    `

    // Create main marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #7c3aed;
    `

    // Add map pin icon
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    `

    // Add location label
    const labelEl = document.createElement('div')
    labelEl.style.cssText = `
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      white-space: nowrap;
      color: #374151;
    `
    labelEl.textContent = property.zone

    markerEl.appendChild(el)
    markerEl.appendChild(labelEl)

    // Create and add marker
    const newMarker = new mapboxgl.Marker(markerEl)
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current)

    marker.current = newMarker

  }, [mapLoaded, coords.lat, coords.lng, property.zone])

  return (
    <div className="h-full min-h-48 bg-gray-100 rounded-lg overflow-hidden relative w-full">
      {MAPBOX_TOKEN ? (
        <div ref={mapContainer} className="w-full h-full" />
      ) : (
        // Fallback when Mapbox token is not available
        <div className="h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
              📍
            </div>
            <div className="text-sm text-gray-600">{property.zone}</div>
          </div>
        </div>
      )}
      
      {/* Expand button */}
      {onExpand && (
        <button 
          onClick={onExpand}
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
        >
          <Expand className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default MobilePropertyMap 