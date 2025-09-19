import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, Shield, AlertCircle } from "lucide-react";
import { Property, ROOM_CHARACTERISTICS } from "@/types/property";

interface ContractsStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ContractsStep = ({ property, updateProperty, onNext, onPrev }: ContractsStepProps) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>(property.contracts?.standardOptions || []);
  const [requiresDeposit, setRequiresDeposit] = useState(property.contracts?.requiresDeposit || false);
  const [depositAmount, setDepositAmount] = useState<number>(property.contracts?.depositAmount || 0);
  const [roomDeposits, setRoomDeposits] = useState<{[key: string]: number}>(
    property.rooms?.reduce((acc, room) => ({
      ...acc,
      [room.id]: room.depositAmount || 0
    }), {}) || {}
  );

  const contractOptions = [
    { value: '1', label: '1 mes' },
    { value: '2', label: '2 meses' },
    { value: '3', label: '3 meses' },
    { value: '4', label: '4 meses' },
    { value: '5', label: '5 meses' },
    { value: '6', label: '6 meses' },
    { value: '7', label: '7 meses' },
    { value: '8', label: '8 meses' },
    { value: '9', label: '9 meses' },
    { value: '10', label: '10 meses' },
    { value: '11', label: '11 meses' },
    { value: '12', label: '12 meses' }
  ];

  const toggleMonth = (month: string) => {
    const updated = selectedMonths.includes(month)
      ? selectedMonths.filter(m => m !== month)
      : [...selectedMonths, month];
    
    setSelectedMonths(updated);
    updateProperty({
      contracts: {
        ...property.contracts,
        standardOptions: updated,
        requiresDeposit
      }
    });
  };

  const updateDeposit = (checked: boolean) => {
    setRequiresDeposit(checked);
    updateProperty({
      contracts: {
        ...property.contracts,
        standardOptions: selectedMonths,
        requiresDeposit: checked,
        depositAmount: checked ? depositAmount : undefined
      }
    });
  };

  const updateDepositAmount = (amount: number) => {
    setDepositAmount(amount);
    updateProperty({
      contracts: {
        ...property.contracts,
        standardOptions: selectedMonths,
        requiresDeposit,
        depositAmount: amount
      }
    });
  };

  const updateRoomDeposit = (roomId: string, amount: number) => {
    const updatedDeposits = { ...roomDeposits, [roomId]: amount };
    setRoomDeposits(updatedDeposits);
    
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, depositAmount: amount } : room
    ) || [];
    
    updateProperty({
      rooms: updatedRooms,
      contracts: {
        ...property.contracts,
        standardOptions: selectedMonths,
        requiresDeposit
      }
    });
  };

  const hasValidContracts = selectedMonths.length > 0;

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Opciones de <span className="text-highlight">Renta</span>
        </h2>
        <p className="text-muted-foreground">Configura los tipos de contratos que aceptas</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tipos de contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="font-medium">Selecciona las duraciones de contrato que aceptas</p>
              <div className="grid grid-cols-2 gap-3">
                {contractOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.value}
                      checked={selectedMonths.includes(option.value)}
                      onCheckedChange={() => toggleMonth(option.value)}
                    />
                    <Label htmlFor={option.value} className="text-base cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Depósito de garantía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Solicitar depósito de garantía</Label>
                <p className="text-sm text-muted-foreground">
                  {property.type === 'property' 
                    ? 'Configura el monto del depósito para la propiedad completa'
                    : 'El depósito se configurará por habitación en el paso de precios'
                  }
                </p>
              </div>
              <Switch checked={requiresDeposit} onCheckedChange={updateDeposit} />
            </div>

            {requiresDeposit && property.type === 'property' && (
              <div className="space-y-2 animate-fade-in">
                <Label>Monto del depósito de garantía</Label>
                <Input
                  type="number"
                  placeholder="Ingresa el monto del depósito"
                  value={depositAmount}
                  onChange={(e) => updateDepositAmount(Number(e.target.value))}
                />
              </div>
            )}

            {requiresDeposit && property.type === 'rooms' && property.rooms && property.rooms.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <Label className="font-medium">Configurar depósito por habitación</Label>
                <div className="space-y-3">
                  {property.rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.characteristics && property.type === 'rooms' ? 
                            ROOM_CHARACTERISTICS.find(char => char.id === room.characteristics)?.name || room.characteristics
                            : room.characteristics
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">$</span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-24"
                          value={roomDeposits[room.id] || 0}
                          onChange={(e) => updateRoomDeposit(room.id, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!requiresDeposit && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Tip</p>
                  <p className="text-sm text-blue-800">
                    Sin depósito de garantía se renta más rápido la propiedad
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasValidContracts && (
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Resumen de opciones</h4>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Contratos disponibles:</span> {selectedMonths.join(', ')} meses
                </p>
                <p className="text-sm">
                  <span className="font-medium">Depósito:</span> {requiresDeposit ? 'Requerido' : 'No requerido'}
                </p>
                {requiresDeposit && property.type === 'property' && depositAmount > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Monto del depósito:</span> ${depositAmount.toLocaleString()}
                  </p>
                )}
                {requiresDeposit && property.type === 'rooms' && property.rooms && property.rooms.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Depósitos por habitación:</span> Configurados individualmente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4 max-w-2xl mx-auto">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          variant="default" 
          onClick={onNext}
          disabled={!hasValidContracts}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};