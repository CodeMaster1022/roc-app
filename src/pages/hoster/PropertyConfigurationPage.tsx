import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { propertyService } from "@/services/propertyService";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types/property";
import { transformFrontendToBackend, transformBackendToFrontend } from "@/utils/propertyTransform";
import { API_CONFIG } from "@/config/api";
import { ArrowLeft, Save, Send, FileText, Upload, AlertCircle, Shield, Users, User, Plus, X, Minus, Home, ImageIcon, Trash2, ChevronDown } from "lucide-react";

const PropertyConfigurationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractType, setContractType] = useState<'template' | 'custom'>('template');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['12']);
  const [customContract, setCustomContract] = useState<File | null>(null);
  const contractFileInputRef = useRef<HTMLInputElement>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roommateModalOpen, setRoommateModalOpen] = useState(false);
  const [editingRoommateId, setEditingRoommateId] = useState<string | null>(null);
  const [roommates, setRoommates] = useState<Array<{
    id: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    occupation: string;
    personality: string;
  }>>([]);
  const [property, setProperty] = useState<Partial<Property>>({
    type: 'property', // Will be set from loaded property
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

  // Determine if this is a complete property or rooms rental
  const isCompleteProperty = property.type === 'property' || property.pricing?.rentalType === 'completa';
  const isRoomsRental = property.type === 'rooms' || property.pricing?.rentalType === 'habitaciones';

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
      
      navigate('/properties');
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
    // Open modal for the new roommate
    setEditingRoommateId(newRoommate.id);
    setRoommateModalOpen(true);
  };

  const openRoommateModal = (roommateId: string) => {
    setEditingRoommateId(roommateId);
    setRoommateModalOpen(true);
  };

  const closeRoommateModal = () => {
    setRoommateModalOpen(false);
    setEditingRoommateId(null);
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
      description: '',
      characteristics: 'closet_bathroom',
      furniture: 'sin-amueblar' as const,
      price: 0,
      requiresDeposit: false,
      availableFrom: new Date(),
      depositAmount: 0,
      photos: []
    };
    const updatedRooms = [...(property.rooms || []), newRoom];
    updateProperty({ rooms: updatedRooms as any });
    // Open modal for the new room
    setEditingRoomId(newRoom.id);
    setRoomModalOpen(true);
  };

  const openRoomModal = (roomId: string) => {
    setEditingRoomId(roomId);
    setRoomModalOpen(true);
  };

  const closeRoomModal = () => {
    setRoomModalOpen(false);
    setEditingRoomId(null);
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

  const uploadToCloudinary = async (file: File, fieldName: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const token = localStorage.getItem('roc_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/upload-image`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error: any) {
      console.error('Error uploading to Cloudinary:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handlePropertyPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingPhotos = property.details?.photos || [];
    const uploadPromises = files.map(file => uploadToCloudinary(file, 'images'));

    try {
      toast({
        title: "Uploading...",
        description: `Uploading ${files.length} image(s)...`,
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      updateProperty({
        details: { ...property.details, photos: [...existingPhotos, ...uploadedUrls] } as any
      });

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully!`,
      });
    } catch (error) {
      // Error already handled in uploadToCloudinary
    }
  };

  const handleRoomPhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const room = property.rooms?.find(r => r.id === roomId);
    const existingPhotos = room?.photos || [];
    const uploadPromises = files.map(file => uploadToCloudinary(file, `roomImages_${roomId}`));

    try {
      toast({
        title: "Uploading...",
        description: `Uploading ${files.length} image(s) for ${room?.name}...`,
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      updateRoom(roomId, { photos: [...existingPhotos, ...uploadedUrls] });

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully!`,
      });
    } catch (error) {
      // Error already handled in uploadToCloudinary
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
          {/* Inner pulsing circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Loading property...</p>
          <p className="text-sm text-muted-foreground">Getting property details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Status Badge */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/properties')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <div>
              <div className="flex">
              <Home className="w-6 h-6 mr-2 text-gray-400 mt-2" />
               <h2 className="text-2xl font-semibold">{property.type + ' ' + property.propertyType + ' ' + (property.location.zone? 'Casa' : 'Departamento')}</h2>
              </div>
              {property.location?.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <span className="text-red-500">📍</span>
                  {property.location.address}
                </p>
              )}
            </div>
          </div>
          <Badge variant={property.status === 'approved' ? 'default' : 'secondary'} className="bg-orange-100 text-orange-700 border-orange-200">
            {property.status === 'approved' ? 'Approved' : property.status === 'review' ? 'Under Review' : 'Incomplete'}
          </Badge>
        </div>

        {isCompleteProperty ? (
          // Two-column layout for Complete Property
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-1 space-y-6">
              {/* Property Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Add at least 5 photos of the property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="relative">
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePropertyPhotoUpload}
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
                  <p className="text-lg font-semibold">Property Details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      value={property.details?.name || ''}
                      onChange={(e) => updateProperty({ 
                        details: { ...property.details, name: e.target.value } as any
                      })}
                      placeholder="House in Woodlands"
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Property Description</Label>
                    <Textarea
                      id="description"
                      value={property.details?.description || ''}
                      onChange={(e) => updateProperty({ 
                        details: { ...property.details, description: e.target.value } as any
                      })}
                      placeholder="Describe your property..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select 
                        value={property.propertyType || 'departamento'} 
                        onValueChange={(value: any) => updateProperty({ propertyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="departamento">Apartment</SelectItem>
                          <SelectItem value="casa">House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="furniture">Furniture Level</Label>
                      <Select 
                        value={property.furniture} 
                        onValueChange={(value: any) => updateProperty({ furniture: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amueblada">Furnished</SelectItem>
                          <SelectItem value="semi-amueblada">Semi-furnished</SelectItem>
                          <SelectItem value="sin-amueblar">Unfurnished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Information */}
              <Card>
                <CardHeader>
                  <p className="text-lg font-semibold">General Information</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
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
                      <Label htmlFor="bedrooms">Number of Rooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={property.additionalInfo?.bedrooms || 0}
                        onChange={(e) => updateProperty({ 
                          additionalInfo: { ...property.additionalInfo, bedrooms: Number(e.target.value) } as any
                        })}
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* House Rules & Policies - Complete Property Only */}
              <Card>
                <CardHeader>
                  <p className="text-lg font-semibold">House Rules & Policies</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pets */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-primary">🐾</div>
                      <div className="flex-1">
                        <Label className="font-semibold">Pets *</Label>
                        <p className="text-sm text-muted-foreground">Configure pet policy (required)</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="pets-allowed" 
                          checked={property.details?.advancedConfig?.rules?.pets === true}
                          onChange={() => updateProperty({
                            details: {
                              ...property.details,
                              advancedConfig: {
                                ...property.details?.advancedConfig,
                                rules: { ...property.details?.advancedConfig?.rules, pets: true }
                              }
                            } as any
                          })}
                        />
                        <Label htmlFor="pets-allowed" className="font-normal cursor-pointer">Pets allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="pets-not-allowed" 
                          checked={property.details?.advancedConfig?.rules?.pets === false}
                          onChange={() => updateProperty({
                            details: {
                              ...property.details,
                              advancedConfig: {
                                ...property.details?.advancedConfig,
                                rules: { ...property.details?.advancedConfig?.rules, pets: false }
                              }
                            } as any
                          })}
                        />
                        <Label htmlFor="pets-not-allowed" className="font-normal cursor-pointer">Pets not allowed</Label>
                      </div>
                    </div>
                    {property.details?.advancedConfig?.rules?.pets && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="pet-policy-desc">Pet Policy Description</Label>
                          <Input
                            id="pet-policy-desc"
                            value={(property.details?.advancedConfig?.rules as any)?.petPolicy || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    petPolicy: e.target.value 
                                  }
                                }
                              } as any
                            })}
                            placeholder="e.g., One small pet per user is allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-pets">Maximum Pets per User</Label>
                          <Input
                            id="max-pets"
                            type="number"
                            min="0"
                            value={(property.details?.advancedConfig?.rules as any)?.maxPetsPerUser || 1}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    maxPetsPerUser: Number(e.target.value) 
                                  }
                                }
                              } as any
                            })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Smoking */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🚬</div>
                        <div>
                          <Label className="font-semibold">Smoking</Label>
                          <p className="text-sm text-muted-foreground">Configure smoking policy</p>
                        </div>
                      </div>
                      <Switch
                        checked={property.details?.advancedConfig?.rules?.smoking || false}
                        onCheckedChange={(checked) => updateProperty({
                          details: {
                            ...property.details,
                            advancedConfig: {
                              ...property.details?.advancedConfig,
                              rules: { ...property.details?.advancedConfig?.rules, smoking: checked }
                            }
                          } as any
                        })}
                      />
                    </div>
                    {property.details?.advancedConfig?.rules?.smoking && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="smoking-policy">Smoking Policy</Label>
                          <Select
                            value={(property.details?.advancedConfig?.rules as any)?.smokingPolicy || 'not-allowed-inside'}
                            onValueChange={(value) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    smokingPolicy: value 
                                  }
                                }
                              } as any
                            })}
                          >
                            <SelectTrigger id="smoking-policy">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-allowed-inside">Not allowed inside</SelectItem>
                              <SelectItem value="designated-areas">Designated areas only</SelectItem>
                              <SelectItem value="allowed-everywhere">Allowed everywhere</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smoking-details">Additional Details</Label>
                          <Textarea
                            id="smoking-details"
                            value={(property.details?.advancedConfig?.rules as any)?.smokingDetails || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    smokingDetails: e.target.value 
                                  }
                                }
                              } as any
                            })}
                            placeholder="Additional smoking policy details"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Events & Meetings */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🎵</div>
                        <div>
                          <Label className="font-semibold">Events & Meetings</Label>
                          <p className="text-sm text-muted-foreground">Configure event and meeting policies</p>
                        </div>
                      </div>
                      <Switch
                        checked={property.details?.advancedConfig?.rules?.meetings?.allowed || false}
                        onCheckedChange={(checked) => updateProperty({
                          details: {
                            ...property.details,
                            advancedConfig: {
                              ...property.details?.advancedConfig,
                              rules: { 
                                ...property.details?.advancedConfig?.rules, 
                                meetings: { 
                                  ...property.details?.advancedConfig?.rules?.meetings,
                                  allowed: checked 
                                }
                              }
                            }
                          } as any
                        })}
                      />
                    </div>
                    {property.details?.advancedConfig?.rules?.meetings?.allowed && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="event-policy-desc">Event Policy Description</Label>
                          <Input
                            id="event-policy-desc"
                            value={(property.details?.advancedConfig?.rules?.meetings as any)?.description || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules,
                                    meetings: {
                                      ...property.details?.advancedConfig?.rules?.meetings,
                                      description: e.target.value
                                    }
                                  }
                                }
                              } as any
                            })}
                            placeholder="e.g., Weekend meetings are allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed Days</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                              const allowedDays = (property.details?.advancedConfig?.rules?.meetings as any)?.allowedDays || [];
                              return (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`day-${day}`}
                                    checked={allowedDays.includes(day)}
                                    onCheckedChange={(checked) => {
                                      const newDays = checked
                                        ? [...allowedDays, day]
                                        : allowedDays.filter((d: string) => d !== day);
                                      updateProperty({
                                        details: {
                                          ...property.details,
                                          advancedConfig: {
                                            ...property.details?.advancedConfig,
                                            rules: { 
                                              ...property.details?.advancedConfig?.rules,
                                              meetings: {
                                                ...property.details?.advancedConfig?.rules?.meetings,
                                                allowedDays: newDays
                                              }
                                            }
                                          }
                                        } as any
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`day-${day}`} className="cursor-pointer font-normal">{day}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="end-time-limit">End Time Limit</Label>
                            <Select
                              value={(property.details?.advancedConfig?.rules?.meetings as any)?.endTimeLimit || '10:00 PM'}
                              onValueChange={(value) => updateProperty({
                                details: {
                                  ...property.details,
                                  advancedConfig: {
                                    ...property.details?.advancedConfig,
                                    rules: { 
                                      ...property.details?.advancedConfig?.rules,
                                      meetings: {
                                        ...property.details?.advancedConfig?.rules?.meetings,
                                        endTimeLimit: value
                                      }
                                    }
                                  }
                                } as any
                              })}
                            >
                              <SelectTrigger id="end-time-limit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="8:00 PM">8:00 PM</SelectItem>
                                <SelectItem value="9:00 PM">9:00 PM</SelectItem>
                                <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                                <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                                <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-guests">Maximum Guests</Label>
                            <Input
                              id="max-guests"
                              type="number"
                              min="0"
                              value={(property.details?.advancedConfig?.rules?.meetings as any)?.maxGuests || 5}
                              onChange={(e) => updateProperty({
                                details: {
                                  ...property.details,
                                  advancedConfig: {
                                    ...property.details?.advancedConfig,
                                    rules: { 
                                      ...property.details?.advancedConfig?.rules,
                                      meetings: {
                                        ...property.details?.advancedConfig?.rules?.meetings,
                                        maxGuests: Number(e.target.value)
                                      }
                                    }
                                  }
                                } as any
                              })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Parking */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🚗</div>
                        <div>
                          <Label className="font-semibold">Parking</Label>
                          <p className="text-sm text-muted-foreground">Configure parking availability for tenants</p>
                        </div>
                      </div>
                      <Switch
                        checked={(property.additionalInfo?.parking || 0) > 0}
                        onCheckedChange={(checked) => updateProperty({
                          additionalInfo: { 
                            ...property.additionalInfo, 
                            parking: checked ? 1 : 0 
                          } as any
                        })}
                      />
                    </div>
                    {(property.additionalInfo?.parking || 0) > 0 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="parking-spaces">Number of Parking Spaces</Label>
                          <Input
                            id="parking-spaces"
                            type="number"
                            min="0"
                            value={property.additionalInfo?.parking || 0}
                            onChange={(e) => updateProperty({
                              additionalInfo: { 
                                ...property.additionalInfo, 
                                parking: Number(e.target.value) 
                              } as any
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parking-desc">Parking Description</Label>
                          <Input
                            id="parking-desc"
                            value={(property.additionalInfo as any)?.parkingDescription || ''}
                            onChange={(e) => updateProperty({
                              additionalInfo: { 
                                ...property.additionalInfo, 
                                parkingDescription: e.target.value 
                              } as any
                            })}
                            placeholder="e.g., Covered parking spaces available for tenants"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contract Configuration */}
            </div>

            {/* Right Column - Pricing Sidebar */}
            <div className="space-y-6">
              {/* Complete Property Pricing */}
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <p className="text-lg font-semibold">Complete Property Pricing</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="price" className="font-semibold">Monthly Rent Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={property.pricing?.totalPrice || 0}
                      onChange={(e) => updateProperty({ 
                        pricing: { ...property.pricing, totalPrice: Number(e.target.value) } as any
                      })}
                      min="0"
                      placeholder="35000"
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={property.contracts?.requiresDeposit || false}
                          onChange={(e) => updateProperty({
                            contracts: { ...property.contracts, requiresDeposit: e.target.checked } as any
                          })}
                          className="w-4 h-4"
                        />
                        Requires Security Deposit
                      </Label>
                    </div>
                    {property.contracts?.requiresDeposit && (
                      <div>
                        <Label htmlFor="depositAmount" className="font-semibold">Security Deposit Amount</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          value={property.contracts?.depositAmount || 0}
                          onChange={(e) => updateProperty({
                            contracts: { ...property.contracts, depositAmount: Number(e.target.value) } as any
                          })}
                          min="0"
                          placeholder="17500"
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <p className="text-lg font-semibold">Contract Configuration</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Contract Duration</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select the contract durations you're willing to accept
                    </p>
                    <div className="space-y-3">
                      <Label className="text-sm mb-2 block">Accepted Contract Durations</Label>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            <span>
                              {selectedMonths.length === 0
                                ? "Select contract durations"
                                : `${selectedMonths.length} duration${selectedMonths.length === 1 ? '' : 's'} selected`}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-4" align="start">
                          <div className="space-y-2">
                            <div className="text-sm font-medium mb-3">Select contract durations</div>
                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((month) => (
                                <label
                                  key={month}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                                >
                                  <Checkbox
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
                                  <span className="text-sm">
                                    {month} {month === '1' ? 'month' : 'months'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {selectedMonths.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedMonths.sort((a, b) => parseInt(a) - parseInt(b)).map((month) => (
                            <Badge key={month} variant="secondary" className="text-sm">
                              {month} {month === '1' ? 'month' : 'months'}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {selectedMonths.length === 0 
                          ? '12 months is selected by default. You can select multiple durations.' 
                          : ''}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Contract Type</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose between ROC's standard contract or upload your own
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setContractType('template');
                          updateProperty({
                            contracts: { ...property.contracts, contractType: 'template' } as any
                          });
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          contractType === 'template' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <FileText className={`w-8 h-8 mx-auto mb-2 ${contractType === 'template' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">ROC Contract</p>
                        <p className="text-xs text-muted-foreground mt-1">Use our standard contract template</p>
                        {contractType === 'template' && (
                          <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                            👁️ View PDF
                          </Button>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setContractType('custom');
                          updateProperty({
                            contracts: { ...property.contracts, contractType: 'custom' } as any
                          });
                          // Trigger file input click after a short delay to ensure state updates
                          setTimeout(() => {
                            contractFileInputRef.current?.click();
                          }, 100);
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          contractType === 'custom' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${contractType === 'custom' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">Custom Contract</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload your own contract template</p>
                      </button>
                    </div>
                  </div>

                  {contractType === 'custom' && (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors mt-4">
                      <input
                        ref={contractFileInputRef}
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
                        id="contract-upload-entire"
                      />
                      <label htmlFor="contract-upload-entire" className="cursor-pointer">
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
                  )}
                </CardContent>
              </Card>
          </div>
        ) : (
          // Two-column layout for Rooms Rental
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
              {/* Property Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Add at least 5 photos of the property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="relative">
              <input
                id="photos-rooms"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePropertyPhotoUpload}
              />
              <label
                htmlFor="photos-rooms"
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
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                      {index + 1}
                    </div>
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
                <p className="text-lg font-semibold">Property Details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name-rooms">Property Name</Label>
                  <Input
                    id="name-rooms"
                    value={property.details?.name || ''}
                    onChange={(e) => updateProperty({ 
                      details: { ...property.details, name: e.target.value } as any
                    })}
                    placeholder="House by rooms in Rice Valley"
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="description-rooms">Property Description</Label>
                  <Textarea
                    id="description-rooms"
                    value={property.details?.description || ''}
                    onChange={(e) => updateProperty({ 
                      details: { ...property.details, description: e.target.value } as any
                    })}
                    placeholder="Describe your property..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType-rooms">Property Type</Label>
                    <Select 
                      value={property.propertyType || 'casa'} 
                      onValueChange={(value: any) => updateProperty({ propertyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casa">House</SelectItem>
                        <SelectItem value="departamento">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="furniture-rooms">Furniture Level</Label>
                    <Select 
                      value={property.furniture} 
                      onValueChange={(value: any) => updateProperty({ furniture: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amueblada">Furnished</SelectItem>
                        <SelectItem value="semi-amueblada">Semi-furnished</SelectItem>
                        <SelectItem value="sin-amueblar">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="scheme-rooms">Gender Scheme</Label>
                  <Select 
                    value={property.scheme || 'mixto'} 
                    onValueChange={(value: any) => updateProperty({ scheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixto">Mixed</SelectItem>
                      <SelectItem value="mujeres">Women only</SelectItem>
                      <SelectItem value="hombres">Men only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

                          {/* General Information */}
              <Card>
                <CardHeader>
                  <p className="text-lg font-semibold">General Information</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="area-rooms">Area (m²)</Label>
                      <Input
                        id="area-rooms"
                        type="number"
                        value={property.additionalInfo?.area || 0}
                        onChange={(e) => updateProperty({ 
                          additionalInfo: { ...property.additionalInfo, area: Number(e.target.value) } as any
                        })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms-rooms">Bathrooms</Label>
                      <Input
                        id="bathrooms-rooms"
                        type="number"
                        value={property.additionalInfo?.bathrooms || 0}
                        onChange={(e) => updateProperty({ 
                          additionalInfo: { ...property.additionalInfo, bathrooms: Number(e.target.value) } as any
                        })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rooms-count">Number of Rooms</Label>
                      <Input
                        id="rooms-count"
                        type="number"
                        value={property.rooms?.length || 0}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* House Rules & Policies */}
              <Card>
                <CardHeader>
                  <p className="text-lg font-semibold">House Rules & Policies</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pets */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-primary">🐾</div>
                      <div className="flex-1">
                        <Label className="font-semibold">Pets *</Label>
                        <p className="text-sm text-muted-foreground">Configure pet policy (required)</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="pets-allowed-rooms" 
                          checked={property.details?.advancedConfig?.rules?.pets === true}
                          onChange={() => updateProperty({
                            details: {
                              ...property.details,
                              advancedConfig: {
                                ...property.details?.advancedConfig,
                                rules: { ...property.details?.advancedConfig?.rules, pets: true }
                              }
                            } as any
                          })}
                        />
                        <Label htmlFor="pets-allowed-rooms" className="font-normal cursor-pointer">Pets allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="pets-not-allowed-rooms" 
                          checked={property.details?.advancedConfig?.rules?.pets === false}
                          onChange={() => updateProperty({
                            details: {
                              ...property.details,
                              advancedConfig: {
                                ...property.details?.advancedConfig,
                                rules: { ...property.details?.advancedConfig?.rules, pets: false }
                              }
                            } as any
                          })}
                        />
                        <Label htmlFor="pets-not-allowed-rooms" className="font-normal cursor-pointer">Pets not allowed</Label>
                      </div>
                    </div>
                    {property.details?.advancedConfig?.rules?.pets && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="pet-policy-desc-rooms">Pet Policy Description</Label>
                          <Input
                            id="pet-policy-desc-rooms"
                            value={(property.details?.advancedConfig?.rules as any)?.petPolicy || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    petPolicy: e.target.value 
                                  }
                                }
                              } as any
                            })}
                            placeholder="e.g., One small pet per user is allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-pets-rooms">Maximum Pets per User</Label>
                          <Input
                            id="max-pets-rooms"
                            type="number"
                            min="0"
                            value={(property.details?.advancedConfig?.rules as any)?.maxPetsPerUser || 1}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    maxPetsPerUser: Number(e.target.value) 
                                  }
                                }
                              } as any
                            })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Smoking */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🚬</div>
                        <div>
                          <Label className="font-semibold">Smoking</Label>
                          <p className="text-sm text-muted-foreground">Configure smoking policy</p>
                        </div>
                      </div>
                      <Switch
                        checked={property.details?.advancedConfig?.rules?.smoking || false}
                        onCheckedChange={(checked) => updateProperty({
                          details: {
                            ...property.details,
                            advancedConfig: {
                              ...property.details?.advancedConfig,
                              rules: { ...property.details?.advancedConfig?.rules, smoking: checked }
                            }
                          } as any
                        })}
                      />
                    </div>
                    {property.details?.advancedConfig?.rules?.smoking && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="smoking-policy-rooms">Smoking Policy</Label>
                          <Select
                            value={(property.details?.advancedConfig?.rules as any)?.smokingPolicy || 'not-allowed-inside'}
                            onValueChange={(value) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    smokingPolicy: value 
                                  }
                                }
                              } as any
                            })}
                          >
                            <SelectTrigger id="smoking-policy-rooms">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-allowed-inside">Not allowed inside</SelectItem>
                              <SelectItem value="designated-areas">Designated areas only</SelectItem>
                              <SelectItem value="allowed-everywhere">Allowed everywhere</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smoking-details-rooms">Additional Details</Label>
                          <Textarea
                            id="smoking-details-rooms"
                            value={(property.details?.advancedConfig?.rules as any)?.smokingDetails || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules, 
                                    smokingDetails: e.target.value 
                                  }
                                }
                              } as any
                            })}
                            placeholder="Additional smoking policy details"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Events & Meetings */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🎵</div>
                        <div>
                          <Label className="font-semibold">Events & Meetings</Label>
                          <p className="text-sm text-muted-foreground">Configure event and meeting policies</p>
                        </div>
                      </div>
                      <Switch
                        checked={property.details?.advancedConfig?.rules?.meetings?.allowed || false}
                        onCheckedChange={(checked) => updateProperty({
                          details: {
                            ...property.details,
                            advancedConfig: {
                              ...property.details?.advancedConfig,
                              rules: { 
                                ...property.details?.advancedConfig?.rules, 
                                meetings: { 
                                  ...property.details?.advancedConfig?.rules?.meetings,
                                  allowed: checked 
                                }
                              }
                            }
                          } as any
                        })}
                      />
                    </div>
                    {property.details?.advancedConfig?.rules?.meetings?.allowed && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="event-policy-desc-rooms">Event Policy Description</Label>
                          <Input
                            id="event-policy-desc-rooms"
                            value={(property.details?.advancedConfig?.rules?.meetings as any)?.description || ''}
                            onChange={(e) => updateProperty({
                              details: {
                                ...property.details,
                                advancedConfig: {
                                  ...property.details?.advancedConfig,
                                  rules: { 
                                    ...property.details?.advancedConfig?.rules,
                                    meetings: {
                                      ...property.details?.advancedConfig?.rules?.meetings,
                                      description: e.target.value
                                    }
                                  }
                                }
                              } as any
                            })}
                            placeholder="e.g., Weekend meetings are allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed Days</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                              const allowedDays = (property.details?.advancedConfig?.rules?.meetings as any)?.allowedDays || [];
                              return (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`day-${day}-rooms`}
                                    checked={allowedDays.includes(day)}
                                    onCheckedChange={(checked) => {
                                      const newDays = checked
                                        ? [...allowedDays, day]
                                        : allowedDays.filter((d: string) => d !== day);
                                      updateProperty({
                                        details: {
                                          ...property.details,
                                          advancedConfig: {
                                            ...property.details?.advancedConfig,
                                            rules: { 
                                              ...property.details?.advancedConfig?.rules,
                                              meetings: {
                                                ...property.details?.advancedConfig?.rules?.meetings,
                                                allowedDays: newDays
                                              }
                                            }
                                          }
                                        } as any
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`day-${day}-rooms`} className="cursor-pointer font-normal">{day}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="end-time-limit-rooms">End Time Limit</Label>
                            <Select
                              value={(property.details?.advancedConfig?.rules?.meetings as any)?.endTimeLimit || '10:00 PM'}
                              onValueChange={(value) => updateProperty({
                                details: {
                                  ...property.details,
                                  advancedConfig: {
                                    ...property.details?.advancedConfig,
                                    rules: { 
                                      ...property.details?.advancedConfig?.rules,
                                      meetings: {
                                        ...property.details?.advancedConfig?.rules?.meetings,
                                        endTimeLimit: value
                                      }
                                    }
                                  }
                                } as any
                              })}
                            >
                              <SelectTrigger id="end-time-limit-rooms">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="8:00 PM">8:00 PM</SelectItem>
                                <SelectItem value="9:00 PM">9:00 PM</SelectItem>
                                <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                                <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                                <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-guests-rooms">Maximum Guests</Label>
                            <Input
                              id="max-guests-rooms"
                              type="number"
                              min="0"
                              value={(property.details?.advancedConfig?.rules?.meetings as any)?.maxGuests || 5}
                              onChange={(e) => updateProperty({
                                details: {
                                  ...property.details,
                                  advancedConfig: {
                                    ...property.details?.advancedConfig,
                                    rules: { 
                                      ...property.details?.advancedConfig?.rules,
                                      meetings: {
                                        ...property.details?.advancedConfig?.rules?.meetings,
                                        maxGuests: Number(e.target.value)
                                      }
                                    }
                                  }
                                } as any
                              })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Parking */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">🚗</div>
                        <div>
                          <Label className="font-semibold">Parking</Label>
                          <p className="text-sm text-muted-foreground">Configure parking availability for tenants</p>
                        </div>
                      </div>
                      <Switch
                        checked={(property.additionalInfo?.parking || 0) > 0}
                        onCheckedChange={(checked) => updateProperty({
                          additionalInfo: { 
                            ...property.additionalInfo, 
                            parking: checked ? 1 : 0 
                          } as any
                        })}
                      />
                    </div>
                    {(property.additionalInfo?.parking || 0) > 0 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="parking-spaces-rooms">Number of Parking Spaces</Label>
                          <Input
                            id="parking-spaces-rooms"
                            type="number"
                            min="0"
                            value={property.additionalInfo?.parking || 0}
                            onChange={(e) => updateProperty({
                              additionalInfo: { 
                                ...property.additionalInfo, 
                                parking: Number(e.target.value) 
                              } as any
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parking-desc-rooms">Parking Description</Label>
                          <Input
                            id="parking-desc-rooms"
                            value={(property.additionalInfo as any)?.parkingDescription || ''}
                            onChange={(e) => updateProperty({
                              additionalInfo: { 
                                ...property.additionalInfo, 
                                parkingDescription: e.target.value 
                              } as any
                            })}
                            placeholder="e.g., Covered parking spaces available for tenants"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contract Configuration */}
              {/* <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle>Contract Configuration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Contract Duration</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select the contract durations you're willing to accept
                    </p>
                    <div>
                      <Label className="text-sm mb-2 block">Accepted Contract Durations</Label>
                      <Select
                        value={selectedMonths[0] || '12'}
                        onValueChange={(value) => {
                          setSelectedMonths([value]);
                          updateProperty({
                            contracts: {
                              ...property.contracts,
                              standardOptions: [value]
                            } as any
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((month) => (
                            <SelectItem key={month} value={month}>
                              {month} {month === '1' ? 'month' : 'months'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        12 months is selected by default. You can select multiple durations.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Contract Type</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose between ROC's standard contract or upload your own
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setContractType('template');
                          updateProperty({
                            contracts: { ...property.contracts, contractType: 'template' } as any
                          });
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          contractType === 'template' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <FileText className={`w-8 h-8 mx-auto mb-2 ${contractType === 'template' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">ROC Contract</p>
                        <p className="text-xs text-muted-foreground mt-1">Use our standard contract template</p>
                        {contractType === 'template' && (
                          <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                            👁️ View PDF
                          </Button>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setContractType('custom');
                          updateProperty({
                            contracts: { ...property.contracts, contractType: 'custom' } as any
                          });
                        }}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          contractType === 'custom' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${contractType === 'custom' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">Custom Contract</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload your own contract template</p>
                        {contractType === 'custom' && (
                          <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                            📤 Upload File
                          </Button>
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>

          {/* Right Column - Rooms and Roommates Cards */}
          <div className="space-y-6">
            {/* Rooms Available for rent Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg font-semibold">Rooms Available for rent</p>
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
                    <div className="px-4 py-1 bg-muted rounded-md font-semibold min-w-[3rem] text-center">
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
              <CardContent className="space-y-3">
                {(property.rooms?.length || 0) === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-medium text-muted-foreground">No rooms added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the + button to add your first room
                    </p>
                  </div>
                ) : (
                  <>
                    {property.rooms.map((room, index) => (
                      <div
                        key={room.id}
                        className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => openRoomModal(room.id)}
                      >
                        <div className="flex gap-3">
                          {/* Room Image */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {room.photos && room.photos.length > 0 ? (
                                <img 
                                  src={room.photos[0]} 
                                  alt={room.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{room.name}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {room.furniture === 'amueblada' ? 'Furnished' : room.furniture === 'semi-amueblada' ? 'Semi-furnished' : 'Unfurnished'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-base font-bold">${room.price || 0}</span>
                                  <span className="text-xs text-muted-foreground">/ monthly</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Available: {room.availableFrom ? new Date(room.availableFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoom(room.id);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Roommates Living in Property Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg font-semibold">Roommates Living in Property</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (roommates.length > 0) {
                          removeRoommate(roommates[roommates.length - 1].id);
                        }
                      }}
                      disabled={roommates.length === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="px-4 py-1 bg-muted rounded-md font-semibold min-w-[3rem] text-center">
                      {roommates.length}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRoommate}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {roommates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-medium text-muted-foreground">No roommates added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the + button to add your first roommate
                    </p>
                  </div>
                ) : (
                  <>
                    {roommates.map((roommate, index) => (
                      <div
                        key={roommate.id}
                        className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => openRoommateModal(roommate.id)}
                      >
                        <div className="flex gap-3">
                          {/* Roommate Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          </div>

                          {/* Roommate Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">Roommate {index + 1}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {roommate.gender} • {roommate.age} years old
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {roommate.occupation || 'No occupation set'}
                                </p>
                                {roommate.personality && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {roommate.personality}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoommate(roommate.id);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}
        {/* Contract Configuration - Only for rooms rental */}
        {isRoomsRental && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <p className="text-lg font-semibold">Contract Configuration</p>
              </CardTitle>
              <CardDescription>Configure contract type and duration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Duration Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Contract Duration Options</Label>
                <p className="text-sm text-muted-foreground">Select which contract durations you want to offer</p>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>
                        {selectedMonths.length === 0
                          ? "Select contract durations"
                          : `${selectedMonths.length} duration${selectedMonths.length === 1 ? '' : 's'} selected`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-4" align="start">
                    <div className="space-y-2">
                      <div className="text-sm font-medium mb-3">Select contract durations</div>
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((month) => (
                          <label
                            key={month}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                          >
                            <Checkbox
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
                            <span className="text-sm">
                              {month} {month === '1' ? 'month' : 'months'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {selectedMonths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMonths.sort((a, b) => parseInt(a) - parseInt(b)).map((month) => (
                      <Badge key={month} variant="secondary" className="text-sm">
                        {month} {month === '1' ? 'month' : 'months'}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Contract Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Contract Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setContractType('template');
                      updateProperty({
                        contracts: { ...property.contracts, contractType: 'template' } as any
                      });
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      contractType === 'template' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <FileText className={`w-8 h-8 mx-auto mb-2 ${contractType === 'template' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium">ROC Standard Contract</p>
                    <p className="text-xs text-muted-foreground mt-1">Legally protected standard contract</p>
                  </button>
                  <button
                    onClick={() => {
                      setContractType('custom');
                      updateProperty({
                        contracts: { ...property.contracts, contractType: 'custom' } as any
                      });
                      // Trigger file input click after a short delay to ensure state updates
                      setTimeout(() => {
                        contractFileInputRef.current?.click();
                      }, 100);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      contractType === 'custom' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${contractType === 'custom' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium">Custom Contract</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload your own contract</p>
                  </button>
                </div>

                {contractType === 'custom' && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors mt-4">
                    <input
                      ref={contractFileInputRef}
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
                      id="contract-upload-rooms"
                    />
                    <label htmlFor="contract-upload-rooms" className="cursor-pointer">
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
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposit Configuration - Only for rooms rental */}
        {isRoomsRental && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <p className="text-lg font-semibold">Deposit Configuration</p>
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
                  <Label htmlFor="depositAmount-rooms">Deposit Amount (MXN)</Label>
                  <Input
                    id="depositAmount-rooms"
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
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
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

        {/* Room Edit Modal */}
        <Dialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Room Details</DialogTitle>
            </DialogHeader>
            
            {editingRoomId && property.rooms && (() => {
              const room = property.rooms.find(r => r.id === editingRoomId);
              if (!room) return null;
              
              return (
                <div className="space-y-4 py-4">
                  {/* Room Photos */}
                  <div className="space-y-2">
                    <Label>Room Photos</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 bg-muted/20">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleRoomPhotoUpload(room.id, e)}
                        className="hidden"
                        id={`room-photo-modal-${room.id}`}
                      />
                      
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your room photos here, or click to browse
                        </p>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={() => document.getElementById(`room-photo-modal-${room.id}`)?.click()}
                        >
                          Choose Photos
                        </Button>
                      </div>
                      
                      {room.photos && room.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                          {room.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={photo} 
                                alt={`Room ${index + 1}`} 
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = room.photos?.filter((_, i) => i !== index) || [];
                                  updateRoom(room.id, { photos: newPhotos });
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Name */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-name">Room Name</Label>
                    <Input
                      id="modal-room-name"
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                      placeholder="Room"
                    />
                  </div>

                  {/* Room Description */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-description">Room Description</Label>
                    <Textarea
                      id="modal-room-description"
                      value={room.description || ''}
                      onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                      placeholder="Describe the room features, amenities, etc."
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(room.description?.length || 0)}/500 characters
                    </p>
                  </div>

                  {/* Room Characteristics */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-characteristics">Room Characteristics</Label>
                    <Select
                      value={room.characteristics}
                      onValueChange={(value: any) => updateRoom(room.id, { characteristics: value })}
                    >
                      <SelectTrigger id="modal-room-characteristics">
                        <SelectValue placeholder="Select characteristics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walking_closet_bathroom_terrace">With walking closet, full bathroom and terrace</SelectItem>
                        <SelectItem value="walking_closet_bathroom">With walking closet and full bathroom</SelectItem>
                        <SelectItem value="closet_bathroom_terrace">With closet, full bathroom and terrace</SelectItem>
                        <SelectItem value="closet_bathroom">With closet and full bathroom</SelectItem>
                        <SelectItem value="closet_shared_bathroom">With closet and shared bathroom</SelectItem>
                        <SelectItem value="service_room_bathroom">Service room with full bathroom</SelectItem>
                        <SelectItem value="service_room_shared_bathroom">Service room with shared bathroom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Furniture Level */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-furniture">Furniture Level</Label>
                    <Select
                      value={room.furniture}
                      onValueChange={(value: any) => updateRoom(room.id, { furniture: value })}
                    >
                      <SelectTrigger id="modal-room-furniture">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amueblada">Furnished</SelectItem>
                        <SelectItem value="semi-amueblada">Semi-furnished</SelectItem>
                        <SelectItem value="sin-amueblar">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monthly Price */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-price">$ Monthly Price</Label>
                    <Input
                      id="modal-room-price"
                      type="number"
                      value={room.price || 0}
                      onChange={(e) => updateRoom(room.id, { price: Number(e.target.value) })}
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  {/* Requires Deposit */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modal-room-deposit"
                      checked={room.requiresDeposit || false}
                      onCheckedChange={(checked) => updateRoom(room.id, { 
                        requiresDeposit: checked as boolean,
                        depositAmount: checked ? room.depositAmount : 0
                      })}
                    />
                    <Label htmlFor="modal-room-deposit" className="cursor-pointer">
                      Requires deposit
                    </Label>
                  </div>

                  {/* Deposit Amount (conditional) */}
                  {room.requiresDeposit && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="modal-room-deposit-amount">Deposit Amount</Label>
                      <Input
                        id="modal-room-deposit-amount"
                        type="number"
                        value={room.depositAmount || 0}
                        onChange={(e) => updateRoom(room.id, { depositAmount: Number(e.target.value) })}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  )}

                  {/* Available From */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-room-available">Available From</Label>
                    <Input
                      id="modal-room-available"
                      type="date"
                      value={room.availableFrom ? new Date(room.availableFrom).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateRoom(room.id, { availableFrom: new Date(e.target.value) })}
                    />
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeRoomModal}>
                Cancel
              </Button>
              <Button onClick={closeRoomModal} className="bg-primary">
                Save Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Roommate Edit Modal */}
        <Dialog open={roommateModalOpen} onOpenChange={setRoommateModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Roommate Details</DialogTitle>
            </DialogHeader>
            
            {editingRoommateId && roommates && (() => {
              const roommate = roommates.find(r => r.id === editingRoommateId);
              if (!roommate) return null;
              
              return (
                <div className="space-y-4 py-4">
                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-roommate-gender">Gender</Label>
                    <Select 
                      value={roommate.gender} 
                      onValueChange={(value: 'male' | 'female' | 'other') => 
                        updateRoommate(roommate.id, { gender: value })
                      }
                    >
                      <SelectTrigger id="modal-roommate-gender">
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
                    <Label htmlFor="modal-roommate-age">Age</Label>
                    <Input
                      id="modal-roommate-age"
                      type="number"
                      value={roommate.age}
                      onChange={(e) => updateRoommate(roommate.id, { age: parseInt(e.target.value) || 18 })}
                      min="18"
                      max="100"
                      placeholder="25"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-roommate-occupation">Occupation</Label>
                    <Select 
                      value={roommate.occupation} 
                      onValueChange={(value) => 
                        updateRoommate(roommate.id, { occupation: value })
                      }
                    >
                      <SelectTrigger id="modal-roommate-occupation">
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

                  {/* Personality */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-roommate-personality">Personality</Label>
                    <Textarea
                      id="modal-roommate-personality"
                      value={roommate.personality}
                      onChange={(e) => updateRoommate(roommate.id, { personality: e.target.value })}
                      placeholder="e.g., Calm, Sociable, Studious..."
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {roommate.personality?.length || 0}/200 characters
                    </p>
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeRoommateModal}>
                Cancel
              </Button>
              <Button onClick={closeRoommateModal} className="bg-primary">
                Save Roommate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PropertyConfigurationPage; 