import React, { useState, useEffect } from 'react';
import { Contract, ContractAnalytics } from '@/types/contract';
import ContractsList from './ContractsList';
import ContractDetails from './ContractDetails';
import ContractForm from './ContractForm';
import ContractLifecycle from './ContractLifecycle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractsDashboardProps {
  propertyId?: string; // Filter by specific property
  tenantId?: string; // Filter by specific tenant
}

const ContractsDashboard: React.FC<ContractsDashboardProps> = ({
  propertyId,
  tenantId
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  // Helper function to get status translation with fallback
  const getStatusTranslation = (status: string) => {
    const translationKey = `contract_status.${status}`;
    const translated = t(translationKey);
    return translated === translationKey ? status : translated;
  };
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'details' | 'form' | 'lifecycle'>('dashboard');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [analytics, setAnalytics] = useState<ContractAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await contractService.getContractAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: t('contracts.analytics_error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleViewDetails = (contractId: string) => {
    setSelectedContractId(contractId);
    setCurrentView('details');
  };

  const handleCreateNew = () => {
    setSelectedContract(null);
    setCurrentView('form');
  };

  const handleEdit = (contractId: string) => {
    // In a real implementation, you'd fetch the contract data first
    setSelectedContractId(contractId);
    setCurrentView('form');
  };

  const handleTerminate = (contractId: string) => {
    setSelectedContractId(contractId);
    setCurrentView('lifecycle');
  };

  const handleFormSubmit = async (contractData: any) => {
    try {
      if (selectedContract) {
        // Update existing contract
        await contractService.updateContract(selectedContract.id, contractData);
        toast({
          title: t('contracts.success'),
          description: 'Contrato actualizado correctamente'
        });
      } else {
        // Create new contract
        await contractService.createContract(contractData);
        toast({
          title: t('contracts.success'),
          description: 'Contrato creado correctamente'
        });
      }
      setCurrentView('list');
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to save contract:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el contrato',
        variant: 'destructive'
      });
    }
  };

  const handleContractUpdate = (updatedContract: Contract) => {
    setSelectedContract(updatedContract);
    fetchAnalytics(); // Refresh analytics
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t('contracts.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('contracts.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('contracts.new_contract')}
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('contracts.total_contracts')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalContracts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeContracts || 0} {t('contracts.active_contracts')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('contracts.total_income')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(analytics.totalRentCollected || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('contracts.average_label')}: ${(analytics.averageRentAmount || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('contracts.occupancy_rate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics.occupancyRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeContracts || 0} {t('contracts.occupied_properties')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('contracts.alerts')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(analytics.expiringSoon || 0) + (analytics.overduePayments || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.expiringSoon || 0} {t('contracts.expiring')}, {analytics.overduePayments || 0} {t('contracts.overdue_payments')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contracts.contract_status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
                              {Object.entries(analytics.contractsByStatus || {}).map(([status, count]) => (
                <Badge key={status} variant="outline" className="px-3 py-1">
                  {getStatusTranslation(status)}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('list')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('contracts.view_all_contracts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t('contracts.view_all_description')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateNew}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('contracts.create_new_contract')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t('contracts.create_new_description')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('contracts.reports_analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t('contracts.reports_description')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Alerts */}
                {analytics && ((analytics.expiringSoon || 0) > 0 || (analytics.overduePayments || 0) > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              {t('contracts.attention_required')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(analytics.expiringSoon || 0) > 0 && (
                <p className="text-orange-700">
                  • {analytics.expiringSoon || 0} {(analytics.expiringSoon || 0) > 1 ? t('contracts.contract_plural') : t('contracts.contract_singular')} {(analytics.expiringSoon || 0) > 1 ? t('contracts.expires_plural') : t('contracts.expires_singular')} {t('contracts.expires_in_30_days')}
                </p>
              )}
              {(analytics.overduePayments || 0) > 0 && (
                <p className="text-orange-700">
                  • {analytics.overduePayments || 0} {(analytics.overduePayments || 0) > 1 ? t('contracts.payment_plural') : t('contracts.payment_singular')} {(analytics.overduePayments || 0) > 1 ? t('contracts.overdue_plural') : t('contracts.overdue_singular')}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="mt-3 text-orange-700 border-orange-300 hover:bg-orange-100"
              onClick={() => setCurrentView('list')}
            >
              {t('contracts.view_contracts')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBackButton = () => (
    <Button 
      variant="ghost" 
      onClick={() => setCurrentView('dashboard')} 
      className="mb-4 flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver al Dashboard
    </Button>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {currentView === 'dashboard' && renderDashboard()}
      
      {currentView === 'list' && (
        <>
          {renderBackButton()}
          <ContractsList
            onViewDetails={handleViewDetails}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onTerminate={handleTerminate}
            propertyId={propertyId}
            tenantId={tenantId}
          />
        </>
      )}
      
      {currentView === 'details' && selectedContractId && (
        <>
          {renderBackButton()}
          <ContractDetails
            contractId={selectedContractId}
            onEdit={() => handleEdit(selectedContractId)}
            onTerminate={() => handleTerminate(selectedContractId)}
            onClose={() => setCurrentView('list')}
          />
        </>
      )}
      
      {currentView === 'form' && (
        <>
          {renderBackButton()}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedContract ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedContract ? t('contracts.modify_existing') : t('contracts.complete_info_new')}
              </p>
            </div>
            <ContractForm
              contract={selectedContract || undefined}
              propertyId={propertyId}
              tenantId={tenantId}
              onSubmit={handleFormSubmit}
              onCancel={() => setCurrentView(selectedContract ? 'details' : 'list')}
            />
          </div>
        </>
      )}
      
      {currentView === 'lifecycle' && selectedContractId && (
        <>
          {renderBackButton()}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{t('contracts.lifecycle_management')}</h2>
              <p className="text-gray-600 mt-1">
                Administra las transiciones y estados del contrato
              </p>
            </div>
            <Tabs defaultValue="lifecycle" className="space-y-6">
              <TabsList>
                <TabsTrigger value="lifecycle">Ciclo de Vida</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lifecycle">
                {selectedContract && (
                  <ContractLifecycle
                    contract={selectedContract}
                    onContractUpdate={handleContractUpdate}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="details">
                <ContractDetails
                  contractId={selectedContractId}
                  onEdit={() => setCurrentView('form')}
                  onTerminate={() => {}} // Already in lifecycle view
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default ContractsDashboard; 