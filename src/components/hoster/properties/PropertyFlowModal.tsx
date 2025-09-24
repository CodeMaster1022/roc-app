import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Property } from '@/types/property'
import { ProgressBar } from './ProgressBar'
import { PropertyTypeStep } from './flow-steps/PropertyTypeStep'
import { FurnitureStep } from './flow-steps/FurnitureStep'
import { LocationStep } from './flow-steps/LocationStep'
import { RoomsQuantityStep } from './flow-steps/RoomsQuantityStep'
import { RoomCharacteristicsStep } from './flow-steps/RoomCharacteristicsStep'
import { AdditionalInfoStep } from './flow-steps/AdditionalInfoStep'
import { PricingStep } from './flow-steps/PricingStep'
import { ContractsStep } from './flow-steps/ContractsStep'
import { PropertyDetailsStep } from './flow-steps/PropertyDetailsStep'
import { propertyService } from '@/services/propertyService'
import { transformFrontendToBackend } from '@/utils/propertyTransform'
import { useToast } from '@/hooks/use-toast'

interface PropertyFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitType?: 'rooms' | 'property'
  onPropertyCreated?: (property: Property) => void
}

export type FlowStep = 
  | 'property-type'
  | 'furniture'
  | 'location'
  | 'rooms-quantity'
  | 'room-characteristics'
  | 'additional-info'
  | 'pricing'
  | 'contracts'
  | 'property-details';

const FLOW_STEPS: FlowStep[] = [
  'property-type',
  'furniture',
  'location',
  'rooms-quantity',
  'room-characteristics',
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
  const { toast } = useToast();

  const currentStepIndex = FLOW_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / FLOW_STEPS.length) * 100;

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < FLOW_STEPS.length) {
      setCurrentStep(FLOW_STEPS[nextIndex]);
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

    console.log('✅ Starting property creation...');
    setIsSubmitting(true);
    
    try {
      // Step 1: Transform data
      setSubmissionStep('Procesando información...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      const backendPropertyData = transformFrontendToBackend(property as Property);
      console.log('🔄 Transformed data:', backendPropertyData);
      
      // Step 2: Upload images and create property
      setSubmissionStep('Subiendo imágenes...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      console.log('📡 Calling API...');
      
      // Step 3: Save to database
      setSubmissionStep('Guardando en base de datos...');
      const response = await propertyService.createProperty(backendPropertyData);
      console.log('📡 API Response:', response);
      
      // Step 4: Finalizing
      setSubmissionStep('Finalizando...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Success",
        description: "Property created successfully!",
      });

      // Call the callback if provided
      if (onPropertyCreated) {
        onPropertyCreated(property as Property);
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

    console.log('Rendering step:', currentStep, 'onComplete function:', handleComplete.name);

    switch (currentStep) {
      case 'property-type':
        return <PropertyTypeStep {...stepProps} />;
      case 'furniture':
        return <FurnitureStep {...stepProps} />;
      case 'location':
        return <LocationStep {...stepProps} />;
      case 'rooms-quantity':
        return <RoomsQuantityStep {...stepProps} />;
      case 'room-characteristics':
        return <RoomCharacteristicsStep {...stepProps} />;
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

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Property</DialogTitle>
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
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full animate-pulse" style={{width: '100%'}} />
                </div>
              </div>
            </div>
          )}
          
          <ProgressBar 
            progress={progress} 
            
          />
          
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
