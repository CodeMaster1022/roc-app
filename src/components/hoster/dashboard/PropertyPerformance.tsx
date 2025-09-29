import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Users, TrendingUp, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyPerformanceProps {
  properties: Array<{
    id: string;
    title: string;
    location: string;
    rent: number;
    applications: number;
    approvedApplications: number;
    occupancyRate: number;
    status: string;
  }>;
  bestPerforming: any;
}

export const PropertyPerformance: React.FC<PropertyPerformanceProps> = ({ 
  properties, 
  bestPerforming 
}) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t('dashboard.topProperties') || 'properties Destacadas'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Best Performing Property Highlight */}
        {bestPerforming && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('dashboard.bestPerforming') || 'Mejor Rendimiento'}
              </span>
            </div>
            <h4 className="font-semibold">{bestPerforming.title}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {bestPerforming.location}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">{formatCurrency(bestPerforming.rent)}</span>
              <Badge variant="default" className="text-xs">
                {bestPerforming.applications} {t('dashboard.applications') || 'solicitudes'}
              </Badge>
            </div>
          </div>
        )}

        {/* Properties List */}
        <div className="space-y-3">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div key={property.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{property.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {property.location}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-medium">{formatCurrency(property.rent)}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(property.status)}`}
                      >
                        {getStatusLabel(property.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {property.applications} {t('dashboard.apps') || 'sol'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-medium text-green-600">
                        {Math.round(property.occupancyRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('dashboard.noProperties') || 'No hay properties registradas'}</p>
              <p className="text-sm mt-1">
                {t('dashboard.addPropertyPrompt') || 'Agrega tu primera propiedad para ver analytics'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {properties.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{properties.length}</p>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.totalProps') || 'properties'}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {properties.reduce((sum, p) => sum + p.applications, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.totalApps') || 'Solicitudes'}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {Math.round(properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.avgOccupancy') || 'Ocupación Prom.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 