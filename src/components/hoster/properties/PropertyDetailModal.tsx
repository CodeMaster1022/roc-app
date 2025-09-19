import { Property } from "@/types/property";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, MapPin, Users, Calendar, BedDouble, Bath, Car,
  CheckCircle, XCircle, Utensils, Wifi, Shield, Building2,
  FileText, DollarSign, Clock, Package
} from "lucide-react";
import { ROOM_CHARACTERISTICS } from "@/types/property";

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PropertyDetailModal = ({ property, open, onOpenChange }: PropertyDetailModalProps) => {
  if (!property) return null;

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { label: "Borrador", className: "bg-gray-100 text-gray-800" },
      review: { label: "En revisión", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprobada", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rechazada", className: "bg-red-100 text-red-800" },
      returned: { label: "Regresada", className: "bg-orange-100 text-orange-800" }
    };

    const config = statusConfig[property.status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getFurnitureLabel = (furniture: string) => {
    const labels = {
      'amueblada': 'Amueblada',
      'semi-amueblada': 'Semi-amueblada',
      'sin-amueblar': 'Sin amueblar'
    };
    return labels[furniture as keyof typeof labels] || furniture;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      'casa': 'Casa',
      'departamento': 'Departamento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRentalTypeLabel = (type: string) => {
    const labels = {
      'ambos': 'Propiedad completa y habitaciones',
      'completa': 'Propiedad completa',
      'habitaciones': 'Solo habitaciones'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRoomCharacteristicLabel = (id: string) => {
    const characteristic = ROOM_CHARACTERISTICS.find(c => c.id === id);
    return characteristic ? characteristic.name : id;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                {property.details.name}
              </DialogTitle>
              <DialogDescription>
                Detalles de la propiedad
              </DialogDescription>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Images */}
          {property.details?.photos && property.details.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Fotos de la Propiedad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.details.photos.map((photo, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo}
                        alt={`${property.details.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full bg-muted flex items-center justify-center">
                        <Home className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de propiedad</p>
                <p className="text-sm">{getPropertyTypeLabel(property.propertyType)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobiliario</p>
                <p className="text-sm">{getFurnitureLabel(property.furniture)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de renta</p>
                <p className="text-sm">{property.type === 'rooms' ? 'Por habitaciones' : 'Propiedad completa'}</p>
              </div>
              {property.pricing.rentalType && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modalidad de renta</p>
                  <p className="text-sm">{getRentalTypeLabel(property.pricing.rentalType)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{property.location.address}</p>
              {(property.location.lat && property.location.lng) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Coordenadas: {property.location.lat}, {property.location.lng}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Características de la Propiedad</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{property.additionalInfo.area} m²</p>
                  <p className="text-xs text-muted-foreground">Área total</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{property.additionalInfo.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Baños</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{property.additionalInfo.parking}</p>
                  <p className="text-xs text-muted-foreground">Estacionamientos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habitaciones */}
          {property.rooms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BedDouble className="w-5 h-5" />
                  Habitaciones ({property.rooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.rooms.map((room, index) => (
                  <div key={room.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{room.name}</h4>
                      <Badge variant="outline">
                        {getFurnitureLabel(room.furniture)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getRoomCharacteristicLabel(room.characteristics)}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {room.price && (
                        <div>
                          <span className="text-muted-foreground">Precio:</span>
                          <p className="font-medium text-green-600">${room.price.toLocaleString()}</p>
                        </div>
                      )}
                      {room.depositAmount && (
                        <div>
                          <span className="text-muted-foreground">Depósito:</span>
                          <p className="font-medium">${room.depositAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {room.availableFrom && (
                        <div>
                          <span className="text-muted-foreground">Disponible:</span>
                          <p className="font-medium">{new Date(room.availableFrom).toLocaleDateString('es-MX')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property.pricing.totalPrice && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio total</p>
                  <p className="text-lg font-bold text-green-600">
                    ${property.pricing.totalPrice.toLocaleString()} MXN
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contratos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contratos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Opciones de contrato</p>
                {property.contracts.standardOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {property.contracts.standardOptions.map((option, index) => (
                      <Badge key={index} variant="outline">{option}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No se han definido opciones</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {property.contracts.requiresDeposit ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Requiere depósito</span>
                {property.contracts.depositAmount && (
                  <Badge variant="secondary">
                    ${property.contracts.depositAmount.toLocaleString()}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenidades */}
          {property.details.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Amenidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.details.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descripción */}
          {property.details.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{property.details.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Configuración avanzada */}
          {property.details.advancedConfig.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Reglas y Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Reglas</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {property.details.advancedConfig.rules.pets ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">Mascotas permitidas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.details.advancedConfig.rules.smoking ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">Fumar permitido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.details.advancedConfig.rules.meetings.allowed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">Reuniones permitidas</span>
                      {property.details.advancedConfig.rules.meetings.schedule && (
                        <Badge variant="outline" className="text-xs">
                          {property.details.advancedConfig.rules.meetings.schedule}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {property.details.advancedConfig.environment.title && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Ambiente</p>
                    <h4 className="font-medium">{property.details.advancedConfig.environment.title}</h4>
                    {property.details.advancedConfig.environment.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {property.details.advancedConfig.environment.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};