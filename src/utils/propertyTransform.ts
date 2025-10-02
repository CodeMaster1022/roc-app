import { Property as BackendPropertyType, FurnitureType } from '@/types/property';
import { CreatePropertyRequest, BackendProperty, PropertyRoom } from '@/services/propertyService';
import { Property as FrontendProperty } from '@/data/mockProperties';

// Map backend furniture types to frontend types
const furnitureMapping = {
  'amueblada': 'furnished' as const,
  'semi-amueblada': 'semi-furnished' as const,
  'sin-amueblar': 'unfurnished' as const,
};

// Map backend property types to frontend types
const propertyTypeMapping = {
  'property': 'propiedad' as const,
  'rooms': 'habitacion' as const,
};

// Map backend rental types to frontend scheme
const rentalTypeMapping = {
  'completa': 'completa' as const,
  'habitaciones': 'habitaciones' as const,
  'ambos': 'completa' as const, // Default to completa for ambos
};

export function transformFrontendToBackend(frontendProperty: BackendPropertyType): CreatePropertyRequest {
  // Add debugging to see what we're receiving
  console.log('🔍 Transform Frontend to Backend - Input:', {
    pricing: frontendProperty.pricing,
    details: frontendProperty.details,
    location: frontendProperty.location,
    type: frontendProperty.type,
    propertyPhotos: frontendProperty.details?.photos?.length || 0,
    rooms: frontendProperty.rooms?.map(room => ({
      id: room.id,
      name: room.name,
      photos: room.photos?.length || 0
    }))
  });

  return {
    title: frontendProperty.details?.name || '',
    description: frontendProperty.details?.description || '',
    type: frontendProperty.type || 'property',
    propertyType: frontendProperty.propertyType || 'departamento',
    location: {
      address: frontendProperty.location?.address || '',
      lat: frontendProperty.location?.lat || 0,
      lng: frontendProperty.location?.lng || 0,
      zone: frontendProperty.location?.zone || 'auto' // Use actual zone from frontend, fallback to auto
    },
    area: frontendProperty.additionalInfo?.area || 0,
    bedrooms: frontendProperty.rooms?.length || 0,
    bathrooms: frontendProperty.additionalInfo?.bathrooms || 1,
    parking: frontendProperty.additionalInfo?.parking || 0,
    furniture: frontendProperty.furniture || 'sin-amueblar',
    amenities: frontendProperty.details?.amenities || [],
    pricing: {
      totalPrice: frontendProperty.pricing?.totalPrice || 0,
      rentalType: frontendProperty.pricing?.rentalType || 'completa'
    },
    rules: {
      pets: frontendProperty.details?.advancedConfig?.rules?.pets || false,
      smoking: frontendProperty.details?.advancedConfig?.rules?.smoking || false,
      parties: false,
      meetings: frontendProperty.details?.advancedConfig?.rules?.meetings || { allowed: false }
    },
    contracts: frontendProperty.contracts ? {
      contractType: frontendProperty.contracts.contractType,
      customContract: frontendProperty.contracts.customContract,
      standardOptions: frontendProperty.contracts.standardOptions || [],
      requiresDeposit: frontendProperty.contracts.requiresDeposit || false,
      depositAmount: frontendProperty.contracts.depositAmount
    } : undefined,
    images: frontendProperty.details?.photos || [],
    status: frontendProperty.status || 'draft',
    rooms: (frontendProperty.rooms || []).map(room => ({
      id: room.id || `room-${Date.now()}`,
      name: room.name || 'Habitación',
      characteristics: room.characteristics || 'closet_bathroom',
      furniture: room.furniture || 'sin-amueblar',
      price: room.price || 0,
      availableFrom: room.availableFrom || new Date(),
      photos: room.photos || [] // ✅ Added room photos
    }))
  };
}

