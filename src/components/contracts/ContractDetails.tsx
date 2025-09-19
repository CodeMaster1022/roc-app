import React, { useState, useEffect } from 'react';
import { Contract, ContractEvent, ContractPayment } from '@/types/contract';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarDays, 
  DollarSign, 
  FileText, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Edit,
  Trash2,
  Clock,
  Home,
  Phone,
  Mail,
  CreditCard,
  Upload,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractDetailsProps {
  contractId: string;
  onEdit?: () => void;
  onTerminate?: () => void;
  onClose?: () => void;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contractId,
  onEdit,
  onTerminate,
  onClose
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contractData, eventsData] = await Promise.all([
        contractService.getContract(contractId),
        contractService.getContractEvents(contractId)
      ]);

      setContract(contractData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to fetch contract data:', err);
      setError('Error al cargar los detalles del contrato');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles del contrato',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, [contractId]);

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

  const getSignatureProgress = () => {
    if (!contract) return 0;
    const { signatures } = contract;
    const totalSignatures = 2 + contract.guarantors.length;
    const completedSignatures = 
      (signatures.tenantSigned ? 1 : 0) + 
      (signatures.hosterSigned ? 1 : 0) + 
      Object.values(signatures.guarantorsSigned).filter(g => g.signed).length;
    
    return (completedSignatures / totalSignatures) * 100;
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await contractService.generateContractPDF(contractId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contract?.propertyTitle}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el PDF del contrato',
        variant: 'destructive'
      });
    }
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    try {
      await contractService.uploadDocument(contractId, file, type as any);
              toast({
          title: t('contracts.success'),
        description: 'Documento subido correctamente'
      });
      fetchContractData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo subir el documento',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Cargando contrato...</span>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Error al cargar contrato</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchContractData}>Reintentar</Button>
      </div>
    );
  }

  const overduePayments = contract.payments.filter(p => 
    p.status === 'overdue' || (p.status === 'pending' && p.dueDate < new Date())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              {contract.propertyTitle}
            </h1>
            <Badge className={getStatusColor(contract.status)}>
              {contract.status === 'active' ? 'Activo' :
               contract.status === 'pending_signatures' ? 'Pendiente Firmas' :
               contract.status === 'draft' ? 'Borrador' :
               contract.status === 'expired' ? 'Expirado' :
               contract.status === 'terminated' ? 'Terminado' :
               contract.status === 'cancelled' ? 'Cancelado' : contract.status}
            </Badge>
          </div>
          <p className="text-gray-600 mb-1">{contract.propertyAddress}</p>
          <p className="text-sm text-gray-500">
            Contrato ID: {contract.id}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
          {onEdit && contract.status === 'draft' && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onTerminate && contract.status === 'active' && (
            <Button variant="outline" onClick={onTerminate} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Terminar
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {contract.status === 'pending_signatures' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">Firmas Pendientes</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {t('contracts.pending_signatures')}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-yellow-700 mb-1">
                  <span>Progreso de Firmas</span>
                  <span>{Math.round(getSignatureProgress())}%</span>
                </div>
                <Progress value={getSignatureProgress()} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {overduePayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Pagos Vencidos</h4>
              <p className="text-sm text-red-700 mt-1">
                Hay {overduePayments.length} pago{overduePayments.length > 1 ? 's' : ''} vencido{overduePayments.length > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="parties">Partes</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contract Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Fechas del Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Inicio</p>
                  <p className="font-medium">
                    {format(contract.startDate, 'PPP', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin</p>
                  <p className="font-medium">
                    {format(contract.endDate, 'PPP', { locale: es })}
                  </p>
                </div>
                <div>
                                <p className="text-sm text-gray-600">{t('contracts.duration')}</p>
              <p className="font-medium">
                {Math.ceil((contract.endDate.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24))} {t('contracts.days')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Renta</p>
                  <p className="font-medium text-lg">
                    ${contract.terms.rentAmount.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">
                      /{contract.terms.paymentFrequency === 'monthly' ? 'mes' : 
                        contract.terms.paymentFrequency === 'biweekly' ? 'quincenal' : 'semana'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('contracts.deposit')}</p>
                  <p className="font-medium">${contract.terms.depositAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('contracts.payment_day')}</p>
                  <p className="font-medium">{contract.terms.paymentDueDay}</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t('contracts.property_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t('contracts.address')}</p>
                  <p className="font-medium">{contract.propertyAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Incluidos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contract.terms.utilitiesIncluded.length > 0 ? (
                      contract.terms.utilitiesIncluded.map((utility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {utility}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Ninguno</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terms and Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('contracts.policies')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Mascotas</span>
                  <Badge variant={contract.terms.petPolicy.allowed ? "default" : "secondary"}>
                    {contract.terms.petPolicy.allowed ? 'Permitidas' : 'No Permitidas'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Fumar</span>
                  <Badge variant={contract.terms.smokingPolicy ? "default" : "secondary"}>
                    {contract.terms.smokingPolicy ? 'Permitido' : 'No Permitido'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{t('contracts.guests')}</span>
                  <Badge variant={contract.terms.guestPolicy.allowed ? "default" : "secondary"}>
                    {contract.terms.guestPolicy.allowed ? 'Permitidos' : 'No Permitidos'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mantenimiento</span>
                  <Badge variant="outline">
                    {contract.terms.maintenanceResponsibility === 'tenant' ? 'Inquilino' :
                     contract.terms.maintenanceResponsibility === 'hoster' ? 'Arrendador' : 'Compartido'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('contracts.renewal')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">{t('contracts.automatic')}</span>
                  <Badge variant={contract.terms.renewalTerms?.automatic ? "default" : "secondary"}>
                    {contract.terms.renewalTerms?.automatic ? t('contracts.yes') : t('contracts.no')}
                  </Badge>
                </div>
                {contract.terms.renewalTerms?.automatic && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Aviso Previo</span>
                      <span className="text-sm font-medium">
                        {contract.terms.renewalTerms.noticePeriod} {t('contracts.days')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Incremento</span>
                      <span className="text-sm font-medium">
                        {contract.terms.renewalTerms.rentIncrease}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parties Tab */}
        <TabsContent value="parties" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Inquilino
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{contract.tenant.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{contract.tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{contract.tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">ID: {contract.tenant.idNumber}</span>
                  </div>
                </div>
                {contract.status === 'pending_signatures' && (
                  <div className="flex items-center gap-2 mt-2">
                    {contract.signatures.tenantSigned ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className={`text-sm ${contract.signatures.tenantSigned ? 'text-green-600' : 'text-yellow-600'}`}>
                      {contract.signatures.tenantSigned ? 'Firmado' : 'Pendiente de firma'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hoster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Arrendador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{contract.hoster.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{contract.hoster.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{contract.hoster.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">ID: {contract.hoster.idNumber}</span>
                  </div>
                </div>
                {contract.status === 'pending_signatures' && (
                  <div className="flex items-center gap-2 mt-2">
                    {contract.signatures.hosterSigned ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className={`text-sm ${contract.signatures.hosterSigned ? 'text-green-600' : 'text-yellow-600'}`}>
                      {contract.signatures.hosterSigned ? 'Firmado' : 'Pendiente de firma'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guarantors */}
          {contract.guarantors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Garantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contract.guarantors.map((guarantor) => (
                    <div key={guarantor.id} className="border rounded-lg p-4">
                      <p className="font-medium">{guarantor.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{guarantor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{guarantor.phone}</span>
                      </div>
                      {contract.status === 'pending_signatures' && (
                        <div className="flex items-center gap-2 mt-2">
                          {contract.signatures.guarantorsSigned[guarantor.id]?.signed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          <span className={`text-sm ${contract.signatures.guarantorsSigned[guarantor.id]?.signed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {contract.signatures.guarantorsSigned[guarantor.id]?.signed ? 'Firmado' : 'Pendiente de firma'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.payments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
              ) : (
                <div className="space-y-3">
                  {contract.payments
                    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
                    .map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${payment.amount.toLocaleString()}</span>
                          <Badge variant={
                            payment.status === 'paid' ? 'default' :
                            payment.status === 'overdue' ? 'destructive' :
                            payment.status === 'partial' ? 'secondary' : 'outline'
                          }>
                            {payment.status === 'paid' ? 'Pagado' :
                             payment.status === 'overdue' ? 'Vencido' :
                             payment.status === 'partial' ? 'Parcial' : 'Pendiente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.description} - Vence: {format(payment.dueDate, 'PPP', { locale: es })}
                        </p>
                        {payment.paidDate && (
                          <p className="text-sm text-green-600">
                            Pagado: {format(payment.paidDate, 'PPP', { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentos del Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay documentos subidos</p>
              ) : (
                <div className="space-y-3">
                  {contract.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-gray-600">
                            {document.type} - {(document.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-500">
                            Subido: {format(document.uploadedAt, 'PPP', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => contractService.downloadDocument(contractId, document.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historial de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay eventos registrados</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-gray-600">
                          {format(event.timestamp, 'PPP p', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractDetails; 