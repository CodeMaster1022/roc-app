import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePropertyFilters, type PropertyFiltersState } from '@/hooks/usePropertyFilters';
import PropertyCard from "@/components/properties/PropertyCard";
import MobilePropertyCard from "@/components/properties/MobilePropertyCard";
import MobileRoomCard from "@/components/properties/MobileRoomCard";
import FilterSection from "@/components/filters/FilterSection";
import ZoneSearchModal from "@/components/modals/ZoneSearchModal";
import PriceFilterModal, { type FilterState } from "@/components/modals/PriceFilterModal";
import SortModal from "@/components/modals/SortModal";
import { RocButton } from "@/components/ui/roc-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { favoriteService } from "@/services/favoriteService";
import { useToast } from "@/hooks/use-toast";
import { DirectMapboxMap } from "@/components/map/DirectMapboxMap";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Filter, Grid, List, Search, Map, SlidersHorizontal, ArrowUpDown, ArrowLeft, User, ChevronDown, LogIn, LogOut, Building, Languages, Bed } from "lucide-react"

// Import logo
import rocLogo from "@/assets/roc-logo.png"

const PropertiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  
  const initialFilterType = location.state?.filterType || 'ambas';

  const [
    {
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
    initialFilter: initialFilterType,
    initialFilters: {
      priceRange: [1000, 50000],
      furnishing: "all",
      amenities: []
    },
    initialSortBy: "newest",
    initialZone: ""
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("properties");

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
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites.",
      })
      navigate('/signin')
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
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleSectionChange = (section: string) => {
    if (section === "inicio") {
      navigate('/')
      return
    }
    // Handle other sections if needed
    setCurrentSection(section)
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    })
    navigate('/')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const FilterContent = () => {
    // Determine which filter options to hide based on current filter
    let hideOptions: string[] = []
    
    if (isMobile) {
      // On mobile, hide irrelevant options when viewing specific types
      if (currentFilter === 'propiedad') {
        hideOptions = ['ambas', 'habitacion'] // Hide "Both" and "Rooms" when viewing Properties
      } else if (currentFilter === 'habitacion') {
        hideOptions = ['ambas', 'propiedad'] // Hide "Both" and "Properties" when viewing Rooms
      }
      // When currentFilter is 'ambas', don't hide any options
    }

    return (
      <FilterSection
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        isMobile={isMobile}
        hideOptions={hideOptions}
      />
    )
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      {!isMobile && (
        <header className="bg-background border-b border-border sticky top-0 z-40 hidden md:block">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                aria-label="Ir al inicio"
                className="focus:outline-none"
              >
                <img src={rocLogo} alt="ROC: Ir al inicio" className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" loading="lazy" />
              </button>
              
              <nav className="flex space-x-6">
                {isAuthenticated ? (
                  // Authenticated user navigation
                  [
                    { id: "inicio", label: t('nav.inicio') },
                    { id: "favoritos", label: t('nav.favoritos') },
                    { id: "hogar", label: t('nav.hogar') }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`transition-colors ${
                        item.id === "inicio" 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  // Unauthenticated user navigation - simpler
                  <>
                    <button
                      onClick={() => navigate('/')}
                      className="text-primary font-semibold transition-colors"
                    >
                      {t('nav.inicio')}
                    </button>
                    <button
                      onClick={() => navigate('/signin')}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      Sign In
                    </button>
                  </>
                )}
                
                {/* Profile/Language Dropdown */}
                {isAuthenticated ? (
                  // Authenticated user dropdown
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
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
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        {t('profile.view_profile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
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
                  // Unauthenticated user - just language dropdown
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <Languages className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {language === 'es' ? 'Español' : 'English'}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>{t('profile.language')}</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={language} onValueChange={(val) => setLanguage(val as 'es' | 'en')}>
                        <DropdownMenuRadioItem value="es">🇪🇸 {t('language.spanish')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">🇺🇸 {t('language.english')}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/signin')}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-background sticky top-0 z-40 px-4 py-3 md:hidden">
          {/* Back button and Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                All Properties
              </h1>
            </div>
            
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

          {/* Mobile Search bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative" onClick={() => setZoneModalOpen(true)}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <div className="w-full pl-10 pr-4 py-3 rounded-full bg-muted border-0 text-sm cursor-pointer">
                {selectedZone || t('search.mobile_placeholder')}
              </div>
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
          <div className="flex-1 animate-slide-up max-w-8xl mx-auto bg-gray-100 px-2 sm:px-4 md:px-8 min-h-[80vh] pb-12">
            {/* Search and filters - Desktop only */}
            {!isMobile && (
              <div className="space-y-4 animate-slide-up py-4">
                <div className="relative cursor-pointer max-w-4xl mx-auto" onClick={() => setZoneModalOpen(true)}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border-0 text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                    {selectedZone || t('search.placeholder')}
                  </div>
                </div>
                <div className="pt-2 pb-8 max-w-4xl mx-auto">
                  <FilterContent />
                </div>
                <div className="flex items-center gap-3 bg-gray-100 pt-8 pb-4 max-w-8xl mx-auto px-2 sm:px-4 md:px-8">
                  <div className="flex justify-between w-full">
                    <div className="flex items-center gap-3">
                      <RocButton variant="outline" onClick={() => setPriceFilterOpen(true)} className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros {(filters.furnishing !== "all" || filters.amenities.length > 0) && <span className="ml-1 text-xs">({(filters.furnishing !== "all" ? 1 : 0) + filters.amenities.length})</span>}
                      </RocButton>
                      <RocButton variant="outline" onClick={() => setSortModalOpen(true)} className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Ordenar por
                      </RocButton>
                    </div>
                    <div className="flex items-center gap-3">
                      <RocButton variant={viewMode === "grid" ? "selected" : "ghost"} size="icon" onClick={() => setViewMode("grid")} title={t('map.list_view')}>
                        <Grid className="h-4 w-4" />
                      </RocButton>
                      <RocButton variant={viewMode === "list" ? "selected" : "ghost"} size="icon" onClick={() => setViewMode("list")} title={t('map.list_view')}>
                        <List className="h-4 w-4" />
                      </RocButton>
                      <RocButton variant={viewMode === "map" ? "selected" : "ghost"} size="icon" onClick={() => setViewMode("map")} title={t('map.view_on_map')}>
                        <Map className="h-4 w-4" />
                      </RocButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile filters */}
            {isMobile && (
              <div className="px-4 py-4">
                <FilterContent />
              </div>
            )}
            
            {/* Content */}
            {loading && (
              <div className="flex justify-center items-center py-12 h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading properties...</span>
              </div>
            )}
            {error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Error loading properties</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <RocButton onClick={refresh}>Try Again</RocButton>
              </div>
            )}

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

            {/* Mobile view - Separate properties and rooms sections */}
            {isMobile && !loading && !error && viewMode !== "map" && (
              <div className="space-y-8 pb-6">
                {/* Properties Section */}
                {filteredProperties.filter(item => item.type === 'propiedad').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6 px-4 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary text-white">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground leading-tight">
                            {filteredProperties.filter(item => item.type === 'propiedad').length} {filteredProperties.filter(item => item.type === 'propiedad').length === 1 ? 'Property Available' : 'Properties Available'}
                          </h2>
                          <p className="text-sm text-muted-foreground">Complete properties</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Properties Grid */}
                    <div className="space-y-4 px-4">
                      {filteredProperties.filter(item => item.type === 'propiedad').map((property, index) => (
                        <div 
                          key={property.id} 
                          className="animate-fade-in"
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
                )}
                
                {/* Rooms Section */}
                {filteredProperties.filter(item => item.type === 'habitacion').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6 px-4 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary text-white">
                          <Bed className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground leading-tight">
                            {filteredProperties.filter(item => item.type === 'habitacion').length} {filteredProperties.filter(item => item.type === 'habitacion').length === 1 ? 'Room Available' : 'Rooms Available'}
                          </h2>
                          <p className="text-sm text-muted-foreground">Individual rooms</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rooms Grid */}
                    <div className="space-y-3 px-4">
                      {filteredProperties.filter(item => item.type === 'habitacion').map((room, index) => (
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

            {/* Desktop Grid/List view */}
            {!isMobile && !loading && !error && viewMode !== "map" && (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filteredProperties.map((property, index) => (
                  <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
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

            {!loading && !error && hasMore && (
              <div className="text-center py-8">
                <RocButton onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </RocButton>
              </div>
            )}

            {/* Mobile empty state */}
            {isMobile && !loading && !error && filteredProperties.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">{t('results.no_properties')}</h3>
                <p className="text-muted-foreground mb-4">{t('results.no_properties_subtitle')}</p>
                <RocButton onClick={clearFilters}>{t('filter.clear_filters')}</RocButton>
              </div>
            )}

            {/* Desktop empty state */}
            {!isMobile && !loading && !error && filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">{t('results.no_properties')}</h3>
                <p className="text-muted-foreground mb-4">{t('results.no_properties_subtitle')}</p>
                <RocButton onClick={clearFilters}>{t('filter.clear_filters')}</RocButton>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation currentSection={currentSection} onSectionChange={handleSectionChange} />
      )}

      {/* Modals */}
      <ZoneSearchModal open={zoneModalOpen} onOpenChange={setZoneModalOpen} onZoneSelect={setSelectedZone} selectedZone={selectedZone} />
      <PriceFilterModal open={priceFilterOpen} onOpenChange={setPriceFilterOpen} filters={filters} onFiltersChange={setFilters} />
      <SortModal open={sortModalOpen} onOpenChange={setSortModalOpen} sortBy={sortBy} onSortChange={setSortBy} />
    </div>
  );
};

export default PropertiesPage; 