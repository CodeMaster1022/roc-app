import { TenantApplication } from "@/types/tenant";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Briefcase, GraduationCap, Building, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

interface TenantCardProps {
  application: TenantApplication;
  onViewDetails: () => void;
}

export const TenantCard = ({ application, onViewDetails }: TenantCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const handleViewDetails = () => {
    if (isMobile) {
      navigate(`/inquilinos/${application.id}`);
    } else {
      onViewDetails();
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { 
        variant: "outline" as const, 
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: t('tenants.status.pending') || 'Pendiente'
      },
      approved: { 
        variant: "outline" as const, 
        className: "bg-green-50 text-green-700 border-green-200",
        label: t('tenants.status.approved') || 'Aprobada'
      },
      rejected: { 
        variant: "outline" as const, 
        className: "bg-red-50 text-red-700 border-red-200",
        label: t('tenants.status.rejected') || 'Rechazada'
      },
    };

    const config = statusConfig[application.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={`${config.className} text-xs px-2 py-1`}>
        {config.label}
      </Badge>
    );
  };

  const getTenantTypeIcon = () => {
    switch (application.tenantType) {
      case 'student':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'entrepreneur':
        return <Building className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTenantTypeLabel = () => {
    const typeLabels = {
      student: t('tenants.type.student') || 'Estudiante',
      professional: t('tenants.type.professional') || 'Profesional',
      entrepreneur: t('tenants.type.entrepreneur') || 'Emprendedor',
    };
    return typeLabels[application.tenantType as keyof typeof typeLabels] || '';
  };

  if (isMobile) {
    return (
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{application.applicantName}</h3>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getTenantTypeIcon()}
                <span className="truncate">{getTenantTypeLabel()}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewDetails}
              className="shrink-0 text-xs px-2 py-1"
            >
              {t('common.view') || 'Ver'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Property */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="truncate text-muted-foreground">{application.propertyName}</span>
            </div>
            
            {/* Contract Duration & Move-in Date */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block">{t('tenants.contract_duration') || 'Duración'}:</span>
                <span className="font-medium">{application.contractDuration}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t('tenants.move_in_date') || 'Ingreso'}:</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(application.moveInDate, "dd/MM/yy")}
                </span>
              </div>
            </div>
            
            {/* Applied Date */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {t('tenants.applied_on') || 'Aplicó el'} {format(application.appliedAt, "dd/MM/yyyy")}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop layout
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{application.applicantName}</h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {getTenantTypeIcon()}
                <span>{getTenantTypeLabel()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{application.propertyName}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            {t('tenants.view_details') || 'Ver detalles'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium text-foreground">
              {t('tenants.contract_duration') || 'Duración del contrato'}:
            </span>
            <p className="text-muted-foreground">{application.contractDuration}</p>
          </div>
          <div>
            <span className="font-medium text-foreground">
              {t('tenants.move_in_date') || 'Fecha de ingreso'}:
            </span>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(application.moveInDate, "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {t('tenants.applied_on') || 'Aplicó el'} {format(application.appliedAt, "dd/MM/yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
