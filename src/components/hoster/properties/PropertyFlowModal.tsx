import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Property } from '@/types/property'
import { ProgressBar } from './ProgressBar'
import { PropertyTypeStep } from './flow-steps/PropertyTypeStep'
import { FurnitureStep } from './flow-steps/FurnitureStep'
import { LocationStep } from './flow-steps/LocationStep'
import { PropertyPhotosStep } from './flow-steps/PropertyPhotosStep'
import { RoomsQuantityStep } from './flow-steps/RoomsQuantityStep'
import { RoomCharacteristicsStep } from './flow-steps/RoomCharacteristicsStep'
import { RoommatesStep } from './flow-steps/RoommatesStep'
import { AdditionalInfoStep } from './flow-steps/AdditionalInfoStep'
import { PricingStep } from './flow-steps/PricingStep'
import { ContractsStep } from './flow-steps/ContractsStep'
import { PropertyDetailsStep } from './flow-steps/PropertyDetailsStep'
import { propertyService } from '@/services/propertyService'
import { transformFrontendToBackend } from '@/utils/propertyTransform'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface PropertyFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitType?: 'rooms' | 'property'
  onPropertyCreated?: (property: Property) => void
}

export type FlowStep = 
  | 'property-type'
  | 'location'
  | 'property-photos'
  | 'furniture'
  | 'rooms-quantity'
  | 'room-characteristics'
  | 'roommates'
  | 'additional-info'
  | 'pricing'
  | 'contracts'
  | 'property-details';

// Define flow paths based on property type
const ROOMS_FLOW_STEPS: FlowStep[] = [
  'property-type',
  'location',
  'property-photos',
  'rooms-quantity',
  'room-characteristics',
  'roommates',
  'additional-info',
  'pricing',
  'contracts',
  'property-details'
];

const PROPERTY_FLOW_STEPS: FlowStep[] = [
  'property-type',
  'location',
  'property-photos',
  'furniture',
  'additional-info',
  'pricing',
  'contracts',
  'property-details'
];

