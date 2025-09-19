import { API_CONFIG, getAuthHeaders, getMultipartHeaders } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface PropertyLocation {
  address: string;
  lat: number;
  lng: number;
  zone: string;
}

export interface PropertyPricing {
  totalPrice: number;
  rentalType: 'completa' | 'habitaciones' | 'ambos';
}

export interface PropertyRules {
  pets: boolean;
  smoking: boolean;
  parties: boolean;
  meetings?: {
    allowed: boolean;
    schedule?: string;
  };
}

export interface PropertyRoom {
  id: string;
  name: string;
  characteristics: string;
  furniture: string;
  price: number;
  availableFrom: Date;
}

export interface BackendProperty {
  _id?: string;
  id?: string; // Added to support the toJSON transform from MongoDB
  hosterId: string;
  title: string;
  description: string;
  type: 'property' | 'rooms';
  propertyType: 'casa' | 'departamento';
  location: PropertyLocation;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furniture: 'amueblada' | 'semi-amueblada' | 'sin-amueblar';
  amenities: string[];
  pricing: PropertyPricing;
  rules: PropertyRules;
  images: string[];
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'returned';
  rooms?: PropertyRoom[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  type: 'property' | 'rooms';
  propertyType: 'casa' | 'departamento';
  location: PropertyLocation;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking?: number;
  furniture: 'amueblada' | 'semi-amueblada' | 'sin-amueblar';
  amenities?: string[];
  pricing: PropertyPricing;
  rules?: PropertyRules;
  images?: string[];
  status?: 'draft' | 'review' | 'approved' | 'rejected' | 'returned';
  rooms?: PropertyRoom[];
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: {
    property: BackendProperty;
  };
}

export interface PropertiesResponse {
  success: boolean;
  data: {
    properties: BackendProperty[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

class PropertyService {

  async createProperty(propertyData: CreatePropertyRequest): Promise<PropertyResponse> {
    const formData = new FormData();
    
    // Add all property data as JSON string
    const { images, ...propertyDataWithoutImages } = propertyData;
    formData.append('propertyData', JSON.stringify(propertyDataWithoutImages));
    
    // Add image files if they exist (convert blob URLs to actual files if needed)
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        
        // If it's a blob URL, convert to file
        if (imageUrl.startsWith('blob:')) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `image-${i}.jpg`, { type: blob.type });
            formData.append('images', file);
          } catch (error) {
            console.warn('Failed to convert blob URL to file:', error);
          }
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create property');
    }

    return data;
  }

  async getHosterProperties(page: number = 1, limit: number = 10, status?: string): Promise<PropertiesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await fetch(`${API_BASE_URL}/properties/hoster/my-properties?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch properties');
    }

    return data;
  }

  async getProperty(id: string): Promise<PropertyResponse> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch property');
    }

    return data;
  }

  async updateProperty(id: string, propertyData: Partial<CreatePropertyRequest>): Promise<PropertyResponse> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update property');
    }

    return data;
  }

  async deleteProperty(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete property');
    }

    return data;
  }

  async searchProperties(params: {
    page?: number;
    limit?: number;
    type?: 'property' | 'rooms';
    propertyType?: 'casa' | 'departamento';
    minPrice?: number;
    maxPrice?: number;
    zone?: string;
    search?: string;
  } = {}): Promise<PropertiesResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/properties?${searchParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search properties');
    }

    return data;
  }
}

export const propertyService = new PropertyService();
