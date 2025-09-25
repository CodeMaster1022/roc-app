import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, Shield, AlertCircle, Upload, Download, Eye } from "lucide-react";
import { Property, ROOM_CHARACTERISTICS } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ContractsStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ContractsStep = ({ property, updateProperty, onNext, onPrev }: ContractsStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [contractType, setContractType] = useState<'template' | 'custom'>('template');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(property.contracts?.standardOptions || []);
  const [requiresDeposit, setRequiresDeposit] = useState(property.contracts?.requiresDeposit || false);
  const [depositAmount, setDepositAmount] = useState<number>(property.contracts?.depositAmount || 0);
  const [customContract, setCustomContract] = useState<File | null>(null);
  const [roomDeposits, setRoomDeposits] = useState<{[key: string]: number}>(
    property.rooms?.reduce((acc, room) => ({
      ...acc,
      [room.id]: room.depositAmount || 0
    }), {}) || {}
  );

  const contractOptions = [
    { value: '1', label: t('contracts.1_month') || '1 mes' },
    { value: '2', label: t('contracts.2_months') || '2 meses' },
    { value: '3', label: t('contracts.3_months') || '3 meses' },
    { value: '4', label: t('contracts.4_months') || '4 meses' },
    { value: '5', label: t('contracts.5_months') || '5 meses' },
    { value: '6', label: t('contracts.6_months') || '6 meses' },
    { value: '7', label: t('contracts.7_months') || '7 meses' },
    { value: '8', label: t('contracts.8_months') || '8 meses' },
    { value: '9', label: t('contracts.9_months') || '9 meses' },
    { value: '10', label: t('contracts.10_months') || '10 meses' },
    { value: '11', label: t('contracts.11_months') || '11 meses' },
    { value: '12', label: t('contracts.12_months') || '12 meses' }
  ];

  const toggleMonth = (month: string) => {
    const updated = selectedMonths.includes(month)
      ? selectedMonths.filter(m => m !== month)
      : [...selectedMonths, month];
    
    setSelectedMonths(updated);
    updateProperty({
      contracts: {
        ...property.contracts,
        standardOptions: updated
      }
    });
  };

  const handleDepositToggle = (enabled: boolean) => {
    setRequiresDeposit(enabled);
    updateProperty({
      contracts: {
        ...property.contracts,
        requiresDeposit: enabled,
        depositAmount: enabled ? depositAmount : 0
      }
    });
  };

  const handleDepositAmountChange = (amount: number) => {
    setDepositAmount(amount);
    updateProperty({
      contracts: {
        ...property.contracts,
        depositAmount: amount
      }
    });
  };

  const handleRoomDepositChange = (roomId: string, amount: number) => {
    const updated = { ...roomDeposits, [roomId]: amount };
    setRoomDeposits(updated);
    
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, depositAmount: amount } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const handleCustomContractUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t('contracts.invalid_file_type') || "Tipo de archivo no válido",
        description: t('contracts.file_type_desc') || "Solo se permiten archivos PDF, DOC y DOCX",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: t('contracts.file_too_large') || "Archivo muy grande",
        description: t('contracts.file_size_desc') || "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setCustomContract(file);
    toast({
      title: t('contracts.file_uploaded') || "Contrato subido",
      description: `${file.name} se ha subido correctamente`,
    });
  };

  const handleNext = () => {
    if (contractType === 'template' && selectedMonths.length === 0) {
      toast({
        title: t('contracts.select_duration') || "Selecciona duración",
        description: t('contracts.select_duration_desc') || "Selecciona al menos una opción de duración de contrato",
        variant: "destructive",
      });
      return;
    }

    if (contractType === 'custom' && !customContract) {
      toast({
        title: t('contracts.upload_contract') || "Sube tu contrato",
        description: t('contracts.upload_contract_desc') || "Sube tu contrato personalizado",
        variant: "destructive",
      });
      return;
    }

    // Update property with contract configuration
    updateProperty({
      contracts: {
        ...property.contracts,
        contractType,
        customContract: customContract?.name,
        standardOptions: contractType === 'template' ? selectedMonths : [],
        requiresDeposit,
        depositAmount: requiresDeposit ? depositAmount : 0
      } as Property['contracts']
    });

    onNext();
  };

  const isRoomsType = property.type === 'rooms';
  const hasValidConfiguration = contractType === 'template' 
    ? selectedMonths.length > 0 
    : customContract !== null;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('contracts.flow_title') || 'Configuración de Contratos'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('contracts.flow_description') || 'Configura las opciones de contrato para tu propiedad'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Contract Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('contracts.contract_type') || 'Tipo de Contrato'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={contractType} onValueChange={(value) => setContractType(value as 'template' | 'custom')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">
                  {t('contracts.use_template') || 'Usar Plantilla'}
                </TabsTrigger>
                <TabsTrigger value="custom">
                  {t('contracts.upload_custom') || 'Subir Personalizado'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-2">
                        {t('contracts.template_benefits') || 'Beneficios de la plantilla estándar'}
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('contracts.benefit_1') || 'Contrato legalmente válido en México'}</li>
                        <li>• {t('contracts.benefit_2') || 'Incluye todas las cláusulas necesarias'}</li>
                        <li>• {t('contracts.benefit_3') || 'Protección para ambas partes'}</li>
                        <li>• {t('contracts.benefit_4') || 'Actualizado con la legislación vigente'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contract Duration Options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {t('contracts.duration_options') || 'Opciones de duración de contrato'}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {contractOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`month-${option.value}`}
                          checked={selectedMonths.includes(option.value)}
                          onCheckedChange={() => toggleMonth(option.value)}
                        />
                        <Label 
                          htmlFor={`month-${option.value}`}
                          className="cursor-pointer text-sm"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedMonths.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {t('contracts.selected_durations') || 'Duraciones seleccionadas'}: {selectedMonths.length}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-2">
                        {t('contracts.custom_requirements') || 'Requisitos para contratos personalizados'}
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('contracts.requirement_1') || 'Debe ser legalmente válido en México'}</li>
                        <li>• {t('contracts.requirement_2') || 'Incluir cláusulas de protección al inquilino'}</li>
                        <li>• {t('contracts.requirement_3') || 'Formatos: PDF, DOC, DOCX (máx. 5MB)'}</li>
                        <li>• {t('contracts.requirement_4') || 'Será revisado por nuestro equipo legal'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCustomContractUpload}
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
                          {customContract 
                            ? customContract.name 
                            : (t('contracts.upload_contract_file') || 'Subir contrato personalizado')
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('contracts.upload_instructions') || 'PDF, DOC o DOCX hasta 5MB'}
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
                      onClick={() => setCustomContract(null)}
                    >
                      {t('contracts.remove') || 'Remover'}
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
              {t('contracts.deposit_config') || 'Configuración de Depósito'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {t('contracts.require_deposit') || 'Requerir depósito'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('contracts.deposit_description') || 'Los inquilinos deberán pagar un depósito de garantía'}
                </p>
              </div>
              <Switch
                checked={requiresDeposit}
                onCheckedChange={handleDepositToggle}
              />
            </div>

            {requiresDeposit && (
              <div className="space-y-4 animate-fade-in">
                {!isRoomsType && (
                  <div className="space-y-2">
                    <Label>
                      {t('contracts.deposit_amount') || 'Monto del depósito (MXN)'}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={depositAmount || ''}
                      onChange={(e) => handleDepositAmountChange(parseFloat(e.target.value) || 0)}
                      className="max-w-xs"
                      min="0"
                    />
                  </div>
                )}

                {isRoomsType && (
                  <div className="space-y-3">
                    <Label>
                      {t('contracts.room_deposits') || 'Depósito por habitación (MXN)'}
                    </Label>
                    {property.rooms?.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{room.name}</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={roomDeposits[room.id] || ''}
                          onChange={(e) => handleRoomDepositChange(room.id, parseFloat(e.target.value) || 0)}
                          className="w-32"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
          {t('propertyFlow.previous') || 'Anterior'}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!hasValidConfiguration}
          className="order-1 sm:order-2"
        >
          {t('propertyFlow.continue') || 'Continuar'}
        </Button>
      </div>
    </div>
  );
};