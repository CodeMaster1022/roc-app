import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Property } from "@/types/property";
import { PropertyTypeStep } from "./flow-steps/PropertyTypeStep";
import { FurnitureStep } from "./flow-steps/FurnitureStep";
import { LocationStep } from "./flow-steps/LocationStep";
import { RoomsQuantityStep } from "./flow-steps/RoomsQuantityStep";
import { RoomCharacteristicsStep } from "./flow-steps/RoomCharacteristicsStep";
import { AdditionalInfoStep } from "./flow-steps/AdditionalInfoStep";
import { PricingStep } from "./flow-steps/PricingStep";
import { ContractsStep } from "./flow-steps/ContractsStep";
import { PropertyDetailsStep } from "./flow-steps/PropertyDetailsStep";
import { ProgressBar } from "./ProgressBar";

interface PropertyEditModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (property: Property) => void;
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

export const PropertyEditModal = ({ property: initialProperty, open, onOpenChange, onSave }: PropertyEditModalProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('property-type');
  const [property, setProperty] = useState<Partial<Property>>({});

  // Initialize property data when modal opens
  useEffect(() => {
    if (initialProperty && open) {
      setProperty(initialProperty);
      setCurrentStep('property-type');
    }
  }, [initialProperty, open]);

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

  const handleComplete = () => {
    console.log('Property updated:', property);
    if (onSave && property as Property) {
      onSave(property as Property);
    }
    onOpenChange(false);
    setCurrentStep('property-type');
  };

  if (!initialProperty) return null;

  const renderStep = () => {
    const stepProps = {
      property,
      updateProperty,
      onNext: nextStep,
      onPrev: prevStep,
      onComplete: handleComplete
    };

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
        return <PropertyDetailsStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <ProgressBar progress={progress} />
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};