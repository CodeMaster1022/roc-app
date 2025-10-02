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
      id: 'rooms' as const,
      title: 'Habitaciones',
      description: 'For when you want to rent your property by individual rooms, or if you live in the property and want to rent out a few rooms to roommates.',
      icon: Users,
    },
    {
      id: 'property' as const,
      title: 'Propiedad completa',
      description: 'For when you want to rent out the whole property as a single unit.',
      icon: Home,
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Add New <span className="text-primary">Unit</span></DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {unitTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isSelected ? 'ring-4 ring-primary bg-primary/5 shadow-xl' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-4 text-center space-y-6">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-primary text-white scale-110' : 'bg-muted'
                  }`}>
                    <Icon className={`w h-10 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2">{type.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            variant={selectedType ? "default" : "outline"}
            className="flex items-center gap-2 px-6 py-3 text-base"
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
