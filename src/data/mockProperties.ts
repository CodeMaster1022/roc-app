export interface Property {
  id: string
  title: string
  image: string
  images?: string[]
  price: number
  type: "propiedad" | "habitacion"
  propertyType: "departamento" | "casa"
  area: number
  bedrooms: number
  allowsPets: boolean
  bathType?: "privado" | "compartido"
  scheme?: "mixto" | "hombres" | "mujeres"
  isAvailable: boolean
  zone: string
  description: string
  amenities: string[]
  furnishing: "furnished" | "semi-furnished" | "unfurnished"
  rules: {
    pets: boolean
    smoking: boolean
    parties: boolean
  }
  availableFrom: string
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Departamento moderno en Roma Norte",
    image: "/src/assets/apartment-1.jpg",
    price: 25000,
    type: "propiedad",
    propertyType: "departamento",
    area: 85,
    bedrooms: 2,
    allowsPets: true,
    furnishing: "furnished",
    isAvailable: true,
    zone: "Roma Norte",
    description: "Hermoso departamento completamente amueblado en una de las zonas más exclusivas de la Ciudad de México.",
    amenities: ["Cocina equipada", "Lavadora", "Internet", "Aire acondicionado", "Balcón"],
    rules: {
      pets: true,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-02-01"
  },
  {
    id: "2",
    title: "Habitación en casa compartida Condesa",
    image: "/src/assets/room-1.jpg",
    price: 12000,
    type: "habitacion",
    propertyType: "casa",
    area: 20,
    bedrooms: 1,
    allowsPets: false,
    bathType: "compartido",
    scheme: "mixto",
    furnishing: "semi-furnished",
    isAvailable: true,
    zone: "Condesa",
    description: "Habitación cómoda en casa compartida con excelente ambiente y roomies profesionistas.",
    amenities: ["Cocina compartida", "Lavadora", "Internet", "Área común"],
    rules: {
      pets: false,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-02-15"
  },
  {
    id: "3",
    title: "Casa completa en Polanco",
    image: "/src/assets/house-1.jpg",
    price: 45000,
    type: "propiedad",
    propertyType: "casa",
    area: 150,
    bedrooms: 3,
    allowsPets: true,
    furnishing: "furnished",
    isAvailable: true,
    zone: "Polanco",
    description: "Casa familiar en zona exclusiva, perfecta para familias o profesionistas que buscan tranquilidad.",
    amenities: ["Jardín", "Cochera", "Terraza", "Cocina integral", "3 baños"],
    rules: {
      pets: true,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-03-01"
  },
  {
    id: "4",
    title: "Studio en Santa Fe",
    image: "/src/assets/studio-1.jpg",
    price: 18000,
    type: "propiedad",
    propertyType: "departamento",
    area: 45,
    bedrooms: 1,
    allowsPets: false,
    furnishing: "unfurnished",
    isAvailable: true,
    zone: "Santa Fe",
    description: "Studio moderno perfecto para profesionistas jóvenes, cerca de zona corporativa.",
    amenities: ["Cocina integral", "Gimnasio", "Seguridad 24h", "Internet"],
    rules: {
      pets: false,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-02-10"
  },
  {
    id: "5",
    title: "Habitación privada en Coyoacán",
    image: "/src/assets/room-1.jpg",
    price: 9500,
    type: "habitacion",
    propertyType: "casa",
    area: 18,
    bedrooms: 1,
    allowsPets: true,
    bathType: "privado",
    scheme: "mujeres",
    furnishing: "semi-furnished",
    isAvailable: false,
    zone: "Coyoacán",
    description: "Habitación tranquila en casa compartida solo para mujeres, ambiente estudiantil.",
    amenities: ["Baño privado", "Cocina compartida", "Jardín", "Internet"],
    rules: {
      pets: true,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-04-01"
  },
  {
    id: "6",
    title: "Departamento en Del Valle",
    image: "/src/assets/apartment-1.jpg",
    price: 22000,
    type: "propiedad",
    propertyType: "departamento",
    area: 70,
    bedrooms: 2,
    allowsPets: false,
    furnishing: "furnished",
    isAvailable: false, // Esta propiedad no está disponible
    zone: "Del Valle",
    description: "Departamento céntrico con excelentes comunicaciones y servicios cercanos.",
    amenities: ["Elevador", "Portero", "Azotea común", "Cocina equipada"],
    rules: {
      pets: false,
      smoking: false,
      parties: false
    },
    availableFrom: "2024-02-20"
  }
]

export const zones = [
  "Roma Norte",
  "Roma Sur", 
  "Condesa",
  "Polanco",
  "Santa Fe",
  "Coyoacán",
  "Del Valle",
  "Doctores",
  "Narvarte",
  "Juárez"
]