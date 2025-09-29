import React, { useState, useEffect } from "react";
import { TimeSelector } from "./TimeSelector";
import { KPICard } from "./KPICard";  
import { TenantBreakdown } from "./TenantBreakdown";
import { PerformanceChart } from "./PerformanceChart";
import { EmptyStatePrompt } from "./EmptyStatePrompt";
import { FinancialOverview } from "./FinancialOverview";
import { PropertyPerformance } from "./PropertyPerformance";
import { RecentActivity } from "./RecentActivity";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyticsService, DashboardAnalytics } from "@/services/analyticsService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const Dashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months'>('6months');
  
  const fetchAnalytics = async (period: '6months' | '12months' = selectedPeriod) => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardAnalytics({ period });
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: t('common.error') || 'Error',
        description: error.message || 'Failed to load dashboard analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handlePeriodChange = (period: '6months' | '12months') => {
    setSelectedPeriod(period);
    fetchAnalytics(period);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalProperties === 0) {
    return <EmptyStatePrompt />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="hidden md:block">
        <TimeSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
      </div>
      
      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <KPICard 
          title={t('dashboard.totalProperties') || 'Total properties'}
          value={analytics.totalProperties}
          subtitle={`${analytics.activeProperties} ${t('dashboard.active') || 'activas'}`}
          highlight
        />
        <KPICard 
          title={t('dashboard.occupancyRate') || 'Tasa de Ocupación'}
          value={`${analytics.occupancyRate}%`}
          subtitle={`${analytics.approvedApplications} ${t('dashboard.occupied') || 'ocupadas'}`}
        />
        <KPICard 
          title={t('dashboard.totalIncome') || 'Ingresos Mensuales'}
          value={analyticsService.formatCurrency(analytics.financialOverview.monthlyRevenue)}
          subtitle={t('dashboard.estimated') || 'estimado'}
          highlight
        />
        <KPICard 
          title={t('dashboard.totalApplications') || 'Solicitudes'}
          value={analytics.totalApplications}
          subtitle={`${analytics.pendingApplications} ${t('dashboard.pending') || 'pendientes'}`}
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <KPICard 
          title={t('dashboard.approvalRate') || 'Tasa de Aprobación'}
          value={`${analytics.insights.approvalRate}%`}
          subtitle={`${analytics.approvedApplications} ${t('dashboard.approved') || 'aprobadas'}`}
        />
        <KPICard 
          title={t('dashboard.averageRent') || 'Renta Promedio'}
          value={analyticsService.formatCurrency(analytics.financialOverview.averageRentPerProperty)}
          subtitle={t('dashboard.perProperty') || 'por propiedad'}
        />
        <KPICard 
          title={t('dashboard.annualRevenue') || 'Ingresos Anuales'}
          value={analyticsService.formatCurrency(analytics.financialOverview.estimatedAnnualRevenue)}
          subtitle={t('dashboard.projected') || 'proyectado'}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <PerformanceChart data={analytics.monthlyPerformance} />
        <TenantBreakdown 
          applicationsByStatus={analytics.applicationsByStatus}
          totalApplications={analytics.totalApplications}
        />
      </div>

      {/* Financial Overview and Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <FinancialOverview data={analytics.financialOverview} />
        <PropertyPerformance 
          properties={analytics.topProperties} 
          bestPerforming={analytics.insights.bestPerformingProperty}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={analytics.recentActivity} />
    </div>
  );
};