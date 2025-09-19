import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RocButton } from "@/components/ui/roc-button"
import { FileText, CreditCard, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { applicationService, type Application } from "@/services/applicationService"
import { useToast } from "@/hooks/use-toast"
import { PaymentModal } from "@/components/payments/PaymentModal"
import { paymentService, type Payment } from "@/services/paymentService"
import { ContractSigningModal } from "@/components/contracts/ContractSigningModal"
import { Contract } from "@/types/contract"
import { contractService } from "@/services/contractService"

const HomeDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showContractSigningModal, setShowContractSigningModal] = useState(false)
  const { t } = useLanguage()
  const { toast } = useToast()

  // Helper function to get payment for an application
  const getPaymentForApplication = (applicationId: string, paymentType: Payment['paymentType'] = 'first_month'): Payment | undefined => {
    const foundPayment = payments.find(payment => {
      // Handle case where applicationId might be an object with id field or a string
      const paymentApplicationId = typeof payment.applicationId === 'string' 
        ? payment.applicationId 
        : (payment.applicationId as any)?.id || payment.applicationId;
      
      return paymentApplicationId === applicationId && payment.paymentType === paymentType;
    })
    
    return foundPayment
  }

  // Helper function to check if payment button should be disabled
  const shouldDisablePaymentButton = (application: Application): boolean => {
    if (application.status !== 'approved') return true
    if (!application.property?.pricing?.totalPrice || application.property.pricing.totalPrice <= 0) return true
    
    const payment = getPaymentForApplication(application.id || (application as any)._id)
    console.log('payment', payment)
    if (payment && ['pending', 'processing', 'succeeded'].includes(payment.status)) return true
    
    return false
  }

  // Helper function to get payment status text and color
  const getPaymentStatusInfo = (application: Application): { text: string; color: string; showButton: boolean } => {
    // Check if property has valid pricing
    const hasValidPricing = application.property?.pricing?.totalPrice && application.property.pricing.totalPrice > 0
    
    if (!hasValidPricing && application.status === 'approved') {
      return { text: 'Error de precio', color: 'bg-red-100 text-red-800 border-red-200', showButton: false }
    }
    
    const payment = getPaymentForApplication(application.id || (application as any)._id)
    
    if (!payment) {
      // No payment exists yet
      if (application.status === 'approved') {
        return { text: 'Listo para pagar', color: 'bg-green-100 text-green-800 border-green-200', showButton: true }
      }
      return { text: 'Esperando aprobación', color: 'bg-gray-100 text-gray-800 border-gray-200', showButton: false }
    }
    
    // Payment exists - show its status
    const statusText = paymentService.getPaymentStatusText(payment.status)
    const statusColor = paymentService.getPaymentStatusColor(payment.status)
    
    // Only show button for failed or cancelled payments (allow retry)
    // All other statuses (pending, processing, succeeded) should disable the button
    const showButton = ['failed', 'canceled'].includes(payment.status)
    
    return { text: statusText, color: statusColor, showButton }
  }

  // Load user applications and payments
  const loadApplicationsAndPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load applications and payments in parallel
      const [applicationsResponse, paymentsResponse] = await Promise.all([
        applicationService.getUserApplications(),
        paymentService.getUserPayments({ limit: 100 })
      ])
      

      
      setApplications(applicationsResponse.data.applications)
      setPayments(paymentsResponse.data.payments)
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || 'Failed to load applications')
      setApplications([])
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  // Load applications and payments on mount
  useEffect(() => {
    loadApplicationsAndPayments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "withdrawn": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "approved": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      case "withdrawn": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return t('dashboard.status.pending') || 'En revisión'
      case "approved": return t('dashboard.status.approved') || 'Aprobado'
      case "rejected": return t('dashboard.status.rejected') || 'Rechazado'
      case "withdrawn": return t('dashboard.status.withdrawn') || 'Retirado'
      default: return status
    }
  }

  const handleRemoveApplication = async (id: string) => {
    // Validate that the ID exists
    if (!id || id === 'undefined' || id.trim() === '') {
      toast({
        title: "Error",
        description: "Invalid application ID. Cannot withdraw application.",
        variant: "destructive"
      })
      return
    }

    try {
      await applicationService.withdrawApplication(id)
      setApplications(apps => apps.filter(app => app.id !== id))
      toast({
        title: "Solicitud retirada",
        description: "Tu solicitud ha sido retirada exitosamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo retirar la solicitud.",
        variant: "destructive"
      })
    }
  }

  const handleSignContract = async (id: string) => {
    console.log("Firmar contrato para:", id)
    
    try {
      // Find the application
      const application = applications.find(app => app.id === id)
      if (!application) {
        toast({
          title: "Error",
          description: "No se encontró la aplicación correspondiente.",
          variant: "destructive"
        })
        return
      }

      // Show loading state
      toast({
        title: "Creando contrato...",
        description: "Preparando el contrato para firma.",
      })

      // Create a real contract on the backend
      const occupancyDate = new Date(application.occupancyDate)
      const endDate = new Date(occupancyDate.getTime() + (application.contractDuration * 30 * 24 * 60 * 60 * 1000))
      const rentAmount = application.property?.pricing?.totalPrice || 15000
      
      const contractData = {
        propertyId: application.propertyId,
        tenantId: application.applicantId,
        startDate: occupancyDate,
        endDate: endDate,
        terms: {
          rentAmount: rentAmount,
          depositAmount: rentAmount * 2,
          paymentFrequency: 'monthly' as const,
          paymentDueDay: 1,
          utilitiesIncluded: [],
          maintenanceResponsibility: 'hoster' as const,
          petPolicy: {
            allowed: false,
            deposit: 0,
            restrictions: ''
          },
          smokingPolicy: false,
          guestPolicy: {
            allowed: true,
            maxDuration: 7,
            maxGuests: 2
          }
        },
        customFields: {
          applicationId: application.id
        }
      }

      // Create contract via API
      const createdContract = await contractService.createContract(contractData)
      
      // Set the created contract for signing
      setSelectedContract(createdContract)
      setShowContractSigningModal(true)

      toast({
        title: "Contrato creado",
        description: "El contrato está listo para ser firmado.",
      })

    } catch (error: any) {
      console.error('Error creating contract:', error)
      toast({
        title: "Error al crear contrato",
        description: error.message || "No se pudo crear el contrato. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handlePayment = (application: Application) => {
    // This function will only be called for valid applications
    // since the button will be disabled for invalid ones
    setSelectedApplication(application)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (payment: Payment) => {
    toast({
      title: "¡Pago exitoso!",
      description: "Tu pago ha sido procesado correctamente.",
    })
    // Reload applications and payments to reflect payment status
    loadApplicationsAndPayments()
    setShowPaymentModal(false)
    setSelectedApplication(null)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedApplication(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Cargando solicitudes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Error al cargar solicitudes</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <RocButton onClick={() => window.location.reload()}>
          Intentar de nuevo
        </RocButton>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold mb-2">{t('dashboard.welcome')}</h3>
        <p className="text-muted-foreground mb-4">
          {t('dashboard.subtitle')}
        </p>
        <RocButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {t('nav.inicio')}
        </RocButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="px-4 pt-6 md:px-0 md:pt-0">
        <h2 className="text-2xl font-semibold mb-2">{t('dashboard.home.title')}</h2>
        <p className="text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      <div className="grid gap-4 px-4 md:px-0 md:gap-6">
        {applications.map((application, index) => (
          <Card 
            key={index} 
            className="card-hover animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Mobile layout */}
            <div className="block md:hidden">
              <CardHeader className="pb-3">
                <div className="flex gap-3">
                  {/* Property image on the left */}
                  <div 
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => console.log("Navigate to property details:", application.propertyId)}
                  >
                    <img
                      src={application.property?.images?.[0] || application.property?.photos?.[0] || '/placeholder.svg'}
                      alt={application.property?.title || application.property?.name || 'Property'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  {/* Content on the right */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base mb-1 line-clamp-2">
                      {application.property?.title || application.property?.name || 'Property'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      ${application.property?.pricing?.totalPrice?.toLocaleString()} • {application.contractDuration} meses
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{getStatusText(application.status)}</span>
                      </Badge>
                      {application.status === 'approved' && (
                        <Badge className={`text-xs ${getPaymentStatusInfo(application).color}`}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {getPaymentStatusInfo(application).text}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col justify-between">
                    <p className="text-xs text-muted-foreground text-right">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                    {application.status === "pending" && (
                      <button
                        onClick={() => handleRemoveApplication(application.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {application.status === "approved" && (
                  <div className="gradient-section rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{t('dashboard.congratulations')}</h4>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.contractDeadline')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <RocButton 
                        className="flex-1"
                        onClick={() => handleSignContract(application.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('dashboard.signContract')}
                      </RocButton>
                      
                      {getPaymentStatusInfo(application).showButton ? (
                        <RocButton 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handlePayment(application)}
                          disabled={shouldDisablePaymentButton(application)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {t('dashboard.makePayment')}
                        </RocButton>
                      ) : (
                        <div className="flex-1 px-4 py-2 text-center text-sm text-muted-foreground bg-muted rounded-md">
                          <CreditCard className="h-4 w-4 mr-2 inline" />
                          {getPaymentStatusInfo(application).text}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {application.status === "pending" && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.pendingMessage')}
                    </p>
                  </div>
                )}

                {application.status === "rejected" && application.reviewNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Motivo del rechazo:</h4>
                    <p className="text-sm text-red-700">{application.reviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Desktop layout - similar structure but different styling */}
            <div className="hidden md:block">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div 
                    className="w-32 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => console.log("Navigate to property details:", application.propertyId)}
                  >
                    <img
                      src={application.property?.images?.[0] || application.property?.photos?.[0] || '/placeholder.svg'}
                      alt={application.property?.title || application.property?.name || 'Property'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {application.property?.title || application.property?.name || 'Property'}
                        </h3>
                        <p className="text-muted-foreground">
                          ${application.property?.pricing?.totalPrice?.toLocaleString()} • {application.contractDuration} meses
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Aplicado el {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-2">{getStatusText(application.status)}</span>
                        </Badge>
                        
                        {application.status === 'approved' && (
                          <Badge className={getPaymentStatusInfo(application).color}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {getPaymentStatusInfo(application).text}
                          </Badge>
                        )}
                        
                        {application.status === "pending" && application.id && application.id !== 'undefined' && (
                          <button
                            onClick={() => handleRemoveApplication(application.id)}
                            className="text-muted-foreground hover:text-destructive p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {application.status === "approved" && (
                      <div className="gradient-section rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{t('dashboard.congratulations')}</h4>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.contractDeadline')}
                        </p>
                        
                        <div className="flex gap-3">
                          <RocButton 
                            onClick={() => handleSignContract(application.id)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {t('dashboard.signContract')}
                          </RocButton>
                          
                          {getPaymentStatusInfo(application).showButton ? (
                            <RocButton 
                              variant="outline"
                              onClick={() => handlePayment(application)}
                              disabled={shouldDisablePaymentButton(application)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {t('dashboard.makePayment')}
                            </RocButton>
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                              <CreditCard className="h-4 w-4 mr-2 inline" />
                              {getPaymentStatusInfo(application).text}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {application.status === "rejected" && application.reviewNotes && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">Motivo del rechazo:</h4>
                        <p className="text-sm text-red-700">{application.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedApplication && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          application={selectedApplication}
          paymentType="first_month"
          amount={selectedApplication.property?.pricing?.totalPrice || 0}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {selectedContract && (
        <ContractSigningModal
          isOpen={showContractSigningModal}
          onClose={() => {
            setShowContractSigningModal(false)
            setSelectedContract(null)
          }}
          contract={selectedContract}
          onContractUpdate={(updatedContract) => {
            console.log('Contract updated:', updatedContract)
            // In a real app, you would update the applications state here
            setSelectedContract(updatedContract)
          }}
        />
      )}
    </div>
  )
}

export default HomeDashboard