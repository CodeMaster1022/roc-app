import { useState } from "react";
import { TenantApplication, ApplicationStatus } from "@/types/tenant";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User, Calendar, MapPin, Building2, 
  GraduationCap, Briefcase, FileText, Download,
  CheckCircle, XCircle, Shield
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface TenantDetailModalProps {
  application: TenantApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (applicationId: string, status: ApplicationStatus, notes?: string) => void;
}

export const TenantDetailModal = ({ 
  application, 
  open, 
  onOpenChange, 
  onStatusUpdate 
}: TenantDetailModalProps) => {
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const isMobile = useIsMobile();

  // En mobile, no mostrar modal ya que se usa la página completa
  if (isMobile) {
    return null;
  }

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate(application.id, status, reviewNotes);
      setIsProcessing(false);
      setReviewNotes("");
    }, 1000);
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rechazada</Badge>;
    }
  };

  const renderApplicationSpecificData = () => {
    const { applicationData } = application;

    switch (applicationData.type) {
      case 'student':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Universidad</Label>
              <p className="text-sm text-gray-600">{applicationData.university}</p>
            </div>
            
            <div>
              <Label className="font-medium">¿Quién realizará los pagos?</Label>
              <p className="text-sm text-gray-600">
                {applicationData.paymentBy === 'student' ? 'El estudiante' : 'Un tutor'}
              </p>
            </div>

            {applicationData.paymentBy === 'student' ? (
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Fuente de ingresos</Label>
                  <p className="text-sm text-gray-600">{applicationData.incomeSource}</p>
                </div>
                <div>
                  <Label className="font-medium">Rango de ingresos</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{applicationData.incomeRange}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Shield className="w-4 h-4 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>ROC válido que este sea su rango de ingresos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ) : (
              applicationData.guardian && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información del tutor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Nombre</Label>
                        <p className="text-sm text-gray-600">{applicationData.guardian.name}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Relación</Label>
                        <p className="text-sm text-gray-600">{applicationData.guardian.relationship}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Rango de ingresos</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">{applicationData.guardian.incomeRange}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Shield className="w-4 h-4 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ROC válido que este sea su rango de ingresos</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Empresa</Label>
                <p className="text-sm text-gray-600">{applicationData.company}</p>
              </div>
              <div>
                <Label className="font-medium">Puesto</Label>
                <p className="text-sm text-gray-600">{applicationData.role}</p>
              </div>
            </div>
            <div>
              <Label className="font-medium">Fecha de inicio</Label>
              <p className="text-sm text-gray-600">
                {format(applicationData.startDate, "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <Label className="font-medium">Rango de ingresos</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">{applicationData.incomeRange}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="w-4 h-4 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ROC válido que este sea su rango de ingresos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        );

      case 'entrepreneur':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Nombre del emprendimiento</Label>
              <p className="text-sm text-gray-600">{applicationData.ventureName}</p>
            </div>
            <div>
              <Label className="font-medium">Descripción del emprendimiento</Label>
              <p className="text-sm text-gray-600">{applicationData.ventureDescription}</p>
            </div>
            <div>
              <Label className="font-medium">Sitio web o redes sociales</Label>
              <p className="text-sm text-gray-600">{applicationData.websiteOrSocial}</p>
            </div>
            <div>
              <Label className="font-medium">Rango de ingresos</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">{applicationData.incomeRange}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="w-4 h-4 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ROC válido que este sea su rango de ingresos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {application.applicantName}
                </DialogTitle>
                <DialogDescription>
                  Aplicación para {application.propertyName}
                </DialogDescription>
              </div>
              {getStatusBadge()}
            </div>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="specific">Información específica</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="review">Revisión</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <Label className="font-medium">Fecha de ingreso</Label>
                        <p className="text-sm text-gray-600">
                          {format(application.moveInDate, "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <Label className="font-medium">Duración del contrato</Label>
                        <p className="text-sm text-gray-600">{application.contractDuration}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specific" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {application.tenantType === 'student' && <GraduationCap className="w-4 h-4" />}
                    {application.tenantType === 'professional' && <Briefcase className="w-4 h-4" />}
                    {application.tenantType === 'entrepreneur' && <Building2 className="w-4 h-4" />}
                    Información específica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderApplicationSpecificData()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documentos KYC</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">Identificación validada</span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">Video selfie validado</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4 text-blue-600 inline mr-2" />
                      El usuario ha sido verificado y es quien dice ser mediante proceso KYC completo.
                    </p>
                  </div>
                  
                  {/* User Selfie Section */}
                  <div className="mt-6 flex flex-col items-center space-y-3">
                    <Label className="text-base font-medium">Foto del solicitante</Label>
                    <button
                      onClick={() => setShowSelfieModal(true)}
                      className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-105"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                        alt={`Foto de ${application.applicantName}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <p className="text-sm text-gray-600">Haz clic para ampliar</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              {application.status === 'pending' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revisar aplicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="review-notes">Notas de revisión (opcional)</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Agregar comentarios sobre la aplicación..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar aplicación
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={isProcessing}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar aplicación
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estado de la aplicación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Estado:</span> {getStatusBadge()}
                      </p>
                      {application.reviewedAt && (
                        <p className="text-sm">
                          <span className="font-medium">Revisado el:</span>{' '}
                          {format(application.reviewedAt, "dd/MM/yyyy 'a las' HH:mm")}
                        </p>
                      )}
                      {application.reviewNotes && (
                        <div>
                          <span className="font-medium">Notas:</span>
                          <p className="text-sm text-gray-600 mt-1">{application.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Selfie Modal */}
      <Dialog open={showSelfieModal} onOpenChange={setShowSelfieModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Foto de {application.applicantName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
              alt={`Foto ampliada de ${application.applicantName}`}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};