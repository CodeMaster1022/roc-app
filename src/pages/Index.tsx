
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PropertyCard from "@/components/properties/PropertyCard"
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
import { Filter, Grid, List, Search, Map, Home as HomeIcon, SlidersHorizontal, ArrowUpDown, User, ChevronDown, LogIn, LogOut, Building } from "lucide-react"
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

// Import logo
import rocLogo from "@/assets/roc-logo.png"

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
    initialFilter: isMobile ? "propiedad" : "ambas",
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

  // Helper function to get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoriteIds = await favoriteService.getFavorites()
        setFavorites(favoriteIds)
      } catch (err) {
        console.error('Failed to load favorites:', err)
      }
    }

    loadFavorites()
  }, [])





  const handleFavoriteToggle = async (propertyId: string) => {
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
      // Still update local state as fallback
      setFavorites(prev => 
        prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      )
      
      // Show error toast
      toast({
        title: t('favorites.error_title'),
        description: t('favorites.error_description'),
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`)
  }

  const handleSectionChange = (section: string) => {
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

  const FilterContent = () => (
    <FilterSection
      currentFilter={currentFilter}
      onFilterChange={setCurrentFilter}
      isMobile={isMobile}
    />
  )

  const renderContent = () => {
    switch (currentSection) {
      case "favoritos":
        return (
          <FavoritesList
            favoriteIds={favorites}
            onRemoveFavorite={handleFavoriteToggle}
            onViewDetails={handleViewDetails}
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
            <main className="flex-1 animate-slide-up max-w-8xl mx-auto bg-gray-100 px-2 sm:px-84 md:px-8">
              {/* Header de resultados - Mobile */}
              {isMobile && currentSection === "inicio" && (
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-white">
                      <HomeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {filteredProperties.length} {currentFilter === "propiedad" ? t('results.properties_available') : t('results.rooms_available')}
                      </h2>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('filter.sort_by')}</span>
                  </button>  
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
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading properties...</span>
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

              {/* Grid/List de propiedades */}
              {!loading && !error && viewMode !== "map" && (
                <div className={`grid gap-4 ${
                  isMobile ? "grid-cols-1 px-4" : 
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
              {!loading && !error && filteredProperties.length === 0 && (
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
            </main>

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
                  {[
                    { id: "hogar", label: t('nav.hogar') },
                    { id: "inicio", label: t('nav.inicio') },
                    // { id: "contratos", label: "Contratos" },
                    { id: "favoritos", label: t('nav.favoritos') }
                    
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
                  
                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`flex items-center gap-2 transition-colors ${
                        currentSection === "perfil" 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      }`}>
                        {isAuthenticated && user ? (
                          <>
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.profile?.avatar} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline">{user.name}</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            <span>{t('nav.perfil')}</span>
                          </>
                        )}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {isAuthenticated ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => handleSectionChange("perfil")}>
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('profile.login')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open('https://preview--hoster-haven.lovable.app/', '_blank')}>
                            <Building className="mr-2 h-4 w-4" />
                            {t('profile.register_property')}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>{t('profile.language')}</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={language} onValueChange={(val) => setLanguage(val as 'es' | 'en')}>
                        <DropdownMenuRadioItem value="es">{t('language.spanish')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">{t('language.english')}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              </div>
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && currentSection === "inicio" && (
        <header className="bg-background sticky top-0 z-40 px-4 py-3 md:hidden">
          {/* Search bar with map icon */}
          <div className="flex items-center gap-3 mb-4">
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
          
          {/* Property type toggle buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentFilter("propiedad")}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                currentFilter === "propiedad"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Propiedades
            </button>
            <button
              onClick={() => setCurrentFilter("habitacion")}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                currentFilter === "habitacion"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Habitaciones
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
    </div>
  )
}

export default Index