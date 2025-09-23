import { API_CONFIG, getAuthHeaders } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface FavoriteResponse {
  success: boolean;
  data?: {
    favorites: string[];
  };
  message?: string;
}

class FavoriteService {
  // Get user's favorite property IDs
  async getFavorites(): Promise<string[]> {
    try {
      console.log('🔍 Getting favorites from API...')
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📡 Favorites API response status:', response.status)
      const data = await response.json();
      console.log('📡 Favorites API response data:', data)

      if (!response.ok) {
        console.warn('⚠️ Favorites API failed:', data.message)
        throw new Error(data.message || 'Failed to get favorites');
      }

      let favorites = data.data?.favorites || [];
      
      // TEMPORARY WORKAROUND: Handle malformed backend response
      // Backend is returning full objects as strings instead of IDs
      if (favorites.length > 0 && typeof favorites[0] === 'string' && favorites[0].includes('_id:')) {
        console.log('🔧 Applying workaround for malformed backend response')
        favorites = favorites.map((fav: string) => {
          // Extract ObjectId from malformed string
          const match = fav.match(/_id: new ObjectId\('([^']+)'\)/);
          return match ? match[1] : fav;
        }).filter((id: string) => id && id.length === 24); // Valid ObjectId length
      }
      
      console.log('✅ Favorites loaded from API:', favorites)
      
      // Update cache with fresh data from server
      this.updateCachedFavorites(favorites);
      return favorites;
    } catch (error) {
      console.error('❌ Failed to get favorites from API:', error);
      // Return cached favorites from localStorage as fallback
      const cachedFavorites = this.getCachedFavorites();
      console.log('📦 Using cached favorites:', cachedFavorites);
      return cachedFavorites;
    }
  }

  // Add property to favorites
  async addFavorite(propertyId: string): Promise<boolean> {
    console.log('➕ Adding favorite:', propertyId)
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ propertyId }),
      });

      console.log('📡 Add favorite API response status:', response.status)
      const data = await response.json();
      console.log('📡 Add favorite API response data:', data)

      if (!response.ok) {
        console.warn('⚠️ Add favorite API failed:', data.message)
        throw new Error(data.message || 'Failed to add favorite');
      }

      if (data.success) {
        console.log('✅ Favorite added successfully via API')
        // Update local cache
        this.updateCachedFavorites(data.data?.favorites || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add favorite via API:', error);
      // Fallback to local storage
      const favorites = this.getCachedFavorites();
      if (!favorites.includes(propertyId)) {
        favorites.push(propertyId);
        this.updateCachedFavorites(favorites);
        console.log('📦 Favorite added to cache as fallback')
      }
      return true;
    }
  }

  // Remove property from favorites
  async removeFavorite(propertyId: string): Promise<boolean> {
    console.log('➖ Removing favorite:', propertyId)
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('📡 Remove favorite API response status:', response.status)
      const data = await response.json();
      console.log('📡 Remove favorite API response data:', data)

      if (!response.ok) {
        console.warn('⚠️ Remove favorite API failed:', data.message)
        throw new Error(data.message || 'Failed to remove favorite');
      }

      if (data.success) {
        console.log('✅ Favorite removed successfully via API')
        // Update local cache
        this.updateCachedFavorites(data.data?.favorites || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to remove favorite via API:', error);
      // Fallback to local storage
      const favorites = this.getCachedFavorites();
      const updatedFavorites = favorites.filter(id => id !== propertyId);
      this.updateCachedFavorites(updatedFavorites);
      console.log('📦 Favorite removed from cache as fallback')
      return true;
    }
  }

  // Toggle favorite status
  async toggleFavorite(propertyId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    const isFavorite = favorites.includes(propertyId);
    
    if (isFavorite) {
      return await this.removeFavorite(propertyId);
    } else {
      return await this.addFavorite(propertyId);
    }
  }

  // Check if property is favorite
  async isFavorite(propertyId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(propertyId);
  }

  // Local storage fallback methods
  private getCachedFavorites(): string[] {
    try {
      const cached = localStorage.getItem('roc_favorites');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached favorites:', error);
      return [];
    }
  }

  private updateCachedFavorites(favorites: string[]): void {
    try {
      localStorage.setItem('roc_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to cache favorites:', error);
    }
  }

  // Clear all favorites (for logout)
  clearCache(): void {
    try {
      localStorage.removeItem('roc_favorites');
    } catch (error) {
      console.error('Failed to clear favorite cache:', error);
    }
  }
}

export const favoriteService = new FavoriteService(); 