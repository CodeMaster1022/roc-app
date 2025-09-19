import React from 'react';
import { Contract } from '@/types/contract';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, FileText, DollarSign, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractCardProps {
  contract: Contract;
  onViewDetails: (contractId: string) => void;
  onEdit?: (contractId: string) => void;
  onTerminate?: (contractId: string) => void;
  showActions?: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onViewDetails,
  onEdit,
  onTerminate,
  showActions = true
}) => {
  const { t } = useLanguage();
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_signatures':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending_signatures':
        return 'Pendiente de Firmas';
      case 'draft':
        return 'Borrador';
      case 'expired':
        return 'Expirado';
      case 'terminated':
        return 'Terminado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const isExpiringSoon = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return contract.endDate <= thirtyDaysFromNow && contract.status === 'active';
  };

  const hasOverduePayments = () => {
    const today = new Date();
    return contract.payments.some(payment => 
      payment.status === 'overdue' || 
      (payment.status === 'pending' && payment.dueDate < today)
    );
  };

  const getSignatureStatus = () => {
    const { signatures } = contract;
    const totalSignatures = 2 + contract.guarantors.length; // tenant + hoster + guarantors
    const completedSignatures = 
      (signatures.tenantSigned ? 1 : 0) + 
      (signatures.hosterSigned ? 1 : 0) + 
      Object.values(signatures.guarantorsSigned).filter(g => g.signed).length;
    
    return { completed: completedSignatures, total: totalSignatures };
  };

  const signatureStatus = getSignatureStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {contract.propertyTitle}
            </CardTitle>
            <p className="text-sm text-gray-600 mb-2">
              {contract.propertyAddress}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(contract.status)}>
                {getStatusText(contract.status)}
              </Badge>
              {isExpiringSoon() && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expira Pronto
                </Badge>
              )}
              {hasOverduePayments() && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Pagos Vencidos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contract Parties */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            <strong>Inquilino:</strong> {contract.tenant.name}
          </span>
        </div>

        {/* Contract Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Inicio</p>
              <p className="font-medium">
                {format(contract.startDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Fin</p>
              <p className="font-medium">
                {format(contract.endDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Rent Amount */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <div>
            <span className="text-gray-600">Renta: </span>
            <span className="font-semibold text-lg">
              ${contract.terms.rentAmount.toLocaleString()}
            </span>
            <span className="text-gray-600 ml-1">
              /{contract.terms.paymentFrequency === 'monthly' ? 'mes' : 
                contract.terms.paymentFrequency === 'biweekly' ? 'quincenal' : 'semana'}
            </span>
          </div>
        </div>

        {/* Signature Status */}
        {contract.status === 'pending_signatures' && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-600">Firmas: </span>
              <span className="font-medium">
                {signatureStatus.completed}/{signatureStatus.total}
              </span>
              {signatureStatus.completed === signatureStatus.total && (
                <CheckCircle className="w-4 h-4 text-green-600 inline ml-1" />
              )}
            </div>
          </div>
        )}

        {/* Payment Status for Active Contracts */}
        {contract.status === 'active' && (
          <div className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('contracts.next_payment')}</span>
              {(() => {
                const nextPayment = contract.payments
                  .filter(p => p.status === 'pending')
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
                
                if (nextPayment) {
                  const isOverdue = nextPayment.dueDate < new Date();
                  return (
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {format(nextPayment.dueDate, 'dd MMM', { locale: es })}
                      {isOverdue && ' (Vencido)'}
                    </span>
                  );
                }
                return <span className="text-gray-500">{t('contracts.up_to_date')}</span>;
              })()}
            </div>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 border-t">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(contract.id)}
              className="flex-1"
            >
              Ver Detalles
            </Button>
            {onEdit && contract.status === 'draft' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(contract.id)}
              >
                Editar
              </Button>
            )}
            {onTerminate && contract.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTerminate(contract.id)}
                className="text-red-600 hover:text-red-700"
              >
                Terminar
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContractCard; 