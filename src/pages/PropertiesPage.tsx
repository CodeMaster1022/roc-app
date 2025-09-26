import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';

const PropertiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFilterType = location.state?.filterType || 'ambas';

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
    initialFilter: initialFilterType,
    initialFilters: {
      priceRange: [1000, 50000],
      furnishing: "all",
      amenities: []
    },
    initialSortBy: "newest",
    initialZone: ""
  });

  return (
    <div>
      <h1>All Properties</h1>
      {/* Search, filters, and properties list will go here */}
    </div>
  );
};

export default PropertiesPage; 