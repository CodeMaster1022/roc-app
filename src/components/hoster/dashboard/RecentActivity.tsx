import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: string;
    status: string;
    propertyTitle: string;
    createdAt: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return t('dashboard.approved') || 'Aprobada';
      case 'rejected':
        return t('dashboard.rejected') || 'Rechazada';
      case 'pending':
        return t('dashboard.pending') || 'Pendiente';
      default:
        return status;
    }
  };

  const getActivityDescription = (activity: any) => {
    const baseText = t('dashboard.applicationFor') || 'Solicitud para';
    return `${baseText} ${activity.propertyTitle}`;
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t('dashboard.recentActivity') || 'Actividad Reciente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {getActivityDescription(activity)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('dashboard.noRecentActivity') || 'No hay actividad reciente'}</p>
            <p className="text-sm mt-1">
              {t('dashboard.activityWillAppear') || 'La actividad aparecerá aquí cuando recibas solicitudes'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 