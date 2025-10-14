import { Property, Room } from '@/types/property';

/**
 * Translation function type
 */
type TranslationFunction = (key: string) => string;

/**
 * Generates an auto-title for a property based on its characteristics
 * Format: [PropertyType] [by rooms if applicable] in [Zone]
 * Examples:
 * - Spanish: "Casa por habitaciones en Zona Roma"
 * - English: "House by rooms in Zona Roma"
 */
export const generatePropertyTitle = (
  property: Partial<Property>, 
  t?: TranslationFunction
): string => {
  // Step 1: Property type (casa = House, departamento = Apartment)
  const propertyTypeKey = property.propertyType === 'casa' ? 'title.house' : 'title.apartment';
  const propertyTypeText = t ? t(propertyTypeKey) : (property.propertyType === 'casa' ? 'House' : 'Apartment');
  
  // Step 2: Check if rented by rooms
  const byRoomsText = property.type === 'rooms' 
    ? (t ? ` ${t('title.by_rooms')}` : ' by rooms')
    : '';
  
  // Step 3: Zone from location
  const zone = property.location?.zone || 
               property.location?.address?.split(',')[0] || 
               'Unknown Location';
  
  // Step 4: "in" connector word
  const inText = t ? t('title.in') : 'in';
  
  // Format: [PropertyType] [by rooms if applicable] in [Zone]
  return `${propertyTypeText}${byRoomsText} ${inText} ${zone}`;
};

/**
 * Generates an auto-title for a room based on its position
 * Format: Room [number]
 * Examples:
 * - Spanish: "Habitación 1"
 * - English: "Room 1"
 */
export const generateRoomTitle = (roomIndex: number, t?: TranslationFunction): string => {
  const roomText = t ? t('title.room') : 'Room';
  return `${roomText} ${roomIndex + 1}`;
};

/**
 * Updates room names in a property to ensure sequential naming
 * This ensures that if rooms are deleted or reordered, names stay sequential
 */
export const regenerateAllRoomTitles = (rooms: Room[], t?: TranslationFunction): Room[] => {
  return rooms.map((room, index) => ({
    ...room,
    name: generateRoomTitle(index, t)
  }));
};

/**
 * Validates and ensures a property has a title
 * If no title exists or it's empty, generates one automatically
 */
export const ensurePropertyTitle = (
  property: Partial<Property>, 
  t?: TranslationFunction
): Partial<Property> => {
  const currentTitle = property.details?.name?.trim();
  
  // If there's no title or it's empty, generate one
  if (!currentTitle) {
    const generatedTitle = generatePropertyTitle(property, t);
    return {
      ...property,
      details: {
        ...property.details,
        name: generatedTitle
      } as any
    };
  }
  
  return property;
};

