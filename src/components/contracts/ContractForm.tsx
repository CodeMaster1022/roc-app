import React, { useState, useEffect } from 'react';
import { CreateContractRequest, ContractTerms, ContractTemplate, Contract } from '@/types/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractFormProps {
  contract?: Contract; // For editing
  propertyId?: string;
  tenantId?: string;
  onSubmit: (contractData: CreateContractRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  propertyId: initialPropertyId,
  tenantId: initialTenantId,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<CreateContractRequest>({
    propertyId: initialPropertyId || contract?.propertyId || '',
    tenantId: initialTenantId || contract?.tenant.id || '',
    guarantorIds: contract?.guarantors.map(g => g.id) || [],
    templateId: '',
    startDate: contract?.startDate || new Date(),
    endDate: contract?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    terms: {
      rentAmount: contract?.terms.rentAmount || 0,
      depositAmount: contract?.terms.depositAmount || 0,
      paymentFrequency: contract?.terms.paymentFrequency || 'monthly',
      paymentDueDay: contract?.terms.paymentDueDay || 1,
      lateFeeAmount: contract?.terms.lateFeeAmount || 0,
      lateFeeGracePeriod: contract?.terms.lateFeeGracePeriod || 5,
      utilitiesIncluded: contract?.terms.utilitiesIncluded || [],
      maintenanceResponsibility: contract?.terms.maintenanceResponsibility || 'tenant',
      petPolicy: {
        allowed: contract?.terms.petPolicy.allowed || false,
        deposit: contract?.terms.petPolicy.deposit || 0,
        restrictions: contract?.terms.petPolicy.restrictions || ''
      },
      smokingPolicy: contract?.terms.smokingPolicy || false,
      guestPolicy: {
        allowed: contract?.terms.guestPolicy.allowed || true,
        maxDuration: contract?.terms.guestPolicy.maxDuration || 7,
        maxGuests: contract?.terms.guestPolicy.maxGuests || 2
      },
      renewalTerms: {
        automatic: contract?.terms.renewalTerms?.automatic || false,
        noticePeriod: contract?.terms.renewalTerms?.noticePeriod || 30,
        rentIncrease: contract?.terms.renewalTerms?.rentIncrease || 0
      }
    },
    clauses: contract?.clauses || [],
    customFields: contract?.customFields || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await contractService.getContractTemplates();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las plantillas de contrato',
          variant: 'destructive'
        });
      }
    };

    loadTemplates();
  }, []);

  // Load template when selected
  useEffect(() => {
    const loadTemplate = async () => {
      if (selectedTemplate) {
        try {
          const template = await contractService.getContractTemplate(selectedTemplate);
          setFormData(prev => ({
            ...prev,
            templateId: template.id,
            terms: { ...prev.terms, ...template.defaultTerms },
            clauses: template.clauses
          }));
        } catch (error) {
          console.error('Failed to load template:', error);
          toast({
            title: 'Error',
            description: 'No se pudo cargar la plantilla seleccionada',
            variant: 'destructive'
          });
        }
      }
    };

    loadTemplate();
  }, [selectedTemplate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = 'La propiedad es requerida';
    }

    if (!formData.tenantId) {
      newErrors.tenantId = 'El inquilino es requerido';
    }

    if (formData.terms.rentAmount <= 0) {
      newErrors.rentAmount = 'El monto de la renta debe ser mayor a 0';
    }

    if (formData.terms.depositAmount < 0) {
      newErrors.depositAmount = t('contracts.deposit_negative_error');
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.terms.paymentDueDay < 1 || formData.terms.paymentDueDay > 31) {
      newErrors.paymentDueDay = t('contracts.payment_day_error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: t('contracts.validation_error'),
        description: 'Por favor, corrige los errores en el formulario',
        variant: 'destructive'
      });
      return;
    }

    onSubmit(formData);
  };

  const updateTerms = (updates: Partial<ContractTerms>) => {
    setFormData(prev => ({
      ...prev,
      terms: { ...prev.terms, ...updates }
    }));
  };

  const addUtility = () => {
    const utility = prompt('Ingresa el nombre del servicio:');
    if (utility && utility.trim()) {
      updateTerms({
        utilitiesIncluded: [...formData.terms.utilitiesIncluded, utility.trim()]
      });
    }
  };

  const removeUtility = (index: number) => {
    updateTerms({
      utilitiesIncluded: formData.terms.utilitiesIncluded.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      {!contract && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plantilla de Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.basic_info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyId">Propiedad *</Label>
              <Input
                id="propertyId"
                value={formData.propertyId}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                placeholder="ID de la propiedad"
                className={errors.propertyId ? 'border-red-500' : ''}
              />
              {errors.propertyId && <p className="text-sm text-red-500 mt-1">{errors.propertyId}</p>}
            </div>

            <div>
              <Label htmlFor="tenantId">Inquilino *</Label>
              <Input
                id="tenantId"
                value={formData.tenantId}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="ID del inquilino"
                className={errors.tenantId ? 'border-red-500' : ''}
              />
              {errors.tenantId && <p className="text-sm text-red-500 mt-1">{errors.tenantId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.endDate, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Terms */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.financial_terms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rentAmount">Monto de Renta *</Label>
              <Input
                id="rentAmount"
                type="number"
                min="0"
                value={formData.terms.rentAmount}
                onChange={(e) => updateTerms({ rentAmount: Number(e.target.value) })}
                className={errors.rentAmount ? 'border-red-500' : ''}
              />
              {errors.rentAmount && <p className="text-sm text-red-500 mt-1">{errors.rentAmount}</p>}
            </div>

            <div>
              <Label htmlFor="depositAmount">{t('contracts.deposit')}</Label>
              <Input
                id="depositAmount"
                type="number"
                min="0"
                value={formData.terms.depositAmount}
                onChange={(e) => updateTerms({ depositAmount: Number(e.target.value) })}
                className={errors.depositAmount ? 'border-red-500' : ''}
              />
              {errors.depositAmount && <p className="text-sm text-red-500 mt-1">{errors.depositAmount}</p>}
            </div>

            <div>
              <Label htmlFor="paymentFrequency">Frecuencia de Pago</Label>
              <Select 
                value={formData.terms.paymentFrequency} 
                onValueChange={(value: any) => updateTerms({ paymentFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentDueDay">{t('contracts.payment_day')}</Label>
              <Input
                id="paymentDueDay"
                type="number"
                min="1"
                max="31"
                value={formData.terms.paymentDueDay}
                onChange={(e) => updateTerms({ paymentDueDay: Number(e.target.value) })}
                className={errors.paymentDueDay ? 'border-red-500' : ''}
              />
              {errors.paymentDueDay && <p className="text-sm text-red-500 mt-1">{errors.paymentDueDay}</p>}
            </div>

            <div>
              <Label htmlFor="lateFeeAmount">Multa por Retraso</Label>
              <Input
                id="lateFeeAmount"
                type="number"
                min="0"
                value={formData.terms.lateFeeAmount || ''}
                onChange={(e) => updateTerms({ lateFeeAmount: Number(e.target.value) || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="lateFeeGracePeriod">{t('contracts.grace_period')}</Label>
              <Input
                id="lateFeeGracePeriod"
                type="number"
                min="0"
                value={formData.terms.lateFeeGracePeriod || ''}
                onChange={(e) => updateTerms({ lateFeeGracePeriod: Number(e.target.value) || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilities and Services */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios Incluidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.terms.utilitiesIncluded.map((utility, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-50 rounded">{utility}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeUtility(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addUtility}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Servicio
            </Button>
          </div>

          <div className="mt-4">
            <Label>Responsabilidad de Mantenimiento</Label>
            <Select 
              value={formData.terms.maintenanceResponsibility} 
              onValueChange={(value: any) => updateTerms({ maintenanceResponsibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Inquilino</SelectItem>
                <SelectItem value="hoster">Arrendador</SelectItem>
                <SelectItem value="shared">Compartida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.policies')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pet Policy */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="petAllowed"
                checked={formData.terms.petPolicy.allowed}
                onCheckedChange={(checked) => 
                  updateTerms({ 
                    petPolicy: { 
                      ...formData.terms.petPolicy, 
                      allowed: checked as boolean 
                    } 
                  })
                }
              />
              <Label htmlFor="petAllowed">Mascotas Permitidas</Label>
            </div>
            {formData.terms.petPolicy.allowed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="petDeposit">{t('contracts.pet_deposit')}</Label>
                  <Input
                    id="petDeposit"
                    type="number"
                    min="0"
                    value={formData.terms.petPolicy.deposit || ''}
                    onChange={(e) => 
                      updateTerms({ 
                        petPolicy: { 
                          ...formData.terms.petPolicy, 
                          deposit: Number(e.target.value) || undefined 
                        } 
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="petRestrictions">Restricciones</Label>
                  <Input
                    id="petRestrictions"
                    value={formData.terms.petPolicy.restrictions || ''}
                    onChange={(e) => 
                      updateTerms({ 
                        petPolicy: { 
                          ...formData.terms.petPolicy, 
                          restrictions: e.target.value 
                        } 
                      })
                    }
                    placeholder={t('contracts.pet_restrictions_placeholder')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Smoking Policy */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smokingAllowed"
              checked={formData.terms.smokingPolicy}
              onCheckedChange={(checked) => updateTerms({ smokingPolicy: checked as boolean })}
            />
            <Label htmlFor="smokingAllowed">Fumar Permitido</Label>
          </div>

          {/* Guest Policy */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="guestAllowed"
                checked={formData.terms.guestPolicy.allowed}
                onCheckedChange={(checked) => 
                  updateTerms({ 
                    guestPolicy: { 
                      ...formData.terms.guestPolicy, 
                      allowed: checked as boolean 
                    } 
                  })
                }
              />
              <Label htmlFor="guestAllowed">{t('contracts.guests_allowed')}</Label>
            </div>
            {formData.terms.guestPolicy.allowed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="maxDuration">{t('contracts.max_duration_days')}</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    min="1"
                    value={formData.terms.guestPolicy.maxDuration || ''}
                    onChange={(e) => 
                      updateTerms({ 
                        guestPolicy: { 
                          ...formData.terms.guestPolicy, 
                          maxDuration: Number(e.target.value) || undefined 
                        } 
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests">{t('contracts.max_guests_number')}</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min="1"
                    value={formData.terms.guestPolicy.maxGuests || ''}
                    onChange={(e) => 
                      updateTerms({ 
                        guestPolicy: { 
                          ...formData.terms.guestPolicy, 
                          maxGuests: Number(e.target.value) || undefined 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renewal Terms */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.renewal_terms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="automaticRenewal"
              checked={formData.terms.renewalTerms?.automatic || false}
              onCheckedChange={(checked) => 
                updateTerms({ 
                  renewalTerms: { 
                    ...formData.terms.renewalTerms, 
                    automatic: checked as boolean,
                    noticePeriod: formData.terms.renewalTerms?.noticePeriod || 30,
                    rentIncrease: formData.terms.renewalTerms?.rentIncrease || 0
                  } 
                })
              }
            />
                          <Label htmlFor="automaticRenewal">{t('contracts.automatic_renewal')}</Label>
          </div>

          {formData.terms.renewalTerms?.automatic && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="noticePeriod">{t('contracts.notice_period_days')}</Label>
                <Input
                  id="noticePeriod"
                  type="number"
                  min="1"
                  value={formData.terms.renewalTerms?.noticePeriod || ''}
                  onChange={(e) => 
                    updateTerms({ 
                      renewalTerms: { 
                        ...formData.terms.renewalTerms!, 
                        noticePeriod: Number(e.target.value) 
                      } 
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="rentIncrease">Incremento de Renta (%)</Label>
                <Input
                  id="rentIncrease"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.terms.renewalTerms?.rentIncrease || ''}
                  onChange={(e) => 
                    updateTerms({ 
                      renewalTerms: { 
                        ...formData.terms.renewalTerms!, 
                        rentIncrease: Number(e.target.value) 
                      } 
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('contracts.cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('contracts.saving') : contract ? t('contracts.update_contract') : t('contracts.create_contract')}
        </Button>
      </div>
    </form>
  );
};

export default ContractForm; 