export const PropertyFlowModal = ({ open, onOpenChange, unitType, onPropertyCreated }: PropertyFlowModalProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('property-type');
  const [property, setProperty] = useState<Partial<Property>>({
    type: unitType || 'rooms',
    rooms: [],
    location: { address: '', lat: 0, lng: 0 },
    additionalInfo: { area: 0, parking: 0, bathrooms: 0 },
    pricing: { totalPrice: 0, rentalType: 'ambos' },
    contracts: { standardOptions: [], requiresDeposit: false },
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
    status: 'draft'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { toast } = useToast();

  // Get current flow steps based on property type
  const getFlowSteps = (): FlowStep[] => {
    return property.type === 'rooms' ? ROOMS_FLOW_STEPS : PROPERTY_FLOW_STEPS;
  };

  const currentStepIndex = getFlowSteps().indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / getFlowSteps().length) * 100;

  const nextStep = () => {
    const flowSteps = getFlowSteps();
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < flowSteps.length) {
      setCurrentStep(flowSteps[nextIndex]);
    }
  };

  const prevStep = () => {
    const flowSteps = getFlowSteps();
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(flowSteps[prevIndex]);
    }
  };

  const updateProperty = (updates: Partial<Property>) => {
    setProperty(prev => {
      const updated = { ...prev, ...updates };
      
      // If property type changed, reset to first step after property-type
      if (updates.type && updates.type !== prev.type) {
        const newFlowSteps = updates.type === 'rooms' ? ROOMS_FLOW_STEPS : PROPERTY_FLOW_STEPS;
        if (currentStep !== 'property-type') {
          setCurrentStep(newFlowSteps[1]); // Second step in the flow
        }
      }
      
      return updated;
    });
  };

  const handleComplete = async () => {
    console.log('🚀 PropertyFlowModal - handleComplete called');
    console.log('Property data:', property);
    
    if (!property || !property.details?.name || !property.details?.description) {
      console.log('❌ Validation failed:', {
        property: !!property,
        name: property?.details?.name,
        description: property?.details?.description
      });
      toast({
        title: "Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation modal instead of directly creating
    setShowConfirmationModal(true);
  };

  const handleFinishNow = async () => {
    await createProperty('review'); // Submit for review
  };

  const handleSaveForLater = async () => {
    await createProperty('draft'); // Save as draft with "Finish Configuration" status
  };

  const createProperty = async (status: 'draft' | 'review') => {
    console.log('✅ Starting property creation with status:', status);
    setIsSubmitting(true);
    setShowConfirmationModal(false);
    
    try {
      // Step 1: Transform data
      setSubmissionStep('Procesando información...');
      await new Promise(resolve => setTimeout(resolve, 500));
      const propertyWithStatus = { ...property, status } as Property;
      const backendPropertyData = transformFrontendToBackend(propertyWithStatus);
      console.log('🔄 Transformed data:', backendPropertyData);
      
      // Step 2: Upload images and create property
      setSubmissionStep('Subiendo imágenes...');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('📡 Calling API...');
      
      // Step 3: Save to database
      setSubmissionStep('Guardando en base de datos...');
      const response = await propertyService.createProperty(backendPropertyData);
      console.log('📡 API Response:', response);
      
      // Step 4: Finalizing
      setSubmissionStep('Finalizando...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const message = status === 'review' 
        ? "Property created successfully and submitted for review!"
        : "Property saved! You can finish the configuration later.";
      
      toast({
        title: "Success",
        description: message,
      });

      // Call the callback if provided
      if (onPropertyCreated) {
        onPropertyCreated(propertyWithStatus);
      }

      // Close modal and reset
      onOpenChange(false);
      resetForm();
      
    } catch (error: any) {
      console.error('❌ Error creating property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  const resetForm = () => {
    setCurrentStep('property-type');
    setProperty({
      type: unitType || 'rooms',
      rooms: [],
      location: { address: '', lat: 0, lng: 0 },
      additionalInfo: { area: 0, parking: 0, bathrooms: 0 },
      pricing: { totalPrice: 0, rentalType: 'ambos' },
      contracts: { standardOptions: [], requiresDeposit: false },
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
      status: 'draft'
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, unitType]);

  if (!unitType) return null;

  const renderStep = () => {
    const stepProps = {
      property,
      updateProperty,
      onNext: nextStep,
      onPrev: prevStep,
      onComplete: handleComplete,
      isSubmitting
    };

    console.log('Rendering step:', currentStep, 'Property type:', property.type);

    switch (currentStep) {
      case 'property-type':
        return <PropertyTypeStep {...stepProps} />;
      case 'location':
        return <LocationStep {...stepProps} />;
      case 'property-photos':
        return <PropertyPhotosStep {...stepProps} />;
      case 'furniture':
        return <FurnitureStep {...stepProps} />;
      case 'rooms-quantity':
        return <RoomsQuantityStep {...stepProps} />;
      case 'room-characteristics':
        return <RoomCharacteristicsStep {...stepProps} />;
      case 'roommates':
        return <RoommatesStep {...stepProps} />;
      case 'additional-info':
        return <AdditionalInfoStep {...stepProps} />;
      case 'pricing':
        return <PricingStep {...stepProps} />;
      case 'contracts':
        return <ContractsStep {...stepProps} />;
      case 'property-details':
        console.log('Rendering PropertyDetailsStep with onComplete:', handleComplete);
        return <PropertyDetailsStep {...stepProps} />;
      default:
        return null;
    }
  };

  const flowSteps = getFlowSteps();
  const stepTitle = property.type === 'rooms' ? 'Create Room Rental' : 'Create Property Rental';

  return (
    <>
      <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{stepTitle}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 relative">
            {/* Progress Overlay - Fixed to viewport center */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
                <div className="bg-card p-6 rounded-lg shadow-lg border flex flex-col items-center gap-4 min-w-[300px] mx-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Creando Propiedad</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${submissionStep.includes('Procesando') ? 'bg-primary animate-pulse' : submissionStep === 'Procesando información...' ? 'bg-muted' : 'bg-green-500'}`} />
                        <span className={submissionStep.includes('Procesando') ? 'text-primary font-medium' : ''}>
                          Procesando información
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${submissionStep.includes('Subiendo') ? 'bg-primary animate-pulse' : submissionStep === 'Subiendo imágenes...' ? 'bg-muted' : submissionStep.includes('Guardando') || submissionStep.includes('Finalizando') ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className={submissionStep.includes('Subiendo') ? 'text-primary font-medium' : ''}>
                          Subiendo imágenes
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${submissionStep.includes('Guardando') ? 'bg-primary animate-pulse' : submissionStep === 'Guardando en base de datos...' ? 'bg-muted' : submissionStep.includes('Finalizando') ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className={submissionStep.includes('Guardando') ? 'text-primary font-medium' : ''}>
                          Guardando en base de datos
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${submissionStep.includes('Finalizando') ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                        <span className={submissionStep.includes('Finalizando') ? 'text-primary font-medium' : ''}>
                          Finalizando
                        </span>
                      </div>
                    </div>
                    {submissionStep && (
                      <p className="text-primary font-medium mt-3">{submissionStep}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ProgressBar progress={progress} />
            {renderStep()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¡Propiedad configurada!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Tu propiedad ha sido configurada exitosamente. ¿Qué te gustaría hacer ahora?
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleFinishNow}
                className="w-full"
                disabled={isSubmitting}
              >
                Finalizar ahora
                <span className="text-xs block">Enviar para revisión</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSaveForLater}
                className="w-full"
                disabled={isSubmitting}
              >
                Guardar para después
                <span className="text-xs block">Aparecerá como "Finalizar configuración"</span>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Puedes continuar editando tu propiedad desde la lista de propiedades
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
