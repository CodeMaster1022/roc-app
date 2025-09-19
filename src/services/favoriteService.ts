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
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get favorites');
      }

      return data.data?.favorites || [];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      // Return cached favorites from localStorage as fallback
      return this.getCachedFavorites();
    }
  }

  // Add property to favorites
  async addFavorite(propertyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ propertyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add favorite');
      }

      if (data.success) {
        // Update local cache
        this.updateCachedFavorites(data.data?.favorites || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      // Fallback to local storage
      const favorites = this.getCachedFavorites();
      if (!favorites.includes(propertyId)) {
        favorites.push(propertyId);
        this.updateCachedFavorites(favorites);
      }
      return true;
    }
  }

  // Remove property from favorites
  async removeFavorite(propertyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove favorite');
      }

      if (data.success) {
        // Update local cache
        this.updateCachedFavorites(data.data?.favorites || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      // Fallback to local storage
      const favorites = this.getCachedFavorites();
      const updatedFavorites = favorites.filter(id => id !== propertyId);
      this.updateCachedFavorites(updatedFavorites);
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