export function transformBackendToFrontend(backendProperty: BackendProperty): BackendPropertyType {
  return {
    id: backendProperty.id || backendProperty._id,
    type: backendProperty.type,
    propertyType: backendProperty.propertyType,
    furniture: backendProperty.furniture,
    location: {
      address: backendProperty.location.address,
      lat: backendProperty.location.lat,
      lng: backendProperty.location.lng,
    },
    rooms: backendProperty.rooms?.map(room => ({
      id: room.id,
      name: room.name,
      characteristics: room.characteristics,
      furniture: room.furniture as FurnitureType,
      price: room.price,
      availableFrom: room.availableFrom,
    })) || [],
    additionalInfo: {
      area: backendProperty.area,
      parking: backendProperty.parking,
      bathrooms: backendProperty.bathrooms,
    },
    pricing: {
      totalPrice: backendProperty.pricing.totalPrice,
      rentalType: backendProperty.pricing.rentalType,
    },
    contracts: {
      standardOptions: backendProperty.contracts?.standardOptions || [], // Use actual data from backend
      requiresDeposit: backendProperty.contracts?.requiresDeposit || false, // Use actual data from backend
      depositAmount: backendProperty.contracts?.depositAmount,
      contractType: backendProperty.contracts?.contractType,
      customContract: backendProperty.contracts?.customContract,
    },
    details: {
      name: backendProperty.title,
      description: backendProperty.description,
      photos: backendProperty.images,
      amenities: backendProperty.amenities,
      advancedConfig: {
        enabled: true,
        rules: {
          pets: backendProperty.rules.pets,
          smoking: backendProperty.rules.smoking,
          meetings: backendProperty.rules.meetings || { allowed: false },
        },
        environment: {
          title: '',
          description: '',
        },
      },
    },
    status: backendProperty.status,
  };
}

export function transformBackendPropertyToFrontend(backendProperty: BackendProperty): FrontendProperty {
  const {
    _id,
    title,
    description,
    type,
    propertyType,
    location,
    area,
    bedrooms,
    bathrooms,
    furniture,
    amenities,
    pricing,
    rules,
    images,
    status,
    rooms,
    createdAt,
  } = backendProperty;

  // Use first image or placeholder
  const image = images && images.length > 0 ? images[0] : '/placeholder.svg';

  // Determine if property allows pets
  const allowsPets = rules?.pets || false;

  // Determine bath type from amenities or default
  const bathType = amenities?.some(amenity => 
    amenity.toLowerCase().includes('privado') || amenity.toLowerCase().includes('private')
  ) ? 'privado' : 'compartido';

  // Get availability date
  const availableFrom = createdAt ? new Date(createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Debug logging for ID issues
  console.log('Transform debug:', { 
    _id, 
    id: backendProperty.id,
    status, 
    title: title?.substring(0, 20) 
  });

  // Use the id field from toJSON transform, fallback to _id, then empty string
  const propertyId = backendProperty.id || _id || '';
  
  return {
    id: propertyId,
    title,
    image,
    price: pricing?.totalPrice || 0,
    type: propertyTypeMapping[type] || 'propiedad',
    propertyType: propertyType === 'casa' ? 'casa' : 'departamento',
    area: area || 0,
    bedrooms: bedrooms || 0,
    allowsPets,
    bathType: bathType as 'privado' | 'compartido',
    zone: location?.zone || '',
    description,
    amenities: amenities || [],
    furnishing: furnitureMapping[furniture] || 'unfurnished',
    isAvailable: status === 'approved',
    availableFrom,
    rules: {
      pets: allowsPets,
      smoking: rules?.smoking || false,
      parties: rules?.parties || false,
    },
  };
}

export function transformFrontendPropertyToBackend(frontendProperty: Partial<FrontendProperty>): Partial<BackendProperty> {
  // Reverse mapping for sending data to backend
  const reverseFurnitureMapping: Record<string, 'amueblada' | 'semi-amueblada' | 'sin-amueblar'> = {
    'furnished': 'amueblada',
    'semi-furnished': 'semi-amueblada',
    'unfurnished': 'sin-amueblar',
  };

  const reversePropertyTypeMapping: Record<string, 'property' | 'rooms'> = {
    'propiedad': 'property',
    'habitacion': 'rooms',
  };

  const reverseRentalTypeMapping: Record<string, 'completa' | 'habitaciones' | 'ambos'> = {
    'completa': 'completa',
    'habitaciones': 'habitaciones',
  };

  return {
    title: frontendProperty.title,
    description: frontendProperty.description,
    type: frontendProperty.type ? reversePropertyTypeMapping[frontendProperty.type] : undefined,
    propertyType: frontendProperty.propertyType === 'casa' ? 'casa' : 'departamento',
    location: {
      address: frontendProperty.title || '',
      zone: frontendProperty.zone || '',
      lat: 0, // Default coordinates
      lng: 0,
    },
    area: frontendProperty.area,
    bedrooms: frontendProperty.bedrooms,
    bathrooms: 1, // Default
    furniture: frontendProperty.furnishing ? reverseFurnitureMapping[frontendProperty.furnishing] : 'sin-amueblar',
    amenities: frontendProperty.amenities,
    pricing: {
      totalPrice: frontendProperty.price || 0,
      rentalType: frontendProperty.scheme ? reverseRentalTypeMapping[frontendProperty.scheme] : 'completa',
    },
    rules: {
      pets: frontendProperty.allowsPets || false,
      smoking: false,
      parties: false,
    },
    images: frontendProperty.image ? [frontendProperty.image] : [],
  };
}
