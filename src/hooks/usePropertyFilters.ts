import { useState, useEffect, useMemo, useCallback } from 'react'
import { propertyService } from '@/services/propertyService'
import { transformBackendPropertyToFrontend } from '@/utils/propertyTransform'
import { type Property } from '@/data/mockProperties'
import { type FilterState } from '@/components/modals/PriceFilterModal'

export interface UsePropertyFiltersProps {
  initialFilter?: "ambas" | "propiedad" | "habitacion"
  initialFilters?: FilterState
  initialSortBy?: string
  initialZone?: string
}

export interface PropertyFiltersState {
  properties: Property[]
  filteredProperties: Property[]
  loading: boolean
  error: string | null
  currentFilter: "ambas" | "propiedad" | "habitacion"
  filters: FilterState
  sortBy: string
  selectedZone: string
  hasMore: boolean
  page: number
}

export interface PropertyFiltersActions {
  setCurrentFilter: (filter: "ambas" | "propiedad" | "habitacion") => void
  setFilters: (filters: FilterState) => void
  setSortBy: (sortBy: string) => void
  setSelectedZone: (zone: string) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  clearFilters: () => void
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function usePropertyFilters({
  initialFilter = "ambas",
  initialFilters = {
    priceRange: [3000, 50000],
    furnishing: "all",
    amenities: []
  },
  initialSortBy = "newest",
  initialZone = ""
}: UsePropertyFiltersProps = {}): [PropertyFiltersState, PropertyFiltersActions] {
  
  // State management
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState(initialFilter)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [selectedZone, setSelectedZone] = useState(initialZone)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Debounce filter changes to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 500)
  const debouncedZone = useDebounce(selectedZone, 300)

  // Memoize server-side filter parameters
  const serverFilters = useMemo(() => {
    const params: any = {
      page: 1, // Always start from page 1 when filters change
      limit: 50
    }

    // Map frontend filter types to backend types
    if (currentFilter !== "ambas") {
      params.type = currentFilter === "propiedad" ? "property" : "rooms"
    }

    // Price range
    if (debouncedFilters.priceRange[0] > 3000) {
      params.minPrice = debouncedFilters.priceRange[0]
    }
    if (debouncedFilters.priceRange[1] < 50000) {
      params.maxPrice = debouncedFilters.priceRange[1]
    }

    // Zone
    if (debouncedZone) {
      params.zone = debouncedZone
    }

    return params
  }, [currentFilter, debouncedFilters.priceRange, debouncedZone])

  // Client-side filtering for properties that can't be filtered server-side
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      // Only show available properties
      if (!property.isAvailable) {
        return false
      }

      // Furniture filtering (if backend doesn't support it)
      if (debouncedFilters.furnishing !== "all" && property.furnishing !== debouncedFilters.furnishing) {
        return false
      }

      // Amenities filtering (complex logic that's better on client)
      if (debouncedFilters.amenities.length > 0) {
        const hasAnyAmenity = debouncedFilters.amenities.some(amenity => 
          property.amenities.some(propAmenity => 
            propAmenity.toLowerCase().includes(amenity.toLowerCase()) ||
            amenity === "pet-friendly" && property.allowsPets
          )
        )
        if (!hasAnyAmenity) {
          return false
        }
      }

      return true
    })

    // Client-side sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime())
        break
      default:
        break
    }

    return filtered
  }, [properties, debouncedFilters.furnishing, debouncedFilters.amenities, sortBy])

  // Fetch properties with server-side filtering
  const fetchProperties = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentPage = isLoadMore ? page : 1
      const response = await propertyService.searchProperties({
        ...serverFilters,
        page: currentPage
      })

      const transformedProperties = response.data.properties.map(backendProperty => 
        transformBackendPropertyToFrontend(backendProperty)
      )

      if (isLoadMore) {
        setProperties(prev => [...prev, ...transformedProperties])
      } else {
        setProperties(transformedProperties)
        setPage(1)
      }

      // Check if there are more pages
      setHasMore(response.data.pagination.current < response.data.pagination.pages)
      
    } catch (err) {
      console.error('Failed to fetch properties:', err)
      setError('Failed to load properties. Please try again later.')
      if (!isLoadMore) {
        setProperties([])
      }
    } finally {
      setLoading(false)
    }
  }, [serverFilters, page])

  // Load more properties (pagination)
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      await fetchProperties(true)
    }
  }, [loading, hasMore, fetchProperties])

  // Refresh properties
  const refresh = useCallback(async () => {
    setPage(1)
    await fetchProperties(false)
  }, [fetchProperties])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setCurrentFilter("ambas")
    setFilters({
      priceRange: [3000, 50000],
      furnishing: "all",
      amenities: []
    })
    setSelectedZone("")
    setSortBy("newest")
  }, [])

  // Fetch properties when server filters change
  useEffect(() => {
    fetchProperties(false)
  }, [serverFilters])

  // Return state and actions
  return [
    {
      properties,
      filteredProperties,
      loading,
      error,
      currentFilter,
      filters,
      sortBy,
      selectedZone,
      hasMore,
      page
    },
    {
      setCurrentFilter,
      setFilters,
      setSortBy,
      setSelectedZone,
      loadMore,
      refresh,
      clearFilters
    }
  ]
} 