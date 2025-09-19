import React, { useState } from 'react';
import { Contract } from '@/types/contract';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileSignature, 
  Play, 
  Square, 
  RotateCcw,
  CalendarIcon,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractLifecycleProps {
  contract: Contract;
  onContractUpdate: (updatedContract: Contract) => void;
}

const ContractLifecycle: React.FC<ContractLifecycleProps> = ({
  contract,
  onContractUpdate
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [renewalEndDate, setRenewalEndDate] = useState<Date>(new Date());
  const [renewalTerms, setRenewalTerms] = useState({
    rentAmount: contract.terms.rentAmount,
    depositAmount: contract.terms.depositAmount
  });

  const getStatusInfo = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />,
          label: 'Borrador',
          description: t('contracts.draft_description')
        };
      case 'pending_signatures':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FileSignature className="w-4 h-4" />,
          label: 'Pendiente de Firmas',
          description: 'Esperando firmas de las partes involucradas'
        };
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Activo',
          description: t('contracts.active_description')
        };
      case 'expired':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Expirado',
          description: 'El contrato ha llegado a su fecha de vencimiento'
        };
      case 'terminated':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <Square className="w-4 h-4" />,
          label: 'Terminado',
          description: 'El contrato fue terminado antes de su vencimiento'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Square className="w-4 h-4" />,
          label: 'Cancelado',
          description: 'El contrato fue cancelado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />,
          label: status,
          description: ''
        };
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (contract.status) {
      case 'draft':
        actions.push({
          key: 'send_for_signatures',
          label: 'Enviar para Firmas',
          icon: <FileSignature className="w-4 h-4" />,
          variant: 'default' as const,
          description: 'Enviar el contrato a las partes para su firma'
        });
        break;

      case 'pending_signatures':
        const allSigned = contract.signatures.tenantSigned && 
                         contract.signatures.hosterSigned &&
                         Object.values(contract.signatures.guarantorsSigned).every(g => g.signed);
        
        if (allSigned) {
          actions.push({
            key: 'activate',
            label: 'Activar Contrato',
            icon: <Play className="w-4 h-4" />,
            variant: 'default' as const,
            description: t('contracts.activate_description')
          });
        }
        break;

      case 'active':
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        if (contract.endDate <= thirtyDaysFromNow) {
          actions.push({
            key: 'renew',
            label: 'Renovar Contrato',
            icon: <RotateCcw className="w-4 h-4" />,
            variant: 'outline' as const,
            description: t('contracts.renew_description')
          });
        }
        
        actions.push({
          key: 'terminate',
          label: 'Terminar Contrato',
          icon: <Square className="w-4 h-4" />,
          variant: 'destructive' as const,
          description: 'Terminar el contrato antes de su vencimiento'
        });
        break;

      case 'expired':
        actions.push({
          key: 'renew',
          label: 'Renovar Contrato',
          icon: <RotateCcw className="w-4 h-4" />,
          variant: 'default' as const,
          description: 'Crear una nueva vigencia para el contrato'
        });
        break;
    }

    return actions;
  };

  const handleAction = async (actionKey: string) => {
    try {
      setLoading(true);
      let updatedContract: Contract;

      switch (actionKey) {
        case 'send_for_signatures':
          // In a real implementation, this would send notifications to parties
          updatedContract = await contractService.updateContract(contract.id, {
            status: 'pending_signatures'
          });
          toast({
            title: t('contracts.success'),
            description: 'Contrato enviado para firmas'
          });
          break;

        case 'activate':
          updatedContract = await contractService.activateContract(contract.id);
          toast({
            title: t('contracts.success'),
            description: 'Contrato activado correctamente'
          });
          break;

        case 'terminate':
                  if (!terminationReason.trim()) {
          toast({
            title: 'Error',
            description: t('contracts.termination_reason_required'),
              variant: 'destructive'
            });
            return;
          }
          updatedContract = await contractService.terminateContract(contract.id, terminationReason);
          toast({
            title: t('contracts.success'),
            description: 'Contrato terminado correctamente'
          });
          break;

        case 'renew':
          updatedContract = await contractService.renewContract(
            contract.id, 
            renewalEndDate,
            {
              rentAmount: renewalTerms.rentAmount,
              depositAmount: renewalTerms.depositAmount
            }
          );
          toast({
            title: t('contracts.success'),
            description: 'Contrato renovado correctamente'
          });
          break;

        default:
          throw new Error(t('contracts.unrecognized_action'));
      }

      onContractUpdate(updatedContract);
    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: 'Error',
        description: t('contracts.action_failed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = getStatusInfo(contract.status);
  const availableActions = getAvailableActions();

  const getSignatureProgress = () => {
    const { signatures } = contract;
    const totalSignatures = 2 + contract.guarantors.length;
    const completedSignatures = 
      (signatures.tenantSigned ? 1 : 0) + 
      (signatures.hosterSigned ? 1 : 0) + 
      Object.values(signatures.guarantorsSigned).filter(g => g.signed).length;
    
    return { completed: completedSignatures, total: totalSignatures };
  };

  const signatureProgress = getSignatureProgress();

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado del Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={`${statusInfo.color} flex items-center gap-2 px-3 py-2`}>
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
            <div className="flex-1">
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>

          {/* Contract Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${contract.createdAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={contract.createdAt ? 'text-gray-900' : 'text-gray-500'}>
                Creado: {contract.createdAt ? format(contract.createdAt, 'PPP', { locale: es }) : 'Pendiente'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${contract.signedAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={contract.signedAt ? 'text-gray-900' : 'text-gray-500'}>
                Firmado: {contract.signedAt ? format(contract.signedAt, 'PPP', { locale: es }) : 'Pendiente'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${contract.activatedAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={contract.activatedAt ? 'text-gray-900' : 'text-gray-500'}>
                Activado: {contract.activatedAt ? format(contract.activatedAt, 'PPP', { locale: es }) : 'Pendiente'}
              </span>
            </div>
            
            {contract.terminatedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-900">
                  Terminado: {format(contract.terminatedAt, 'PPP', { locale: es })}
                </span>
                {contract.terminationReason && (
                  <span className="text-gray-600">- {contract.terminationReason}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature Status */}
      {contract.status === 'pending_signatures' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Firmas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso</span>
                <span className="text-sm text-gray-600">
                  {signatureProgress.completed}/{signatureProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(signatureProgress.completed / signatureProgress.total) * 100}%` }}
                ></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inquilino: {contract.tenant.name}</span>
                  {contract.signatures.tenantSigned ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arrendador: {contract.hoster.name}</span>
                  {contract.signatures.hosterSigned ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                {contract.guarantors.map((guarantor) => (
                  <div key={guarantor.id} className="flex items-center justify-between">
                    <span className="text-sm">Garante: {guarantor.name}</span>
                    {contract.signatures.guarantorsSigned[guarantor.id]?.signed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Actions */}
      {availableActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableActions.map((action) => (
                <div key={action.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div>
                      <p className="font-medium">{action.label}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  
                  {action.key === 'terminate' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant={action.variant} size="sm" disabled={loading}>
                          {action.label}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Terminar Contrato</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="terminationReason">{t('contracts.termination_reason')}</Label>
                            <Textarea
                              id="terminationReason"
                              value={terminationReason}
                              onChange={(e) => setTerminationReason(e.target.value)}
                              placeholder={t('contracts.termination_placeholder')}
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancelar</Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleAction('terminate')}
                              disabled={loading || !terminationReason.trim()}
                            >
                              Terminar Contrato
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : action.key === 'renew' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant={action.variant} size="sm" disabled={loading}>
                          {action.label}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Renovar Contrato</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Nueva fecha de vencimiento *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(renewalEndDate, 'PPP', { locale: es })}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={renewalEndDate}
                                  onSelect={(date) => date && setRenewalEndDate(date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="newRentAmount">Nueva renta</Label>
                              <Input
                                id="newRentAmount"
                                type="number"
                                value={renewalTerms.rentAmount}
                                onChange={(e) => setRenewalTerms(prev => ({
                                  ...prev,
                                  rentAmount: Number(e.target.value)
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="newDepositAmount">{t('contracts.new_deposit')}</Label>
                              <Input
                                id="newDepositAmount"
                                type="number"
                                value={renewalTerms.depositAmount}
                                onChange={(e) => setRenewalTerms(prev => ({
                                  ...prev,
                                  depositAmount: Number(e.target.value)
                                }))}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancelar</Button>
                            <Button 
                              onClick={() => handleAction('renew')}
                              disabled={loading}
                            >
                              Renovar Contrato
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      variant={action.variant} 
                      size="sm" 
                      onClick={() => handleAction(action.key)}
                      disabled={loading}
                    >
                      {action.label}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Expiration Alert */}
      {contract.status === 'active' && (() => {
        const today = new Date();
        const daysUntilExpiration = Math.ceil((contract.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
          return (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                                  <h4 className="font-medium text-orange-800">{t('contracts.contract_expiring')}</h4>
              <p className="text-sm text-orange-700 mt-1">
                {t('contracts.expires_in_days')} {daysUntilExpiration} {daysUntilExpiration !== 1 ? t('contracts.day_plural') : t('contracts.day_singular')} 
                      ({format(contract.endDate, 'PPP', { locale: es })}). 
                      Considera renovarlo o tomar las acciones necesarias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        if (daysUntilExpiration <= 0) {
          return (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Contrato vencido</h4>
                                  <p className="text-sm text-red-700 mt-1">
                {t('contracts.contract_expired')} {format(contract.endDate, 'PPP', { locale: es })}.
                {t('contracts.action_required')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        return null;
      })()}
    </div>
  );
};

export default ContractLifecycle; 