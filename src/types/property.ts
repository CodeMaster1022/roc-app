export type PropertyType = 'casa' | 'departamento';
export type FurnitureType = 'amueblada' | 'semi-amueblada' | 'sin-amueblar';
export type RentalType = 'ambos' | 'completa' | 'habitaciones';

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

export interface Room {
  id: string;
  name: string;
  description?: string;
  characteristics: string;
  furniture: FurnitureType;
  price?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
  availableFrom?: Date;
  photos?: string[];
}

export interface Property {
  id?: string;
  type: 'rooms' | 'property';
  propertyType: PropertyType;
  furniture: FurnitureType;
  scheme?: 'mixto' | 'mujeres' | 'hombres';
  location: {
    address: string;
    lat?: number;
    lng?: number;
    zone?: string;
  };
  rooms: Room[];
  additionalInfo: {
    area: number;
    parking: number;
    bathrooms: number;
    bedrooms?: number; // For complete properties
  };
  pricing: {
    totalPrice?: number;
    rentalType?: RentalType;
  };
  contracts: {
    contractType?: 'template' | 'custom';
    customContract?: string;
    standardOptions: string[];
    requiresDeposit: boolean;
    depositAmount?: number;
  };
  details: {
    name: string;
    description: string;
    photos: string[];
    amenities: string[];
    included?: string[];
    roommates?: any[]; // Add roommates field
    advancedConfig: {
      enabled: boolean;
      rules: {
        pets: boolean;
        smoking: boolean;
        parties?: boolean; // Add parties field
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
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'returned';
}