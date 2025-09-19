import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FinancialOverviewProps {
  data: {
    monthlyRevenue: number;
    estimatedAnnualRevenue: number;
    averageRentPerProperty: number;
    totalRentCollected: number;
    pendingPayments: number;
    overduePayments: number;
  };
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ data }) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const metrics = [
    {
      label: t('dashboard.monthlyRevenue') || 'Ingresos Mensuales',
      value: formatCurrency(data.monthlyRevenue),
      icon: DollarSign,
      trend: 'positive' as const,
      description: t('dashboard.currentMonth') || 'Mes actual'
    },
    {
      label: t('dashboard.annualProjection') || 'Proyección Anual',
      value: formatCurrency(data.estimatedAnnualRevenue),
      icon: TrendingUp,
      trend: 'positive' as const,
      description: t('dashboard.basedOnCurrent') || 'Basado en ingresos actuales'
    },
    {
      label: t('dashboard.averageRent') || 'Renta Promedio',
      value: formatCurrency(data.averageRentPerProperty),
      icon: Calculator,
      trend: 'neutral' as const,
      description: t('dashboard.perProperty') || 'Por propiedad'
    },
    {
      label: t('dashboard.totalCollected') || 'Total Recaudado',
      value: formatCurrency(data.totalRentCollected),
      icon: DollarSign,
      trend: 'positive' as const,
      description: t('dashboard.toDate') || 'A la fecha'
    }
  ];

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t('dashboard.financialOverview') || 'Resumen Financiero'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{metric.value}</p>
                  {metric.trend === 'positive' && (
                    <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Status */}
        {(data.pendingPayments > 0 || data.overduePayments > 0) && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">{t('dashboard.paymentStatus') || 'Estado de Pagos'}</h4>
            <div className="flex space-x-2">
              {data.pendingPayments > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>{data.pendingPayments}</span>
                  <span className="text-xs">{t('dashboard.pending') || 'Pendientes'}</span>
                </Badge>
              )}
              {data.overduePayments > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <span>{data.overduePayments}</span>
                  <span className="text-xs">{t('dashboard.overdue') || 'Vencidos'}</span>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 