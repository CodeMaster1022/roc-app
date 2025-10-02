import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MapPin, Bed, Bath, Car, DollarSign, Eye, Edit, Trash2, Home, Settings } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Property } from '@/types/property'
import { AddUnitModal } from './AddUnitModal'
import { PropertyDetailModal } from './PropertyDetailModal'
import { PropertyEditModal } from './PropertyEditModal'
import { PropertyFlowModal } from './PropertyFlowModal'
import { NotificationDemo } from '../notifications/NotificationDemo'
import { propertyService } from '@/services/propertyService'
import { transformBackendToFrontend, transformFrontendToBackend } from '@/utils/propertyTransform'
import { useToast } from '@/hooks/use-toast'

const statusLabels = {
  "approved": "Aprobada",
  "review": "En revisión",
  "returned": "Regresada",
  "rejected": "Rechazada",
  "draft": "Borrador"
};

const statusColors = {
  "approved": "bg-green-100 text-green-800",
  "review": "bg-yellow-100 text-yellow-800",
  "returned": "bg-blue-100 text-blue-800",
  "rejected": "bg-red-100 text-red-800",
  "draft": "bg-gray-100 text-gray-800"
};

export const PropertiesSection = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      console.log('=== LOAD PROPERTIES DEBUG START ===');
      setLoading(true);
      
      console.log('Calling propertyService.getAllHosterProperties()...');
      const allProperties = await propertyService.getAllHosterProperties();
      console.log('API Response - All Properties:', allProperties);
      
      console.log('Transforming properties...');
      const transformedProperties = allProperties.map(transformBackendToFrontend);
      console.log('Transformed properties:', transformedProperties);
      
      setProperties(transformedProperties);
      console.log('Properties state updated - Total properties:', transformedProperties.length);
      console.log('=== LOAD PROPERTIES DEBUG END ===');
    } catch (error: any) {
      console.error('=== LOAD PROPERTIES ERROR DEBUG ===');
      console.error('Error loading properties:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== LOAD PROPERTIES ERROR DEBUG END ===');
      
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleSaveProperty = async (updatedProperty: Property) => {
    try {
      if (updatedProperty.id) {
        await propertyService.updateProperty(updatedProperty.id, transformFrontendToBackend(updatedProperty));
        toast({
          title: "Success",
          description: "Property updated successfully!",
        });
        loadProperties(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyService.deleteProperty(propertyId);
      toast({
        title: "Success",
        description: "Property deleted successfully!",
      });
      loadProperties(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePropertyCreated = (newProperty: Property) => {
    console.log('=== HANDLE PROPERTY CREATED DEBUG START ===');
    console.log('New property received:', newProperty);
    console.log('Refreshing properties list...');
    // Refresh the properties list to include the new property
    loadProperties();
    console.log('=== HANDLE PROPERTY CREATED DEBUG END ===');
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Properties</h2>
            <p className="text-sm text-muted-foreground md:hidden">Manage your properties</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            {t('properties.title')}
          </h2>
          <p className="text-sm text-muted-foreground md:hidden">
            {t('properties.subtitle')}
          </p>
        </div>
        <Button 
          variant="default" 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('properties.addProperty')}
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* <NotificationDemo /> */}
        
        {properties.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">No properties found</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="grid gap-4 md:gap-6">
                {properties.map((property) => (
            <Card key={property.id} className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  {/* Property Image */}
                  <div className="w-full sm:w-32 h-24 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {property.details?.photos && property.details.photos.length > 0 ? (
                      <img 
                        src={property.details.photos[0]} 
                        alt={property.details.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-muted flex items-center justify-center ${property.details?.photos && property.details.photos.length > 0 ? 'hidden' : ''}`}>
                      <Home className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {property.details.name}
                      <Badge className={statusColors[property.status]}>
                        {statusLabels[property.status]}
                      </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {property.location.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {(property.status === 'draft' || property.status === 'review') && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => property.id && navigate(`/properties/${property.id}/configure`)}
                        className="bg-gradient-to-r from-purple-600 to-purple-800"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Finish Configuration
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(property)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => property.id && handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <span>{property.additionalInfo.area}m²</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <span>{property.rooms.length} rooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    <span>{property.additionalInfo.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span>{property.additionalInfo.parking}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span>${property.pricing.totalPrice?.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">
                      /{property.pricing.rentalType}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {property.type === 'rooms' ? 'Rooms' : 'Property'}
                  </div>
                </div>
              </CardContent>
                  </Card>
                ))
              }
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      
      <AddUnitModal open={showAddModal} onOpenChange={setShowAddModal} onPropertyCreated={handlePropertyCreated} />
      
      <PropertyDetailModal 
        property={selectedProperty}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
      
      <PropertyEditModal
        property={selectedProperty}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleSaveProperty}
      />
    </div>
  );
};
