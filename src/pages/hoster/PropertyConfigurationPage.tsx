import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/propertyService";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types/property";
import { transformFrontendToBackend, transformBackendToFrontend } from "@/utils/propertyTransform";
import { ArrowLeft, Save, Send, FileText, Upload, AlertCircle, Shield, Users, User, Plus, X, Minus, Home, ImageIcon, Trash2 } from "lucide-react";

const PropertyConfigurationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractType, setContractType] = useState<'template' | 'custom'>('template');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['12']);
  const [customContract, setCustomContract] = useState<File | null>(null);
  const [roommates, setRoommates] = useState<Array<{
    id: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    occupation: string;
    personality: string;
  }>>([]);
  const [property, setProperty] = useState<Partial<Property>>({
    details: {
      name: '',
      description: '',
      photos: [],
      amenities: [],
      advancedConfig: {
        enabled: false,
        rules: { pets: false, smoking: false, meetings: { allowed: false } },
        environment: { title: '', description: '' }
      }
    },
    furniture: 'sin-amueblar',
    scheme: 'mixto',
    additionalInfo: { area: 0, parking: 0, bathrooms: 0 },
    pricing: { totalPrice: 0, rentalType: 'completa' },
    contracts: { standardOptions: [], requiresDeposit: false },
    rooms: []
  });

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await propertyService.getProperty(id);
      const transformedProperty = transformBackendToFrontend(response.data.property);
      setProperty(transformedProperty);
      
      // Initialize contract state
      if (transformedProperty.contracts?.contractType) {
        setContractType(transformedProperty.contracts.contractType as 'template' | 'custom');
      }
      if (transformedProperty.contracts?.standardOptions?.length) {
        setSelectedMonths(transformedProperty.contracts.standardOptions);
      }
      
      // Initialize roommates state
      if (transformedProperty.details?.roommates) {
        setRoommates(transformedProperty.details.roommates);
      }
    } catch (error: any) {
      console.error('Error loading property:', error);
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'review') => {
    if (!id) return;

    // Validate contract configuration
    if (contractType === 'template' && selectedMonths.length === 0) {
      toast({
        title: "Contract Duration Required",
        description: "Please select at least one contract duration option",
        variant: "destructive",
      });
      return;
    }

    if (contractType === 'custom' && !customContract && !property.contracts?.customContract) {
      toast({
        title: "Custom Contract Required",
        description: "Please upload your custom contract",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Ensure contract configuration is included
      const updatedProperty = {
        ...property,
        status,
        contracts: {
          ...property.contracts,
          contractType,
          standardOptions: contractType === 'template' ? selectedMonths : [],
          customContract: customContract?.name || property.contracts?.customContract,
        }
      } as Property;
      
      const backendData = transformFrontendToBackend(updatedProperty);
      
      await propertyService.updateProperty(id, backendData);
      
      toast({
        title: "Success",
        description: status === 'review' ? "Property submitted for review!" : "Property saved as draft",
      });
      
      navigate('/propiedades');
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProperty = (updates: Partial<Property>) => {
    setProperty(prev => ({ ...prev, ...updates }));
  };

  const addRoommate = () => {
    const newRoommate = {
      id: `roommate-${Date.now()}`,
      gender: 'male' as const,
      age: 25,
      occupation: '',
      personality: ''
    };
    const updatedRoommates = [...roommates, newRoommate];
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      } as any
    });
  };

  const removeRoommate = (roommateId: string) => {
    const updatedRoommates = roommates.filter(r => r.id !== roommateId);
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      } as any
    });
  };

  const updateRoommate = (roommateId: string, updates: Partial<typeof roommates[0]>) => {
    const updatedRoommates = roommates.map(roommate =>
      roommate.id === roommateId ? { ...roommate, ...updates } : roommate
    );
    setRoommates(updatedRoommates);
    updateProperty({
      details: {
        ...property.details,
        roommates: updatedRoommates
      } as any
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const occupationOptions = [
    'Student',
    'Professional',
    'Entrepreneur',
    'Freelancer',
    'Employee',
    'Other'
  ];

  const addRoom = () => {
    const newRoom = {
      id: `room-${Date.now()}`,
      name: `Room ${(property.rooms?.length || 0) + 1}`,
      characteristics: 'closet_bathroom',
      furniture: 'sin-amueblar' as const,
      price: 0,
      availableFrom: new Date(),
      depositAmount: 0,
      photos: []
    };
    const updatedRooms = [...(property.rooms || []), newRoom];
    updateProperty({ rooms: updatedRooms as any });
  };

  const removeRoom = (roomId: string) => {
    const updatedRooms = (property.rooms || []).filter(r => r.id !== roomId);
    updateProperty({ rooms: updatedRooms as any });
  };

  const updateRoom = (roomId: string, updates: Partial<Property['rooms'][0]>) => {
    const updatedRooms = (property.rooms || []).map(room =>
      room.id === roomId ? { ...room, ...updates } : room
    );
    updateProperty({ rooms: updatedRooms as any });
  };

  const handleRoomPhotoUpload = (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const room = property.rooms?.find(r => r.id === roomId);
    const existingPhotos = room?.photos || [];
    const photoUrls = files.map(file => URL.createObjectURL(file));
    updateRoom(roomId, { photos: [...existingPhotos, ...photoUrls] });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/properties')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Complete Property Configuration</h1>
                <p className="text-sm text-muted-foreground">Fill in all the details for your property</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave('review')} disabled={saving}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Property Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Property Photos</CardTitle>
            <CardDescription>Add at least 5 high-quality photos of your property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="relative">
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const existingPhotos = property.details?.photos || [];
                  const photoUrls = files.map(file => URL.createObjectURL(file));
                  updateProperty({
                    details: { ...property.details, photos: [...existingPhotos, ...photoUrls] } as any
                  });
                }}
              />
              <label
                htmlFor="photos"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 font-semibold">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
                </div>
              </label>
            </div>

            {/* Photo Counter */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  (property.details?.photos?.length || 0) >= 5 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {property.details?.photos?.length || 0}
                </div>
                <div>
                  <p className="font-medium">Photos Uploaded</p>
                  <p className="text-xs text-muted-foreground">
                    {(property.details?.photos?.length || 0) >= 5 
                      ? 'Minimum requirement met ✓' 
                      : `${5 - (property.details?.photos?.length || 0)} more required`}
                  </p>
                </div>
              </div>
              {property.details?.photos && property.details.photos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateProperty({ details: { ...property.details, photos: [] } as any })}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Photo Grid */}
            {property.details?.photos && property.details.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.details.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                      <img src={photo} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {/* Image Number Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        const newPhotos = property.details?.photos?.filter((_, i) => i !== index) || [];
                        updateProperty({ details: { ...property.details, photos: newPhotos } as any });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded text-center">
                        Cover Photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={property.details?.name || ''}
                onChange={(e) => updateProperty({ 
                  details: { ...property.details, name: e.target.value } as any
                })}
                placeholder="e.g., Beautiful apartment in downtown"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {property.details?.name?.length || 0}/100 characters
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={property.details?.description || ''}
                onChange={(e) => updateProperty({ 
                  details: { ...property.details, description: e.target.value } as any
                })}
                placeholder="Describe your property..."
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {property.details?.description?.length || 0}/1000 characters
              </p>
            </div>
            <div>
              <Label htmlFor="scheme">Gender Scheme</Label>
              <Select 
                value={property.scheme || 'mixto'} 
                onValueChange={(value: any) => updateProperty({ scheme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixto">Mixed</SelectItem>
                  <SelectItem value="mujeres">Women only</SelectItem>
                  <SelectItem value="hombres">Men only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Specify if the property is restricted to a specific gender
              </p>
            </div>
          </CardContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="furniture">Furniture Level *</Label>
              <Select 
                value={property.furniture} 
                onValueChange={(value: any) => updateProperty({ furniture: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furniture level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amueblada">Furnished</SelectItem>
                  <SelectItem value="semi-amueblada">Semi-furnished</SelectItem>
                  <SelectItem value="sin-amueblar">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="area">Area (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={property.additionalInfo?.area || 0}
                  onChange={(e) => updateProperty({ 
                    additionalInfo: { ...property.additionalInfo, area: Number(e.target.value) } as any
                  })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={property.additionalInfo?.bathrooms || 0}
                  onChange={(e) => updateProperty({ 
                    additionalInfo: { ...property.additionalInfo, bathrooms: Number(e.target.value) } as any
                  })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="parking">Parking Spaces</Label>
                <Input
                  id="parking"
                  type="number"
                  value={property.additionalInfo?.parking || 0}
                  onChange={(e) => updateProperty({ 
                    additionalInfo: { ...property.additionalInfo, parking: Number(e.target.value) } as any
                  })}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Available for Rent */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                <CardTitle>Rooms Available for rent</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if ((property.rooms?.length || 0) > 0) {
                      removeRoom(property.rooms![property.rooms!.length - 1].id);
                    }
                  }}
                  disabled={(property.rooms?.length || 0) === 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1 bg-muted rounded-md font-semibold">
                  {property.rooms?.length || 0}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRoom}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.rooms && property.rooms.length > 0 ? (
              property.rooms.map((room, index) => (
                <Card key={room.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Room Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                          {room.photos && room.photos.length > 0 ? (
                            <img 
                              src={room.photos[0]} 
                              alt={room.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleRoomPhotoUpload(room.id, e)}
                            className="hidden"
                            id={`room-photo-${room.id}`}
                          />
                          <label
                            htmlFor={`room-photo-${room.id}`}
                            className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center"
                          >
                            <Upload className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </label>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="flex-1 space-y-3">
                        {/* Room Name */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base">{room.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoom(room.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Furniture Badge */}
                        <div>
                          <Select
                            value={room.furniture}
                            onValueChange={(value: any) => updateRoom(room.id, { furniture: value })}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amueblada">Furnished</SelectItem>
                              <SelectItem value="semi-amueblada">Semi-furnished</SelectItem>
                              <SelectItem value="sin-amueblar">Unfurnished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Price and Deposit */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Monthly Price</Label>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold">$</span>
                              <Input
                                type="number"
                                value={room.price || 0}
                                onChange={(e) => updateRoom(room.id, { price: Number(e.target.value) })}
                                className="text-lg font-bold h-8"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">/ monthly</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Deposit</Label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">$</span>
                              <Input
                                type="number"
                                value={room.depositAmount || 0}
                                onChange={(e) => updateRoom(room.id, { depositAmount: Number(e.target.value) })}
                                className="h-8"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Available From */}
                        <div>
                          <Label className="text-xs">Available from</Label>
                          <Input
                            type="date"
                            value={room.availableFrom ? new Date(room.availableFrom).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateRoom(room.id, { availableFrom: new Date(e.target.value) })}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rooms added yet. Click the + button to add rooms.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your rental price</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Monthly Price *</Label>
              <Input
                id="price"
                type="number"
                value={property.pricing?.totalPrice || 0}
                onChange={(e) => updateProperty({ 
                  pricing: { ...property.pricing, totalPrice: Number(e.target.value) } as any
                })}
                min="0"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="rentalType">Rental Type</Label>
              <Select 
                value={property.pricing?.rentalType} 
                onValueChange={(value: any) => updateProperty({ 
                  pricing: { ...property.pricing, rentalType: value } as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rental type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completa">Complete Property</SelectItem>
                  <SelectItem value="habitaciones">By Rooms</SelectItem>
                  <SelectItem value="ambos">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>Select available amenities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security', 'Garden', 'Elevator'].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Switch
                    checked={property.details?.amenities?.includes(amenity) || false}
                    onCheckedChange={(checked) => {
                      const currentAmenities = property.details?.amenities || [];
                      const newAmenities = checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter(a => a !== amenity);
                      updateProperty({
                        details: { ...property.details, amenities: newAmenities } as any
                      });
                    }}
                  />
                  <Label>{amenity}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Property Rules</CardTitle>
            <CardDescription>Define house rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Pets Allowed</Label>
                <p className="text-sm text-muted-foreground">Allow tenants to have pets</p>
              </div>
              <Switch
                checked={property.details?.advancedConfig?.rules?.pets || false}
                onCheckedChange={(checked) => updateProperty({
                  details: {
                    ...property.details,
                    advancedConfig: {
                      ...property.details?.advancedConfig,
                      rules: {
                        ...property.details?.advancedConfig?.rules,
                        pets: checked
                      }
                    }
                  } as any
                })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Smoking Allowed</Label>
                <p className="text-sm text-muted-foreground">Allow smoking inside the property</p>
              </div>
              <Switch
                checked={property.details?.advancedConfig?.rules?.smoking || false}
                onCheckedChange={(checked) => updateProperty({
                  details: {
                    ...property.details,
                    advancedConfig: {
                      ...property.details?.advancedConfig,
                      rules: {
                        ...property.details?.advancedConfig?.rules,
                        smoking: checked
                      }
                    }
                  } as any
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Roommates Living in Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Roommates Living in Property
            </CardTitle>
            <CardDescription>Add information about current residents (Optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Roommate Button */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Button 
                onClick={addRoommate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Roommate
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Optional: Helps tenants understand the property environment
              </p>
            </div>

            {/* Roommates List */}
            {roommates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold">
                    Current Roommates ({roommates.length})
                  </h3>
                </div>

                {roommates.map((roommate, index) => (
                  <Card key={roommate.id} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Roommate {index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoommate(roommate.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Gender */}
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select 
                            value={roommate.gender} 
                            onValueChange={(value: 'male' | 'female' | 'other') => 
                              updateRoommate(roommate.id, { gender: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                          <Label>Age</Label>
                          <Input
                            type="number"
                            value={roommate.age}
                            onChange={(e) => updateRoommate(roommate.id, { age: parseInt(e.target.value) || 18 })}
                            min="18"
                            max="100"
                          />
                        </div>

                        {/* Occupation */}
                        <div className="space-y-2">
                          <Label>Occupation</Label>
                          <Select 
                            value={roommate.occupation} 
                            onValueChange={(value) => 
                              updateRoommate(roommate.id, { occupation: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupation" />
                            </SelectTrigger>
                            <SelectContent>
                              {occupationOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Personality */}
                      <div className="space-y-2">
                        <Label>Personality</Label>
                        <Textarea
                          value={roommate.personality}
                          onChange={(e) => updateRoommate(roommate.id, { personality: e.target.value })}
                          placeholder="e.g., Calm, Sociable, Studious..."
                          rows={2}
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground">
                          {roommate.personality?.length || 0}/200 characters
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Contract Configuration
            </CardTitle>
            <CardDescription>Configure contract type and duration options</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={contractType} onValueChange={(value) => setContractType(value as 'template' | 'custom')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="template">Use ROC Template</TabsTrigger>
                <TabsTrigger value="custom">Upload Custom Contract</TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="space-y-6">
                {/* ROC Contract Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-2">ROC Standard Contract (Recommended)</h4>
                      <p className="text-sm text-muted-foreground">
                        Legally protected standard contract designed to protect both tenant and landlord.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Duration Options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Contract Duration Options</Label>
                  <p className="text-sm text-muted-foreground">Select which contract durations you want to offer</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((month) => (
                      <div key={month} className="flex items-center space-x-2">
                        <Checkbox
                          id={`month-${month}`}
                          checked={selectedMonths.includes(month)}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...selectedMonths, month]
                              : selectedMonths.filter(m => m !== month);
                            setSelectedMonths(updated);
                            updateProperty({
                              contracts: {
                                ...property.contracts,
                                standardOptions: updated
                              } as any
                            });
                          }}
                        />
                        <Label 
                          htmlFor={`month-${month}`}
                          className="cursor-pointer text-sm"
                        >
                          {month} {month === '1' ? 'month' : 'months'}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedMonths.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected durations: {selectedMonths.length}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-6">
                {/* Custom Contract Requirements */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-2">Custom Contract Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Must be legally valid in your jurisdiction</li>
                        <li>• Include tenant protection clauses</li>
                        <li>• Formats: PDF, DOC, DOCX (max. 5MB)</li>
                        <li>• Will be reviewed by our legal team</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                      if (!allowedTypes.includes(file.type)) {
                        toast({
                          title: "Invalid file type",
                          description: "Only PDF, DOC and DOCX files are allowed",
                          variant: "destructive",
                        });
                        return;
                      }

                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        toast({
                          title: "File too large",
                          description: "File must be less than 5MB",
                          variant: "destructive",
                        });
                        return;
                      }

                      setCustomContract(file);
                      updateProperty({
                        contracts: {
                          ...property.contracts,
                          contractType: 'custom',
                          customContract: file.name
                        } as any
                      });
                      toast({
                        title: "Contract uploaded",
                        description: `${file.name} uploaded successfully`,
                      });
                    }}
                    className="hidden"
                    id="contract-upload"
                  />
                  <label htmlFor="contract-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {customContract ? customContract.name : 'Upload custom contract'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC or DOCX up to 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {customContract && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{customContract.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(customContract.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCustomContract(null);
                        updateProperty({
                          contracts: {
                            ...property.contracts,
                            customContract: undefined
                          } as any
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Deposit Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Deposit Configuration
            </CardTitle>
            <CardDescription>Security deposit requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Deposit</Label>
                <p className="text-sm text-muted-foreground">Tenants must pay a security deposit</p>
              </div>
              <Switch
                checked={property.contracts?.requiresDeposit || false}
                onCheckedChange={(checked) => updateProperty({
                  contracts: { ...property.contracts, requiresDeposit: checked } as any
                })}
              />
            </div>
            {property.contracts?.requiresDeposit && (
              <div>
                <Label htmlFor="depositAmount">Deposit Amount (MXN)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={property.contracts?.depositAmount || 0}
                  onChange={(e) => updateProperty({
                    contracts: { ...property.contracts, depositAmount: Number(e.target.value) } as any
                  })}
                  min="0"
                  placeholder="0.00"
                  className="max-w-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={() => navigate('/properties')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('review')} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyConfigurationPage; 