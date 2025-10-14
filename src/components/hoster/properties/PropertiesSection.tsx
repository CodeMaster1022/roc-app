import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Eye, Edit, Trash2, Home, MapPin, Calendar, Users } from 'lucide-react'
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

  // Helper function to format property name
  const formatPropertyName = (property: Property): string => {
    // Use the property's name if it exists (auto-generated title)
    if (property.details?.name) {
      return property.details.name;
    }
    
    // Fallback: generate title from property data with translations
    const propertyTypeKey = property.propertyType === 'casa' ? 'title.house' : 'title.apartment';
    const propertyTypeText = t(propertyTypeKey) || (property.propertyType === 'casa' ? 'House' : 'Apartment');
    const byRoomsText = property.type === 'rooms' ? ` ${t('title.by_rooms') || 'by rooms'}` : '';
    const zone = property.location.zone || property.location.address;
    const inText = t('title.in') || 'in';
    
    return `${propertyTypeText}${byRoomsText} ${inText} ${zone}`;
  };

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
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <CardTitle className="text-lg font-semibold">
                        {formatPropertyName(property)}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location.address}</span>
                    </div>
                  </div>
                  {/* {(property.status === 'draft' || property.status === 'review') && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => property.id && navigate(`/properties/${property.id}/configure`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Finish Configuration
                    </Button>
                  )} */}
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(property)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => property.id && handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <p className="text-sm font-semibold">
                        {property.type === 'rooms' ? 'Room Rental' : 'Complete Property'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-sm font-semibold text-purple-600">
                        {property.type === 'rooms' && property.rooms.length > 0 ? (
                          (() => {
                            const prices = property.rooms.map(r => r.price || 0).filter(p => p > 0);
                            if (prices.length === 0) return 'Not set';
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            return `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
                          })()
                        ) : (
                          property.pricing.totalPrice ? `$${property.pricing.totalPrice.toLocaleString()}` : 'Not set'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rooms</p>
                      <p className="text-sm font-semibold">
                        {property.type === 'rooms' ? property.rooms.length : (property.additionalInfo.bedrooms || 'Not set')}
                      </p>
                    </div>
                    
                    {property.type === 'rooms' && property.rooms.length > 0 && (
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="w-4 h-4" />
                        <span>{property.rooms.filter(r => r.availableFrom).length} available</span>
                      </div>
                    )}
                    
                    {property.type === 'property' && (
                      <div>
                        <Badge className={statusColors[property.status]}>
                          {statusLabels[property.status]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Available From */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Available from: {
                      property.type === 'rooms' && property.rooms.length > 0 
                        ? (property.rooms[0].availableFrom 
                            ? new Date(property.rooms[0].availableFrom).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                            : 'Not set')
                        : 'Not set'
                    }
                  </span>
                </div>

                {/* Finish Configuration Button */}
                {(property.status === 'draft' || property.status === 'review') && (
                  <Button
                    onClick={() => property.id && navigate(`/properties/${property.id}/configure`)}
                    className="w-[150px] bg-purple-800 hover:from-purple-700 hover:to-purple-900"
                  >
                    Finish Configuration
                  </Button>
                )}
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
