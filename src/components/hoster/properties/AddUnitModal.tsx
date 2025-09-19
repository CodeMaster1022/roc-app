import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, ArrowRight } from "lucide-react";
import { PropertyFlowModal } from "./PropertyFlowModal";
import { Property } from "@/types/property";

interface AddUnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyCreated?: (property: Property) => void;
}

export const AddUnitModal = ({ open, onOpenChange, onPropertyCreated }: AddUnitModalProps) => {
  const [selectedType, setSelectedType] = useState<'rooms' | 'property' | null>(null);
  const [showFlow, setShowFlow] = useState(false);

  const unitTypes = [
    {
      id: 'property' as const,
      title: 'Propiedad completa',
      description: 'Casa o departamento completo',
      icon: Home,
    },
    {
      id: 'rooms' as const,
      title: 'Habitaciones',
      description: 'Habitaciones individuales',
      icon: Users,
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      setShowFlow(true);
    }
  };

  const handleFlowComplete = (open: boolean) => {
    setShowFlow(open);
    if (!open) {
      // Reset selection when flow is closed
      setSelectedType(null);
      onOpenChange(false);
    }
  };

  const handlePropertyCreated = (property: Property) => {
    if (onPropertyCreated) {
      onPropertyCreated(property);
    }
    setShowFlow(false);
    setSelectedType(null);
    onOpenChange(false);
  };

  if (showFlow && selectedType) {
    return (
      <PropertyFlowModal
        open={showFlow}
        onOpenChange={handleFlowComplete}
        unitType={selectedType}
        onPropertyCreated={handlePropertyCreated}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>¿Qué tipo de unidad quieres agregar?</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {unitTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-white' : 'bg-muted'
                  }`}>
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{type.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            variant={selectedType ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={handleContinue}
            disabled={!selectedType}
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
