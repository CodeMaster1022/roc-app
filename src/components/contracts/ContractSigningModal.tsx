import React, { useState } from 'react';
import { Contract } from '@/types/contract';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SignaturePad } from './SignaturePad';
import { 
  FileSignature, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Building,
  Shield
} from 'lucide-react';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSignatureProgress } from '@/utils/contractUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onContractUpdate?: (updatedContract: Contract) => void;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  isOpen,
  onClose,
  contract,
  onContractUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatures, setSignatures] = useState<{ [key: string]: string }>({});

  const signatureProgress = getSignatureProgress(contract);
  const userId = user?.id || '';

  // Determine what signature types the current user can provide
  const canSignAsTenant = contract.tenant.id === userId;
  const canSignAsHoster = contract.hoster.id === userId;
  const guarantorIds = contract.guarantors
    .filter(g => g.email === user?.email) // Simple email matching for now
    .map(g => g.id);

  const handleSignature = (type: string, signature: string) => {
    setSignatures(prev => ({
      ...prev,
      [type]: signature
    }));
  };

  const handleClearSignature = (type: string) => {
    setSignatures(prev => {
      const newSignatures = { ...prev };
      delete newSignatures[type];
      return newSignatures;
    });
  };

  const submitSignatures = async () => {
    if (Object.keys(signatures).length === 0) {
      toast({
        title: t('common.error') || "Error",
        description: t('contract.signature_required') || "Por favor, proporcione al menos una firma antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedContract = contract;

      // Submit each signature
      for (const [type, signature] of Object.entries(signatures)) {
        let signatureType: 'tenant' | 'hoster' | 'guarantor';
        let guarantorId: string | undefined;

        if (type === 'tenant') {
          signatureType = 'tenant';
        } else if (type === 'hoster') {
          signatureType = 'hoster';
        } else {
          signatureType = 'guarantor';
          guarantorId = type.replace('guarantor-', '');
        }

        updatedContract = await contractService.signContract(
          contract.id, 
          signatureType, 
          guarantorId, 
          signature
        );
      }

      toast({
        title: t('contract.signatures_submitted') || "Firmas Enviadas",
        description: t('contract.signatures_submitted_description') || "Sus firmas han sido registradas exitosamente.",
      });

      if (onContractUpdate) {
        onContractUpdate(updatedContract);
      }

      onClose();
    } catch (error: any) {
      console.error('Error submitting signatures:', error);
      toast({
        title: t('contract.signing_error') || "Error al Firmar",
        description: error.message || (t('contract.signing_error_description') || "No se pudieron registrar las firmas. Inténtelo de nuevo."),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSignatureStatus = (type: 'tenant' | 'hoster' | string) => {
    if (type === 'tenant') {
      return contract.signatures.tenantSigned;
    } else if (type === 'hoster') {
      return contract.signatures.hosterSigned;
    } else {
      // Guarantor
      const guarantorId = type.replace('guarantor-', '');
      return contract.signatures.guarantorsSigned[guarantorId]?.signed || false;
    }
  };

  const getExistingSignature = (type: 'tenant' | 'hoster' | string) => {
    if (type === 'tenant') {
      return contract.signatures.tenantSignature;
    } else if (type === 'hoster') {
      return contract.signatures.hosterSignature;
    } else {
      // Guarantor
      const guarantorId = type.replace('guarantor-', '');
      return contract.signatures.guarantorsSigned[guarantorId]?.signature;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSignature className="w-5 h-5" />
            {t('contract.sign_contract')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-4 h-4" />
                {t('contract.contract_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('contract.property')}</p>
                  <p className="text-sm text-muted-foreground">{contract.propertyTitle}</p>
                  <p className="text-xs text-muted-foreground">{contract.propertyAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('contract.period')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(contract.startDate, 'dd MMM yyyy', { locale: es })} - {' '}
                    {format(contract.endDate, 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('contract.monthly_rent')}</p>
                  <p className="text-sm text-muted-foreground">
                    ${contract.terms.rentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('contract.deposit')}</p>
                  <p className="text-sm text-muted-foreground">
                    ${contract.terms.depositAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('contract.signature_progress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {signatureProgress.completed} {t('contract.of')} {signatureProgress.total} {t('contract.signatures_completed')}
                    </span>
                    <Badge variant={signatureProgress.percentage === 100 ? "default" : "secondary"}>
                      {Math.round(signatureProgress.percentage)}%
                    </Badge>
                  </div>
                  <Progress value={signatureProgress.percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Tenant Status */}
                  <div className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{t('contract.tenant')}: {contract.tenant.name}</span>
                    </div>
                    {contract.signatures.tenantSigned ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('contract.signed')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('contract.pending')}
                      </Badge>
                    )}
                  </div>

                  {/* Hoster Status */}
                  <div className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">{t('contract.hoster')}: {contract.hoster.name}</span>
                    </div>
                    {contract.signatures.hosterSigned ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('contract.signed')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('contract.pending')}
                      </Badge>
                    )}
                  </div>

                  {/* Guarantors Status */}
                  {contract.guarantors.map((guarantor) => (
                    <div key={guarantor.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">{t('contract.guarantor')}: {guarantor.name}</span>
                      </div>
                      {contract.signatures.guarantorsSigned[guarantor.id]?.signed ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('contract.signed')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('contract.pending')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Pads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              {t('contract.provide_signatures')}
            </h3>

            {/* Tenant Signature */}
            {canSignAsTenant && (
              <SignaturePad
                title={t('contract.tenant_signature')}
                description={`${t('contract.sign_as')}: ${contract.tenant.name}`}
                onSignature={(signature) => handleSignature('tenant', signature)}
                onClear={() => handleClearSignature('tenant')}
                disabled={getSignatureStatus('tenant')}
                existingSignature={getExistingSignature('tenant')}
              />
            )}

            {/* Hoster Signature */}
            {canSignAsHoster && (
              <SignaturePad
                title={t('contract.hoster_signature')}
                description={`${t('contract.sign_as')}: ${contract.hoster.name}`}
                onSignature={(signature) => handleSignature('hoster', signature)}
                onClear={() => handleClearSignature('hoster')}
                disabled={getSignatureStatus('hoster')}
                existingSignature={getExistingSignature('hoster')}
              />
            )}

            {/* Guarantor Signatures */}
            {guarantorIds.map((guarantorId) => {
              const guarantor = contract.guarantors.find(g => g.id === guarantorId);
              if (!guarantor) return null;

              return (
                <SignaturePad
                  key={guarantorId}
                  title={t('contract.guarantor_signature')}
                  description={`${t('contract.sign_as')}: ${guarantor.name}`}
                  onSignature={(signature) => handleSignature(`guarantor-${guarantorId}`, signature)}
                  onClear={() => handleClearSignature(`guarantor-${guarantorId}`)}
                  disabled={getSignatureStatus(`guarantor-${guarantorId}`)}
                  existingSignature={getExistingSignature(`guarantor-${guarantorId}`)}
                />
              );
            })}

            {/* No signature permissions */}
            {!canSignAsTenant && !canSignAsHoster && guarantorIds.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold mb-2">{t('contract.no_signature_permissions')}</h3>
                  <p className="text-muted-foreground">
                    {t('contract.no_signature_permissions_description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            {(canSignAsTenant || canSignAsHoster || guarantorIds.length > 0) && (
              <Button 
                onClick={submitSignatures} 
                disabled={isSubmitting || Object.keys(signatures).length === 0}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('common.sending')}...
                  </>
                ) : (
                  <>
                    <FileSignature className="w-4 h-4" />
                    {t('contract.send_signatures')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 