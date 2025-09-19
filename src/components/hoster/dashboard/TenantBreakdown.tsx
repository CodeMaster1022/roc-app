import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface TenantBreakdownProps {
  applicationsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  totalApplications: number;
}

const statusColors = {
  pending: "#f59e0b",
  approved: "#10b981", 
  rejected: "#ef4444",
};

const statusLabels = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
};

export const TenantBreakdown: React.FC<TenantBreakdownProps> = ({ 
  applicationsByStatus, 
  totalApplications 
}) => {
  const { t } = useLanguage();
  
  const chartData = [
    {
      name: statusLabels.approved,
      value: applicationsByStatus.approved,
      color: statusColors.approved
    },
    {
      name: statusLabels.pending,
      value: applicationsByStatus.pending,
      color: statusColors.pending
    },
    {
      name: statusLabels.rejected,
      value: applicationsByStatus.rejected,
      color: statusColors.rejected
    }
  ].filter(item => item.value > 0);

  const getPercentage = (value: number) => {
    return totalApplications > 0 ? Math.round((value / totalApplications) * 100) : 0;
  };
  
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">
          {t('dashboard.applicationStatus') || 'Estado de Solicitudes'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalApplications > 0 ? (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Solicitudes']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {Object.entries(applicationsByStatus).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                      />
                      <span className="font-medium">
                        {statusLabels[status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {count} ({getPercentage(count)}%)
                      </span>
                      <Badge 
                        variant={status === 'approved' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {count}
                      </Badge>
                    </div>
                  </div>
                )
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('dashboard.noApplications') || 'No hay solicitudes aún'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};