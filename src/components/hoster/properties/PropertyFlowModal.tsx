import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Property } from '@/types/property'
import { ProgressBar } from './ProgressBar'
import { PropertyTypeStep } from './flow-steps/PropertyTypeStep'
import { LocationStep } from './flow-steps/LocationStep'
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
  | 'location';

// Simplified flow - only 2 steps for now
const FLOW_STEPS: FlowStep[] = [
  'property-type',
  'location'
];

export const PropertyFlowModal = ({ open, onOpenChange, unitType, onPropertyCreated }: PropertyFlowModalProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('property-type');
  const [property, setProperty] = useState<Partial<Property>>({
    type: unitType || 'rooms',
    propertyType: 'departamento', // Casa or Departamento
    rooms: [],
    location: { address: '', lat: 0, lng: 0, zone: '' },
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

  const currentStepIndex = FLOW_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / FLOW_STEPS.length) * 100;

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < FLOW_STEPS.length) {
      setCurrentStep(FLOW_STEPS[nextIndex]);
    } else {
      // All steps completed, show confirmation modal
      setShowConfirmationModal(true);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(FLOW_STEPS[prevIndex]);
    }
  };

  const updateProperty = (updates: Partial<Property>) => {
    setProperty(prev => ({ ...prev, ...updates }));
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
      default:
        return null;
    }
  };

  // const stepTitle = property.type === 'rooms' ? 'Create Room Rental' : 'Create Property Rental';

  return (
    <>
      <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* <DialogHeader>
            <DialogTitle>{stepTitle}</DialogTitle>
          </DialogHeader> */}
          
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
          <div className="text-center space-y-6 p-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold">
                Property <span className="text-purple-600">Created!</span>
              </h2>
              <p className="text-muted-foreground mt-3">
                You've successfully created your property. You can finish configuring it now or complete the setup later.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline"
                onClick={handleSaveForLater}
                className="flex-1"
                disabled={isSubmitting}
              >
                Save for Later
              </Button>
              
              <Button 
                onClick={handleFinishNow}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                disabled={isSubmitting}
              >
                Finish Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
