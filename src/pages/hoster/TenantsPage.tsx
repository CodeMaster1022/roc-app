import { useState, useEffect } from "react";
import { TenantApplication, ApplicationStatus } from "@/types/tenant";
import { TenantCard } from "@/components/hoster/tenants/TenantCard";
import { TenantDetailModal } from "@/components/hoster/tenants/TenantDetailModal";
import { NotificationDemo } from "@/components/hoster/notifications/NotificationDemo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationService } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const TenantsPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<TenantApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  // Load applications from backend
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getHosterApplications();
        
        // Transform backend applications to match TenantApplication interface
        const transformedApplications: TenantApplication[] = response.data.applications.map((app: any) => ({
          id: app.id || app._id,
          propertyId: app.propertyId?._id || app.propertyId,
          propertyName: app.propertyId?.title || app.propertyId?.name || 'Unknown Property',
          applicantName: app.applicantId?.name || 'Unknown Applicant',
          applicantEmail: app.applicantId?.email || '',
          phone: app.phone || '',
          contractDuration: `${app.contractDuration} meses`,
          moveInDate: new Date(app.occupancyDate),
          tenantType: app.occupationType,
          applicationData: app.applicationData || {},
          kyc: app.kyc || {},
          status: app.status,
          appliedAt: new Date(app.appliedAt),
          reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined,
          reviewNotes: app.reviewNotes
        }));
        
        setApplications(transformedApplications);
      } catch (error: any) {
        console.error('Failed to load applications:', error);
        toast({
          title: t('common.error') || "Error",
          description: t('tenants.load_error') || "Failed to load applications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [toast, t]);

  const handleStatusUpdate = async (applicationId: string, status: ApplicationStatus, notes?: string) => {
    try {
      // Update status on backend
      await applicationService.updateApplicationStatus(applicationId, status, notes);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status, reviewedAt: new Date(), reviewNotes: notes }
          : app
      ));
      setSelectedApplication(null);
      
      toast({
        title: t('tenants.application_updated') || "Application Updated",
        description: t('tenants.application_updated_desc') || `Application ${status} successfully`,
      });
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      toast({
        title: t('common.error') || "Error",
        description: t('tenants.update_error') || "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="space-y-3 md:space-y-6 p-2 md:p-0">
      {/* Only show NotificationDemo on desktop */}
      {/* {!isMobile && <NotificationDemo />} */}
      
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-lg md:text-2xl font-bold text-foreground">
          {t('tenants.title') || 'Gestión de Inquilinos'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {t('tenants.subtitle') || 'Administra la información de tus inquilinos'}
        </p>
      </div>

      {/* Tabs with improved mobile layout */}
      <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as ApplicationStatus | 'all')}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} mb-3 md:mb-6 h-auto`}>
          <TabsTrigger 
            value="all" 
            className="flex flex-col items-center gap-1 text-xs md:text-sm p-2 md:p-3 min-h-[3rem]"
          >
            <span className="font-medium">{t('tenants.all') || 'Todas'}</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex flex-col items-center gap-1 text-xs md:text-sm p-2 md:p-3 min-h-[3rem]"
          >
            <span className="font-medium">{t('tenants.pending') || 'Pendientes'}</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{statusCounts.pending}</Badge>
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger 
                value="approved" 
                className="flex flex-col items-center gap-1 text-xs md:text-sm p-2 md:p-3 min-h-[3rem]"
              >
                <span className="font-medium">{t('tenants.approved') || 'Aprobadas'}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{statusCounts.approved}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="flex flex-col items-center gap-1 text-xs md:text-sm p-2 md:p-3 min-h-[3rem]"
              >
                <span className="font-medium">{t('tenants.rejected') || 'Rechazadas'}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{statusCounts.rejected}</Badge>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Mobile-only status selector for approved/rejected */}
        {isMobile && (filterStatus === 'approved' || filterStatus === 'rejected') && (
          <div className="flex gap-2 mb-3">
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('approved')}
              className="flex items-center gap-2"
            >
              {t('tenants.approved') || 'Aprobadas'}
              <Badge variant="secondary" className="text-xs">{statusCounts.approved}</Badge>
            </Button>
            <Button
              variant={filterStatus === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('rejected')}
              className="flex items-center gap-2"
            >
              {t('tenants.rejected') || 'Rechazadas'}
              <Badge variant="secondary" className="text-xs">{statusCounts.rejected}</Badge>
            </Button>
          </div>
        )}

        <TabsContent value={filterStatus} className="space-y-2 md:space-y-4">
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-pulse space-y-2">
                <div className="w-8 h-8 bg-muted rounded-full mx-auto"></div>
                <p className="text-muted-foreground text-sm md:text-base">
                  {t('common.loading') || 'Cargando aplicaciones...'}
                </p>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm md:text-base">
                  {t('tenants.no_applications') || 'No hay aplicaciones'} 
                  {filterStatus !== 'all' && (
                    <span className="block mt-1 text-xs">
                      {t('tenants.with_status') || 'con estado'} {filterStatus}
                    </span>
                  )}
                </p>
                {filterStatus !== 'all' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFilterStatus('all')}
                    className="mt-2"
                  >
                    {t('tenants.view_all') || 'Ver todas'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-2 md:gap-4">
              {filteredApplications.map((application) => (
                <TenantCard
                  key={application.id}
                  application={application}
                  onViewDetails={() => setSelectedApplication(application)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal - only show on desktop */}
      {selectedApplication && !isMobile && (
        <TenantDetailModal
          application={selectedApplication}
          open={!!selectedApplication}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default TenantsPage;
