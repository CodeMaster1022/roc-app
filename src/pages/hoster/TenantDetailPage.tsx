import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TenantApplication, ApplicationStatus } from "@/types/tenant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  User, Calendar, MapPin, Building2, ArrowLeft,
  GraduationCap, Briefcase, FileText, Download,
  CheckCircle, XCircle, Shield
} from "lucide-react";
import { format } from "date-fns";

// Mock data - en una app real esto vendría de una API o contexto
const mockApplications: TenantApplication[] = [
  {
    id: "1",
    propertyId: "prop-1",
    propertyName: "Departamento Centro",
    applicantName: "María González",
    applicantEmail: "maria.gonzalez@university.edu",
    phone: "+52 55 1234 5678",
    contractDuration: "12 meses",
    moveInDate: new Date("2024-10-15"),
    tenantType: "student",
    applicationData: {
      type: "student",
      university: "Universidad Nacional",
      universityEmail: "maria.gonzalez@university.edu",
      paymentBy: "guardian",
      guardian: {
        name: "Carlos González",
        phone: "+52 55 8765 4321",
        email: "carlos.gonzalez@email.com",
        relationship: "Padre",
        incomeRange: "50k-100k",
        incomeDocuments: ["doc1.pdf", "doc2.pdf", "doc3.pdf"],
        idDocument: "guardian-id.jpg"
      }
    },
    kyc: {
      idDocument: "student-id.jpg",
      videoSelfie: "selfie-video.mp4"
    },
    status: "pending",
    appliedAt: new Date("2024-09-10"),
  },
  {
    id: "2",
    propertyId: "prop-2",
    propertyName: "Casa Roma Norte",
    applicantName: "Roberto Silva",
    applicantEmail: "roberto.silva@company.com",
    phone: "+52 55 9876 5432",
    contractDuration: "6 meses",
    moveInDate: new Date("2024-11-01"),
    tenantType: "professional",
    applicationData: {
      type: "professional",
      company: "Tech Solutions SA",
      startDate: new Date("2022-03-15"),
      role: "Desarrollador Senior",
      workEmail: "roberto.silva@company.com",
      incomeRange: "25k-50k",
      incomeDocuments: ["payslip1.pdf", "payslip2.pdf", "payslip3.pdf"]
    },
    kyc: {
      idDocument: "professional-id.jpg",
      videoSelfie: "professional-selfie.mp4"
    },
    status: "approved",
    appliedAt: new Date("2024-09-15"),
    reviewedAt: new Date("2024-09-16"),
  }
];

const TenantDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);

  // En una app real, esto vendría de una API
  const application = mockApplications.find(app => app.id === id);

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Aplicación no encontrada</p>
      </div>
    );
  }

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // En una app real, esto actualizaría el estado global o haría una llamada API
      setIsProcessing(false);
      setReviewNotes("");
      navigate(-1); // Regresar a la página anterior
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
              <p className="text-sm text-muted-foreground mt-1">{applicationData.university}</p>
            </div>
            
            <div>
              <Label className="font-medium">¿Quién realizará los pagos?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {applicationData.paymentBy === 'student' ? 'El estudiante' : 'Un tutor'}
              </p>
            </div>

            {applicationData.paymentBy === 'student' ? (
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Fuente de ingresos</Label>
                  <p className="text-sm text-muted-foreground mt-1">{applicationData.incomeSource}</p>
                </div>
                <div>
                  <Label className="font-medium">Rango de ingresos</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{applicationData.incomeRange}</p>
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
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Información del tutor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="font-medium">Nombre</Label>
                      <p className="text-sm text-muted-foreground mt-1">{applicationData.guardian.name}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Relación</Label>
                      <p className="text-sm text-muted-foreground mt-1">{applicationData.guardian.relationship}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Rango de ingresos</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{applicationData.guardian.incomeRange}</p>
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
            <div>
              <Label className="font-medium">Empresa</Label>
              <p className="text-sm text-muted-foreground mt-1">{applicationData.company}</p>
            </div>
            <div>
              <Label className="font-medium">Puesto</Label>
              <p className="text-sm text-muted-foreground mt-1">{applicationData.role}</p>
            </div>
            <div>
              <Label className="font-medium">Fecha de inicio</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {format(applicationData.startDate, "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <Label className="font-medium">Rango de ingresos</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{applicationData.incomeRange}</p>
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
              <p className="text-sm text-muted-foreground mt-1">{applicationData.ventureName}</p>
            </div>
            <div>
              <Label className="font-medium">Descripción del emprendimiento</Label>
              <p className="text-sm text-muted-foreground mt-1">{applicationData.ventureDescription}</p>
            </div>
            <div>
              <Label className="font-medium">Sitio web o redes sociales</Label>
              <p className="text-sm text-muted-foreground mt-1">{applicationData.websiteOrSocial}</p>
            </div>
            <div>
              <Label className="font-medium">Rango de ingresos</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{applicationData.incomeRange}</p>
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header con botón de regresar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Detalle de Aplicación</h1>
          <div className="w-10" /> {/* Spacer para centrar el título */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Información del aplicante */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                {application.applicantName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Aplicación para {application.propertyName}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Información General */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Información General
          </h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Fecha de ingreso</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(application.moveInDate, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Duración del contrato</Label>
                  <p className="text-sm text-muted-foreground">{application.contractDuration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Específica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
            {application.tenantType === 'student' && <GraduationCap className="w-5 h-5" />}
            {application.tenantType === 'professional' && <Briefcase className="w-5 h-5" />}
            {application.tenantType === 'entrepreneur' && <Building2 className="w-5 h-5" />}
            Información Específica
          </h3>
          <Card>
            <CardContent className="p-4">
              {renderApplicationSpecificData()}
            </CardContent>
          </Card>
        </div>

        {/* Documentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Documentos
          </h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
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
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-blue-600 inline mr-2" />
                  El usuario ha sido verificado y es quien dice ser mediante proceso KYC completo.
                </p>
              </div>
              
              {/* User Selfie Section */}
              <div className="flex flex-col items-center space-y-3">
                <Label className="text-base font-medium">Foto del solicitante</Label>
                <button
                  onClick={() => setShowSelfieModal(true)}
                  className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-200 hover:border-green-300 transition-all duration-200"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    alt={`Foto de ${application.applicantName}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="text-sm text-muted-foreground">Toca para ampliar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Revisión */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Revisión
          </h3>
          {application.status === 'pending' ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="review-notes">Notas de revisión (opcional)</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Agregar comentarios sobre la aplicación..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar aplicación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isProcessing}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar aplicación
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estado:</span> {getStatusBadge()}
                  </div>
                  {application.reviewedAt && (
                    <p className="text-sm">
                      <span className="font-medium">Revisado el:</span>{' '}
                      {format(application.reviewedAt, "dd/MM/yyyy 'a las' HH:mm")}
                    </p>
                  )}
                  {application.reviewNotes && (
                    <div>
                      <span className="font-medium">Notas:</span>
                      <p className="text-sm text-muted-foreground mt-1">{application.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetailPage;