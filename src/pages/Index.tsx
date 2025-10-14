
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PropertyCard from "@/components/properties/PropertyCard"
import MobilePropertyCard from "@/components/properties/MobilePropertyCard"
import MobileRoomCard from "@/components/properties/MobileRoomCard"
import FilterSection from "@/components/filters/FilterSection"
import FavoritesList from "@/components/sections/FavoritesList"
import HomeDashboard from "@/components/sections/HomeDashboard"
import UserProfile from "@/components/sections/UserProfile"
import ContractsDashboard from "@/components/contracts/ContractsDashboard"
import ZoneSearchModal from "@/components/modals/ZoneSearchModal"
import PriceFilterModal, { type FilterState } from "@/components/modals/PriceFilterModal"
import SortModal from "@/components/modals/SortModal"
import { RocButton } from "@/components/ui/roc-button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Filter, Grid, List, Search, Map, Home as HomeIcon, SlidersHorizontal, ArrowUpDown, User, ChevronDown, LogIn, LogOut, Building, Bed, Languages, Facebook, Instagram, Linkedin, ExternalLink } from "lucide-react"
import { zones, type Property } from "@/data/mockProperties"
import { useIsMobile } from "@/hooks/use-mobile"
import MobileNavigation from "@/components/layout/MobileNavigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { favoriteService } from "@/services/favoriteService"
import { useToast } from "@/hooks/use-toast"
import { PropertyMapView } from "@/components/map/PropertyMapView"
import { MobileMapView } from "@/components/map/MobileMapView"
import { DirectMapboxMap } from "@/components/map/DirectMapboxMap"
import { usePropertyFilters } from "@/hooks/usePropertyFilters"

// Import logo and images
import rocLogo from "@/assets/roc-logo.png"
import buildingHero from "@/assets/Video-wrappper.png"
import AuthPromptModal from "@/components/modals/AuthPromptModal"
import { TermsModal } from "@/components/modals/TermsModal"
import { PrivacyModal } from "@/components/modals/PrivacyModal"
const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Index = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { t, language, setLanguage } = useLanguage()
  const { logout, isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  
  // Use the new property filters hook
  const [
    {
      properties,
      filteredProperties,
      loading,
      error,
      currentFilter,
      filters,
      sortBy,
      selectedZone,
      hasMore
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
  ] = usePropertyFilters({
    initialFilter: "ambas", // Always load both types for mobile separation
    initialFilters: {
      priceRange: [1000, 50000],
      furnishing: "all",
      amenities: []
    },
    initialSortBy: "newest",
    initialZone: ""
  })

  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [currentSection, setCurrentSection] = useState("inicio")
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [priceFilterOpen, setPriceFilterOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [showFavoriteAuthPrompt, setShowFavoriteAuthPrompt] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  // Helper function to get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Load favorites on mount (only if authenticated)
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites([])
        return
      }

      try {
        const favoriteIds = await favoriteService.getFavorites()
        setFavorites(favoriteIds)
      } catch (err) {
        console.error('Failed to load favorites:', err)
        setFavorites([])
      }
    }

    loadFavorites()
  }, [isAuthenticated])





  const handleFavoriteToggle = async (propertyId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowFavoriteAuthPrompt(true)
      return
    }

    const wasAdding = !favorites.includes(propertyId)
    
    try {
      const success = await favoriteService.toggleFavorite(propertyId)
      if (success) {
        // Update local state
        setFavorites(prev => 
          prev.includes(propertyId) 
            ? prev.filter(id => id !== propertyId)
            : [...prev, propertyId]
        )
        
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

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`)
  }

  const handleSectionChange = (section: string) => {
    // Only profile section requires authentication now - favorites and household are accessible for all users
    if (section === "perfil" && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your profile.",
      })
      navigate('/signin')
      return
    }
    
    setCurrentSection(section)
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    })
    // Navigate to home section
    setCurrentSection("inicio")
  }

  const handleViewAllClick = (filterType: "propiedad" | "habitacion") => {
    navigate('/properties', { state: { filterType } });
  };

  const FilterContent = () => (
    <FilterSection
      currentFilter={currentFilter}
      onFilterChange={setCurrentFilter}
      isMobile={isMobile}
    />
  )

  // Separate properties and rooms for mobile view
  const propertiesOnly = filteredProperties.filter(item => item.type === 'propiedad')
  const roomsOnly = filteredProperties.filter(item => item.type === 'habitacion')
  
  const renderContent = () => {
    switch (currentSection) {
      case "favoritos":
        return (
          <FavoritesList
            favoriteIds={favorites}
            onRemoveFavorite={handleFavoriteToggle}
            onViewDetails={handleViewDetails}
            onShowAuthPrompt={() => setShowFavoriteAuthPrompt(true)}
          />
        )
      
      case "hogar":
        return <HomeDashboard />
      
      case "contratos":
        return <ContractsDashboard />
      
      case "perfil":
        return <UserProfile />
      
      default: // inicio
        return (
          <>
            {/* Hero Section - Solo Desktop */}
            {!isMobile && (
              <section className="text-center py-12 mb-6 animate-fade-in mx-4">
                <div className="container mx-auto px-4">
                  <h1 className="text-3xl md:text-[48px] font-bold mb-3 text-black">
                    {t('hero.title').split(' ').map((word, index, array) => 
                      index >= array.length - 2 ? (
                        <span key={index} className="text-[#8B227D]">{word} </span>
                      ) : (
                        <span key={index}>{word} </span>
                      )
                    )}
                  </h1>
                  <p className="text-lg text-gray-900 mb-4 max-w-2xl mx-auto">
                    {t('hero.subtitle')}
                  </p>
                </div>
              </section>
            )}

            {/* Buscador y filtros - Desktop */}
            {!isMobile && (
              <div className="space-y-4 animate-slide-up">
                {/* Buscador de zonas */}
                <div 
                  className="relative cursor-pointer max-w-4xl mx-auto"
                   onClick={() => setZoneModalOpen(true)}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border-0 text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                    {selectedZone || t('search.placeholder')}
                  </div>
                </div>           
                <div className="pt-2 pb-8 max-w-4xl mx-auto">
                    <FilterContent />
                </div>
                {/* Botones de acciones y filtros */}
                <div className="flex items-center gap-3 bg-gray-100 pt-8 pb-4 max-w-8xl mx-auto px-2 sm:px-4 md:px-8">
                  <div className="flex justify-between w-full">
                    <div className="flex items-center gap-3">
                      <RocButton
                        variant="outline"
                        onClick={() => setPriceFilterOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros {(filters.furnishing !== "all" || filters.amenities.length > 0) && <span className="ml-1 text-xs">({(filters.furnishing !== "all" ? 1 : 0) + filters.amenities.length})</span>}
                      </RocButton>
                      <RocButton
                        variant="outline"
                        onClick={() => setSortModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        Ordenar por
                      </RocButton>
                    </div>
                    <div className="flex items-center gap-3">
                    <RocButton
                      variant={viewMode === "grid" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      title={t('map.list_view')}
                    >
                      <Grid className="h-4 w-4" />
                    </RocButton>
                    <RocButton
                      variant={viewMode === "list" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      title={t('map.list_view')}
                    >
                      <List className="h-4 w-4" />
                    </RocButton>
                    <RocButton
                      variant={viewMode === "map" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("map")}
                      title={t('map.view_on_map')}
                    >
                      <Map className="h-4 w-4" />
                    </RocButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido principal */}
            <main className="flex-1 animate-slide-up max-w-8xl mx-auto bg-gray-100 px-2 sm:px-84 md:px-8 min-h-[80vh] pb-12">
              {/* Mobile view - Show both properties and rooms sections */}
              {isMobile && currentSection === "inicio" && (
                <div className="space-y-8 pb-6">
                  {/* Properties Section - Horizontal Scroll */}
                  {propertiesOnly.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 px-4 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary text-white">
                            <HomeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">
                              {propertiesOnly.length} {propertiesOnly.length === 1 ? 'Property Available' : 'Properties Available'}
                            </h2>
                            <p className="text-sm text-muted-foreground">Complete properties</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleViewAllClick('propiedad')}
                          className="flex items-center gap-2 text-muted-foreground px-2"
                        >
                          <Filter className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('tenants.view_all')}</span>
                        </button>  
                      </div>
                      
                      {/* Properties Horizontal Scroll */}
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4 px-4 pb-2">
                          {propertiesOnly.map((property, index) => (
                            <div 
                              key={property.id} 
                              className="flex-shrink-0 w-[85vw] animate-fade-in"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <MobilePropertyCard
                                id={property.id}
                                title={property.title}
                                image={property.image}
                                price={property.price}
                                type={property.type}
                                propertyType={property.propertyType}
                                area={property.area}
                                bedrooms={property.bedrooms}
                                allowsPets={property.allowsPets}
                                location={property.zone}
                                isFavorite={favorites.includes(property.id)}
                                isAvailable={property.isAvailable}
                                onFavoriteToggle={handleFavoriteToggle}
                                onViewDetails={handleViewDetails}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Rooms Section - Vertical Scroll */}
                  {roomsOnly.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 px-4 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary text-white">
                            <Bed className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">
                              {roomsOnly.length} {roomsOnly.length === 1 ? 'Room Available' : 'Rooms Available'}
                            </h2>
                            <p className="text-sm text-muted-foreground">Individual rooms</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleViewAllClick('habitacion')}
                          className="flex items-center gap-2 text-muted-foreground px-2"
                        >
                          <Filter className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('tenants.view_all')}</span>
                        </button>  
                      </div>
                      
                      {/* Rooms Vertical List */}
                      <div className="space-y-3 px-4">
                        {roomsOnly.map((room, index) => (
                          <div 
                            key={room.id} 
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <MobileRoomCard
                              id={room.id}
                              title={room.title}
                              image={room.image}
                              price={room.price}
                              type={room.type}
                              propertyType={room.propertyType}
                              area={room.area}
                              bedrooms={room.bedrooms}
                              allowsPets={room.allowsPets}
                              bathType={room.bathType}
                              scheme={room.scheme}
                              location={room.zone}
                              isFavorite={favorites.includes(room.id)}
                              isAvailable={room.isAvailable}
                              onFavoriteToggle={handleFavoriteToggle}
                              onViewDetails={handleViewDetails}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Header de resultados - Desktop */}
              {/* {!isMobile && (
                <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {filteredProperties.length} {t('results.properties_available')}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentFilter === "ambas" ? t('results.showing_all')
                     : currentFilter === "propiedad" ? t('results.complete_properties')
                     : t('results.individual_rooms')}
                  </p>
                </div>
                </div>
              )} */}

              {!isMobile && (
                <div className="flex items-center justify-end mb-6">
                  {/* Cambio de vista - Desktop only */}
                  {/* <div className="flex border rounded-lg">
                    <RocButton
                      variant={viewMode === "grid" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      title={t('map.list_view')}
                    >
                      <Grid className="h-4 w-4" />
                    </RocButton>
                    <RocButton
                      variant={viewMode === "list" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      title={t('map.list_view')}
                    >
                      <List className="h-4 w-4" />
                    </RocButton>
                    <RocButton
                      variant={viewMode === "map" ? "selected" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("map")}
                      title={t('map.view_on_map')}
                    >
                      <Map className="h-4 w-4" />
                    </RocButton>
                  </div> */}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col justify-center items-center py-20 min-h-[60vh]">
                  <div className="relative">
                    {/* Outer spinning ring */}
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
                    {/* Inner pulsing circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-6 text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Loading properties...</p>
                    <p className="text-sm text-muted-foreground">Finding the best options for you</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2">Error loading properties</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <RocButton onClick={refresh}>
                    Try Again
                  </RocButton>
                </div>
              )}

              {/* Map View */}
              {!loading && !error && viewMode === "map" && (
                <div className="animate-fade-in">
                  <DirectMapboxMap
                    properties={filteredProperties}
                    favorites={favorites}
                    onFavoriteToggle={handleFavoriteToggle}
                    onPropertySelect={handleViewDetails}
                    selectedZone={selectedZone}
                    onZoneChange={setSelectedZone}
                  />
                </div>
              )}

              {/* Grid/List de properties - Desktop only */}
              {!loading && !error && viewMode !== "map" && !isMobile && (
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {filteredProperties.map((property, index) => (
                  <div 
                    key={property.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PropertyCard
                      height="300px"
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
                      isFavorite={favorites.includes(property.id)}
                      isAvailable={property.isAvailable}
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && filteredProperties.length === 0 && !isMobile && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold mb-2">{t('results.no_properties')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('results.no_properties_subtitle')}
                  </p>
                  <RocButton onClick={clearFilters}>
                    {t('filter.clear_filters')}
                  </RocButton>
                </div>
              )}

              {/* Empty state for mobile */}
              {!loading && !error && isMobile && currentSection === "inicio" && 
               propertiesOnly.length === 0 && roomsOnly.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold mb-2">{t('results.no_properties')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('results.no_properties_subtitle')}
                  </p>
                  <RocButton onClick={clearFilters}>
                    {t('filter.clear_filters')}
                  </RocButton>
                </div>
              )}

              {/* Additional sections for desktop only */}
            </main>
            {!isMobile && (
                <>
                  {/* Image + Text Block Section */}
                  <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        {/* Left: Text Content */}
                        <div className="space-y-6">
                          <div className="w-12 h-1 bg-primary rounded-full"></div>
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                            A space that inspires, choose how you want to live.
                          </h2>
                          <div className="space-y-4 text-gray-600">
                            <p className="text-lg font-medium text-primary">
                              Your environment matters. When a space inspires you, it transforms the way you live, grow, and dream.
                            </p>
                          </div>
                        </div>
                        
                        {/* Right: Image */}
                        <div className="relative">
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                            <img 
                              src={buildingHero} 
                              alt="Beautiful residential building with lush greenery"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          {/* Decorative element */}
                          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* CTA Section */}
                  <section className="py-8 bg-gray-50">
                    <div className="container mx-auto px-4 md:px-8 text-center rounded-sm">
                      <div className="flex space-y-8">
                        <div className="space-y-4">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 ">
                            The change you've been waiting for <br/>starts today
                          </h2>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row pb-6 justify-center mx-auto ">
                          <button 
                            className="px-8 py-1 text-lg font-semibold bg-primary text-white rounded-sm"
                            onClick={() => navigate('/properties')}
                          >
                            View All
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}


            {/* Modales */}
            <ZoneSearchModal
              open={zoneModalOpen}
              onOpenChange={setZoneModalOpen}
              onZoneSelect={setSelectedZone}
              selectedZone={selectedZone}
            />
            
            <PriceFilterModal
              open={priceFilterOpen}
              onOpenChange={setPriceFilterOpen}
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <SortModal
              open={sortModalOpen}
              onOpenChange={setSortModalOpen}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      {!isMobile && (
        <header className="bg-background border-b border-border sticky top-0 z-40 hidden md:block">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    handleSectionChange("inicio")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  aria-label="Ir al inicio"
                  className="focus:outline-none"
                >
                  <img src={rocLogo} alt="ROC: Ir al inicio" className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" loading="lazy" />
                </button>
                
                <nav className="flex space-x-6">
                  {/* Navigation - same for all users to maintain product feel */}
                  {[
                    { id: "inicio", label: t('nav.inicio') },
                    { id: "favoritos", label: t('nav.favoritos') },
                    { id: "hogar", label: t('nav.hogar') }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`transition-colors ${
                        currentSection === item.id 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}

                  
                  {/* Profile/Language Dropdown - Different for authenticated vs unauthenticated */}
                  {isAuthenticated ? (
                    // Authenticated user dropdown
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-2 transition-colors ${
                          currentSection === "perfil" 
                            ? "text-primary font-semibold" 
                            : "text-foreground hover:text-primary"
                        }`}>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
                            <AvatarFallback className="text-xs">
                              {user?.name ? getUserInitials(user.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline">{user?.name}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => handleSectionChange("perfil")}>
                          <User className="mr-2 h-4 w-4" />
                          {t('profile.view_profile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSectionChange("perfil")}>
                          <Building className="mr-2 h-4 w-4" />
                          {t('profile.dashboard')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('profile.logout')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t('profile.language')}</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={language} onValueChange={(val) => setLanguage(val as 'es' | 'en')}>
                          <DropdownMenuRadioItem value="es">{t('language.spanish')}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="en">{t('language.english')}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    // Unauthenticated user - profile split button with three options
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                          <User className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            Profile
                          </span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => navigate('/signin')}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In / Sign Up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open('/hoster/signin', '_blank', 'noopener,noreferrer')}>
                          <Building className="mr-2 h-4 w-4" />
                          Register Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t('profile.language')}</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={language} onValueChange={(val) => setLanguage(val as 'es' | 'en')}>
                          <DropdownMenuRadioItem value="es">🇪🇸 {t('language.spanish')}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="en">🇺🇸 {t('language.english')}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </nav>
              </div>
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && currentSection === "inicio" && (
        <header className="bg-background sticky top-0 z-40 px-4 py-3 md:hidden">
          {/* Logo and User Info */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                handleSectionChange("inicio")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="focus:outline-none"
            >
              <img src={rocLogo} alt="ROC" className="h-8 w-auto" />
            </button>
            
            {/* User info or language selector */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.profile?.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Languages className="h-4 w-4" />
                {language === 'es' ? 'Español' : 'English'}
              </button>
            )}
          </div>

          {/* Search bar with map icon */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.mobile_placeholder')}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-muted border-0 text-sm"
              />
            </div>
            <button 
              className={`p-3 rounded-lg transition-colors ${
                viewMode === "map" ? "bg-primary text-white" : "bg-muted text-foreground"
              }`}
              onClick={() => setViewMode(viewMode === "map" ? "grid" : "map")}
              title={viewMode === "map" ? t('map.list_view') : t('map.view_on_map')}
            >
              <Map className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}
      
      <main className={`${isMobile ? 'pb-20' : ''}`}>
        <div className={`${isMobile ? '' : 'container mx-auto px-4 py-6'}`}>
          {renderContent()}
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation currentSection={currentSection} onSectionChange={handleSectionChange} />
      )}

      {/* Favorite Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showFavoriteAuthPrompt}
        onClose={handleFavoriteAuthClose}
        onLogin={handleFavoriteAuthLogin}
        title="Save to Favorites?"
        description="Sign in to save properties to your favorites and access them from any device."
        actionText="Sign In to Save"
      />

      {/* Terms and Privacy Modals */}
      <TermsModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
      />
      
      <PrivacyModal
        open={privacyModalOpen}
        onOpenChange={setPrivacyModalOpen}
      />

      {/* Footer */}
      {!isMobile && (
      <footer className="bg-footer py-12">
        <div className="container mx-auto px-6">
          {/* Main footer content */}
          <div className="flex justify-between items-start mb-4">
            {/* Links section */}
                         <div>
               <h3 className="font-medium text-foreground mb-4">Links</h3>
               <div className="space-y-3">
                 <button 
                   onClick={() => setTermsModalOpen(true)}
                   className="block text-footer-link hover:text-foreground transition-colors duration-200 text-left"
                 >
                   Terms and conditions
                 </button>
                 <button 
                   onClick={() => setPrivacyModalOpen(true)}
                   className="block text-footer-link hover:text-foreground transition-colors duration-200 text-left"
                 >
                   Privacy notice
                 </button>
               </div>
             </div>
          </div>
          <div className="flex space-x-4 justify-end mb-4">
             <a 
               href="https://www.facebook.com/share/1CQFt3UGNx/?mibextid=wwXIfr" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-footer-text hover:text-foreground transition-colors duration-200 bg-gray-100 p-1 rounded-full shadow-lg"
               aria-label="Facebook - ROC"
             >
               <Facebook className="w-5 h-5" />
             </a>
             <a 
               href="https://www.instagram.com/roc.space?igsh=MWo1MWVhN3h5ZDJ6eA==" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-footer-text hover:text-foreground transition-colors duration-200 bg-gray-100 p-1 rounded-full shadow-lg"
               aria-label="Instagram - ROC (@roc.space)"
             >
               <Instagram className="w-5 h-5" />
             </a>
             <a 
               href="https://www.tiktok.com/@roc.space?_t=ZS-902Ax8sf3TU&_r=1" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-footer-text hover:text-foreground transition-colors duration-200 bg-gray-100 p-1 rounded-full shadow-lg"
               aria-label="TikTok - ROC on TikTok"
             >
               <TikTokIcon />
             </a>
             <a 
               href="https://www.linkedin.com/company/roc-space/"
               target="_blank"
               rel="noopener noreferrer"
               className="text-footer-text hover:text-foreground transition-colors duration-200 bg-gray-100 p-1 rounded-full shadow-lg"
               aria-label="LinkedIn - ROC"
             >
               <Linkedin className="w-5 h-5" />
             </a>
           </div>

          {/* Copyright */}
          <div className="border-t border-border py-4">
            <p className="text-footer-copyright text-sm">
              Copyright © 2025 ROC - All rights reserved.
            </p>
          </div>

          {/* Mission statement */}
          <div className="">
            <p className="text-footer-text leading-relaxed">
              Our mission is clear: <span className="text-primary font-medium">"Make the world your home."</span> Step by step, we are building a path toward that goal. Today we offer you rooms and properties in the best locations, but this is only the beginning. We are building something bigger, for you.
            </p>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}

export default Index