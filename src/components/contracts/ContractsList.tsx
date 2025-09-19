import React, { useState, useEffect } from 'react';
import { Contract, ContractSearchParams } from '@/types/contract';
import ContractCard from './ContractCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, SortAsc, SortDesc } from 'lucide-react';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContractsListProps {
  onViewDetails: (contractId: string) => void;
  onCreateNew: () => void;
  onEdit?: (contractId: string) => void;
  onTerminate?: (contractId: string) => void;
  propertyId?: string; // Filter by specific property
  tenantId?: string; // Filter by specific tenant
}

const ContractsList: React.FC<ContractsListProps> = ({
  onViewDetails,
  onCreateNew,
  onEdit,
  onTerminate,
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Contract['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'startDate' | 'endDate' | 'rentAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ContractSearchParams = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(propertyId && { propertyId }),
        ...(tenantId && { tenantId })
      };

      const response = await contractService.searchContracts(params);
      setContracts(response.contracts);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
      setError('Error al cargar los contratos. Por favor, intenta de nuevo.');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contratos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, statusFilter, sortBy, sortOrder, propertyId, tenantId]);

  const filteredContracts = contracts.filter(contract => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contract.propertyTitle.toLowerCase().includes(query) ||
      contract.propertyAddress.toLowerCase().includes(query) ||
      contract.tenant.name.toLowerCase().includes(query) ||
      contract.tenant.email.toLowerCase().includes(query)
    );
  });

  const getStatusCounts = () => {
    const counts = contracts.reduce((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: contracts.length,
      active: counts.active || 0,
      pending_signatures: counts.pending_signatures || 0,
      draft: counts.draft || 0,
      expired: counts.expired || 0,
      terminated: counts.terminated || 0,
      cancelled: counts.cancelled || 0,
      ...counts
    };
  };

  const statusCounts = getStatusCounts();

  const handleTerminate = async (contractId: string) => {
    if (onTerminate) {
      onTerminate(contractId);
      // Refresh the list after termination
      setTimeout(() => {
        fetchContracts();
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Cargando contratos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Error al cargar contratos</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchContracts}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Contratos</h2>
          <p className="text-gray-600 mt-1">
            Gestiona el ciclo de vida de tus contratos de arrendamiento
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Contrato
        </Button>
      </div>

      {/* Status Filter Badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: t('contracts.filter_all'), count: statusCounts.all },
          { key: 'active', label: getStatusTranslation('active'), count: statusCounts.active },
          { key: 'pending_signatures', label: getStatusTranslation('pending_signatures'), count: statusCounts.pending_signatures },
          { key: 'draft', label: getStatusTranslation('draft'), count: statusCounts.draft },
          { key: 'expired', label: getStatusTranslation('expired'), count: statusCounts.expired },
          { key: 'terminated', label: getStatusTranslation('terminated'), count: statusCounts.terminated }
        ].map(({ key, label, count }) => (
          <Badge
            key={key}
            variant={statusFilter === key ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setStatusFilter(key as Contract['status'] | 'all')}
          >
            {label} {count ? `(${count})` : ''}
          </Badge>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('contracts.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('contracts.sort_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">{t('contracts.sort_by_date')}</SelectItem>
              <SelectItem value="startDate">{t('contracts.sort_by_start_date')}</SelectItem>
              <SelectItem value="endDate">{t('contracts.sort_by_end_date')}</SelectItem>
              <SelectItem value="rentAmount">{t('contracts.sort_by_rent')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">{t('contracts.no_contracts_title')}</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? t('contracts.no_contracts_found')
              : t('contracts.no_contracts_yet')}
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Button onClick={onCreateNew} variant="outline">
              {t('contracts.create_first_contract')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onTerminate={handleTerminate}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={page === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContractsList; 