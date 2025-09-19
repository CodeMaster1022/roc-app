// Unified property types combining both hoster and tenant app needs

export type PropertyType = 'casa' | 'departamento';
export type FurnitureType = 'amueblada' | 'semi-amueblada' | 'sin-amueblar';
export type RentalType = 'ambos' | 'completa' | 'habitaciones';

// Room characteristics for hoster property creation
export interface RoomCharacteristics {
  id: string;
  name: string;
  points: number;
}

export const ROOM_CHARACTERISTICS: RoomCharacteristics[] = [
  { id: 'walking_closet_bathroom_terrace', name: 'Con walking closet, baño completo y terraza', points: 35 },
  { id: 'walking_closet_bathroom', name: 'Con walking closet y baño completo', points: 32 },
  { id: 'closet_bathroom_terrace', name: 'Con closet, baño completo y terraza', points: 30 },
  { id: 'closet_bathroom', name: 'Con closet y baño completo', points: 28 },
  { id: 'closet_shared_bathroom', name: 'Con closet y baño compartido', points: 24 },
  { id: 'service_room_bathroom', name: 'Habitación de servicio con baño completo', points: 18 },
  { id: 'service_room_shared_bathroom', name: 'Habitación de servicio con baño compartido', points: 15 },
];

// Room definition for hoster property creation
export interface Room {
  id: string;
  name: string;
  characteristics: string;
  furniture: FurnitureType;
  price?: number;
  availableFrom?: Date;
  depositAmount?: number;
}

// Unified Property interface combining both hoster and tenant needs
export interface Property {
  // Common fields
  id: string;
  title?: string; // For tenant display
  name?: string;  // For hoster management
  
  // Property classification
  type: 'rooms' | 'property' | 'propiedad' | 'habitacion';
  propertyType: PropertyType | 'departamento' | 'casa';
  
  // Location
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  zone?: string; // For tenant search
  
  // Physical characteristics
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  
  // Furniture and amenities
  furniture?: FurnitureType;
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  amenities?: string[];
  
  // Rooms (for hoster property creation)
  rooms?: Room[];
  
  // Pricing
  price?: number;
  totalPrice?: number;
  pricing?: {
    totalPrice?: number;
    rentalType?: RentalType;
  };
  
  // Rules and policies
  rules?: {
    pets: boolean;
    smoking: boolean;
    parties?: boolean;
    meetings?: {
      allowed: boolean;
      schedule?: string;
    };
  };
  allowsPets?: boolean;
  
  // Tenant-specific fields
  bathType?: "privado" | "compartido";
  scheme?: "mixto" | "hombres" | "mujeres";
  isAvailable?: boolean;
  availableFrom?: string | Date;
  
  // Media
  image?: string;
  images?: string[];
  photos?: string[];
  
  // Description
  description: string;
  
  // Contracts (for hoster)
  contracts?: {
    standardOptions: string[];
    requiresDeposit: boolean;
    depositAmount?: number;
  };
  
  // Additional details (for hoster)
  details?: {
    name: string;
    description: string;
    photos: string[];
    amenities: string[];
    included?: string[];
    advancedConfig: {
      enabled: boolean;
      rules: {
        pets: boolean;
        smoking: boolean;
        meetings: {
          allowed: boolean;
          schedule?: string;
        };
      };
      environment: {
        title: string;
        description: string;
      };
    };
  };
  
  // Status (for hoster management)
  status?: 'draft' | 'review' | 'approved' | 'rejected' | 'returned';
}

// Helper function to convert between property formats
export const convertToTenantProperty = (hosterProperty: Property): Property => {
  return {
    ...hosterProperty,
    id: hosterProperty.id || '',
    title: hosterProperty.details?.name || hosterProperty.name || '',
    type: hosterProperty.type === 'property' ? 'propiedad' : 'habitacion',
    propertyType: hosterProperty.propertyType,
    area: hosterProperty.area || 0,
    bedrooms: hosterProperty.rooms?.length || 1,
    price: hosterProperty.pricing?.totalPrice || hosterProperty.price || 0,
    zone: hosterProperty.location?.address || '',
    description: hosterProperty.details?.description || hosterProperty.description || '',
    amenities: hosterProperty.details?.amenities || hosterProperty.amenities || [],
    furnishing: hosterProperty.furniture === 'amueblada' ? 'furnished' : 
                hosterProperty.furniture === 'semi-amueblada' ? 'semi-furnished' : 'unfurnished',
    rules: {
      pets: hosterProperty.rules?.pets || false,
      smoking: hosterProperty.rules?.smoking || false,
      parties: hosterProperty.rules?.parties || false
    },
    allowsPets: hosterProperty.rules?.pets || false,
    isAvailable: hosterProperty.status === 'approved',
    availableFrom: new Date().toISOString().split('T')[0],
    images: hosterProperty.details?.photos || hosterProperty.images || []
  };
};

export const convertToHosterProperty = (tenantProperty: Property): Property => {
  return {
    ...tenantProperty,
    type: tenantProperty.type === 'propiedad' ? 'property' : 'rooms',
    furniture: tenantProperty.furnishing === 'furnished' ? 'amueblada' : 
               tenantProperty.furnishing === 'semi-furnished' ? 'semi-amueblada' : 'sin-amueblar',
    location: {
      address: tenantProperty.zone || '',
    },
    pricing: {
      totalPrice: tenantProperty.price
    },
    details: {
      name: tenantProperty.title || '',
      description: tenantProperty.description,
      photos: tenantProperty.images || [],
      amenities: tenantProperty.amenities || [],
      advancedConfig: {
        enabled: false,
        rules: {
          pets: tenantProperty.rules?.pets || false,
          smoking: tenantProperty.rules?.smoking || false,
          meetings: {
            allowed: false
          }
        },
        environment: {
          title: '',
          description: ''
        }
      }
    },
    rooms: [],
    contracts: {
      standardOptions: [],
      requiresDeposit: false
    },
    status: 'approved'
  };
};
