import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RocButton } from "@/components/ui/roc-button"
import { ContractDurationStep } from "./steps/ContractDurationStep"
import { OccupancyDateStep } from "./steps/OccupancyDateStep"
import { OccupationTypeStep } from "./steps/OccupationTypeStep"
import { ContactInfoStep } from "./steps/ContactInfoStep"
import { StudentFlow } from "./flows/StudentFlow"
import { ProfessionalFlow } from "./flows/ProfessionalFlow"
import { EntrepreneurFlow } from "./flows/EntrepreneurFlow"
import type { Property } from "@/types/unified-property"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { applicationService, type ApplicationData as BackendApplicationData } from "@/services/applicationService"
import AuthPromptModal from "@/components/modals/AuthPromptModal"
import React from "react"

export interface ApplicationData {
  // Basic info
  contractDuration: number | null
  occupancyDate: Date | null
  occupationType: 'student' | 'professional' | 'entrepreneur' | null
  phone?: string
  
  // Student specific
  university?: string
  universityEmail?: string
  paymentResponsible?: 'student' | 'guardian'
  incomeSource?: string
  incomeRange?: string
  incomeDocuments?: File[]
  
  // Guardian info (for students)
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  guardianRelationship?: string
  guardianIncomeRange?: string
  guardianIncomeDocuments?: File[]
  
  // Professional specific
  company?: string
  startDate?: Date
  role?: string
  workEmail?: string
  
  // Entrepreneur specific
  businessName?: string
  businessDescription?: string
  businessWebsite?: string
  
  // KYC documents
  idDocument?: File
  videoSelfie?: File
  guardianIdDocument?: File
  
  // Document URLs (after upload)
  idDocumentUrl?: string
  videoSelfieUrl?: string
  guardianIdDocumentUrl?: string
}

interface RentalApplicationFlowProps {
  isOpen: boolean
  onClose: () => void
  property: Property
}

export const RentalApplicationFlow = ({ isOpen, onClose, property }: RentalApplicationFlowProps) => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    contractDuration: null,
    occupancyDate: null,
    occupationType: null,
    phone: (user?.profile?.phone && user.profile.phone !== 'N/A') ? user.profile.phone : ''
  })

  // Show auth prompt if not authenticated when trying to apply
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      onClose()
      setShowAuthPrompt(true)
    }
  }, [isOpen, isAuthenticated, onClose])

  const handleAuthPromptLogin = () => {
    setShowAuthPrompt(false)
    navigate('/signin')
  }

  const handleAuthPromptClose = () => {
    setShowAuthPrompt(false)
  }

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1))
  
  // Check if we need to collect phone number
  const needsPhoneNumber = !applicationData.phone || applicationData.phone.trim() === ''
  const totalSteps = needsPhoneNumber ? 5 : 4

  const handleClose = () => {
    setCurrentStep(1)
    setApplicationData({
      contractDuration: null,
      occupancyDate: null,
      occupationType: null,
      phone: (user?.profile?.phone && user.profile.phone !== 'N/A') ? user.profile.phone : ''
    })
    onClose()
  }

  // Convert frontend ApplicationData to backend format
  const convertToBackendFormat = async (data: ApplicationData): Promise<BackendApplicationData> => {
    if (!data.contractDuration || !data.occupancyDate || !data.occupationType) {
      throw new Error('Missing required application data')
    }

    // Validate phone number
    const phoneValue = data.phone || user?.profile?.phone || ''
    if (!phoneValue || phoneValue === 'N/A' || phoneValue.trim() === '') {
      throw new Error('Phone number is required for application submission')
    }

    // Upload files and get URLs
    const uploadedFiles: Record<string, string> = {}
    const uploadPromises: Promise<void>[] = []

    // Upload KYC documents
    if (data.idDocument) {
      uploadPromises.push(
        applicationService.uploadDocument(data.idDocument, 'id')
          .then(response => {
            uploadedFiles.idDocument = response.data.url
          })
          .catch(error => {
            console.error('Failed to upload ID document:', error)
            throw new Error('Failed to upload ID document')
          })
      )
    }

    if (data.videoSelfie) {
      uploadPromises.push(
        applicationService.uploadDocument(data.videoSelfie, 'video')
          .then(response => {
            uploadedFiles.videoSelfie = response.data.url
          })
          .catch(error => {
            console.error('Failed to upload video selfie:', error)
            throw new Error('Failed to upload video selfie')
          })
      )
    }

    if (data.guardianIdDocument) {
      uploadPromises.push(
        applicationService.uploadDocument(data.guardianIdDocument, 'guardian-id')
          .then(response => {
            uploadedFiles.guardianIdDocument = response.data.url
          })
          .catch(error => {
            console.error('Failed to upload guardian ID document:', error)
            throw new Error('Failed to upload guardian ID document')
          })
      )
    }

    // Upload income documents
    const incomeDocumentUrls: string[] = []
    if (data.incomeDocuments && data.incomeDocuments.length > 0) {
      for (const doc of data.incomeDocuments) {
        uploadPromises.push(
          applicationService.uploadDocument(doc, 'income')
            .then(response => {
              incomeDocumentUrls.push(response.data.url)
            })
            .catch(error => {
              console.error('Failed to upload income document:', error)
              throw new Error(`Failed to upload income document: ${doc.name}`)
            })
        )
      }
    }

    // Upload guardian income documents
    const guardianIncomeDocumentUrls: string[] = []
    if (data.guardianIncomeDocuments && data.guardianIncomeDocuments.length > 0) {
      for (const doc of data.guardianIncomeDocuments) {
        uploadPromises.push(
          applicationService.uploadDocument(doc, 'income')
            .then(response => {
              guardianIncomeDocumentUrls.push(response.data.url)
            })
            .catch(error => {
              console.error('Failed to upload guardian income document:', error)
              throw new Error(`Failed to upload guardian income document: ${doc.name}`)
            })
        )
      }
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises)
    }

    return {
      propertyId: property.id,
      contractDuration: data.contractDuration,
      occupancyDate: data.occupancyDate.toISOString(),
      occupationType: data.occupationType,
      phone: phoneValue.trim(),
      
      // Student fields
      university: data.university,
      universityEmail: data.universityEmail,
      paymentResponsible: data.paymentResponsible,
      incomeSource: data.incomeSource,
      incomeRange: data.incomeRange,
      incomeDocuments: incomeDocumentUrls,
      
      // Guardian fields
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      guardianRelationship: data.guardianRelationship,
      guardianIncomeRange: data.guardianIncomeRange,
      guardianIncomeDocuments: guardianIncomeDocumentUrls,
      
      // Professional fields
      company: data.company,
      workStartDate: data.startDate?.toISOString(),
      role: data.role,
      workEmail: data.workEmail,
      
      // Entrepreneur fields
      businessName: data.businessName,
      businessDescription: data.businessDescription,
      businessWebsite: data.businessWebsite,
      
      // KYC documents (URLs after upload)
      idDocument: data.idDocumentUrl || uploadedFiles.idDocument,
      videoSelfie: data.videoSelfieUrl || uploadedFiles.videoSelfie,
      guardianIdDocument: data.guardianIdDocumentUrl || uploadedFiles.guardianIdDocument
    }
  }

  const handleSubmitApplication = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Show uploading message
      toast({
        title: "Uploading Documents",
        description: "Please wait while we upload your documents...",
      })
      
      const backendData = await convertToBackendFormat(applicationData)
      
      // Show submitting message
      toast({
        title: "Submitting Application",
        description: "Finalizing your rental application...",
      })
      
      const response = await applicationService.submitApplication(backendData)
      
      toast({
        title: "Application Submitted!",
        description: "Your rental application has been submitted successfully. You'll receive an update soon.",
      })
      
      handleClose()
    } catch (error: any) {
      console.error('Application submission error:', error)
      
      let errorMessage = "Failed to submit application. Please try again."
      
      // Provide more specific error messages
      if (error.message?.includes('upload')) {
        errorMessage = "Failed to upload documents. Please check your files and try again."
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get contract options from property configuration, fallback to default if not set
  const contractOptions = React.useMemo(() => {
    // Check if property has contracts configuration
    if (property.contracts?.standardOptions?.length) {
      const options = property.contracts.standardOptions
        .map(option => parseInt(option, 10))
        .filter(option => !isNaN(option) && option > 0)
        .sort((a, b) => a - b);
      
      if (options.length > 0) {
        return options;
      }
    }
    
    // Fallback to default options
    return [3, 6, 12];
  }, [property.contracts?.standardOptions]);

  // Debug logging
  console.log('🔍 Contract options debug:', {
    propertyContracts: property.contracts,
    standardOptions: property.contracts?.standardOptions,
    finalOptions: contractOptions
  });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContractDurationStep
            options={contractOptions}
            selectedDuration={applicationData.contractDuration}
            onSelect={(duration) => updateApplicationData({ contractDuration: duration })}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <OccupancyDateStep
            selectedDate={applicationData.occupancyDate}
            onSelect={(date) => updateApplicationData({ occupancyDate: date })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <OccupationTypeStep
            selectedType={applicationData.occupationType}
            onSelect={(type) => updateApplicationData({ occupationType: type })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        // Show phone collection step if needed
        if (needsPhoneNumber) {
          return (
            <ContactInfoStep
              phone={applicationData.phone || ''}
              onPhoneChange={(phone) => updateApplicationData({ phone })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )
        }
        // Fall through to occupation-specific flow if phone is already available
        return renderOccupationFlow()
      case 5:
        // Only render occupation flow if we're at step 5 (after phone collection)
        return renderOccupationFlow()
      default:
        return null
    }
  }

  const renderOccupationFlow = () => {
    // Render specific flow based on occupation type
    switch (applicationData.occupationType) {
      case 'student':
        return (
          <StudentFlow
            applicationData={applicationData}
            updateData={updateApplicationData}
            onBack={prevStep}
            onComplete={handleSubmitApplication}
            property={property}
          />
        )
      case 'professional':
        return (
          <ProfessionalFlow
            applicationData={applicationData}
            updateData={updateApplicationData}
            onBack={prevStep}
            onComplete={handleSubmitApplication}
            property={property}
          />
        )
      case 'entrepreneur':
        return (
          <EntrepreneurFlow
            applicationData={applicationData}
            updateData={updateApplicationData}
            onBack={prevStep}
            onComplete={handleSubmitApplication}
            property={property}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('apply_to_rent')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            {/* Property info */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold">{property.title}</h3>
              <p className="text-sm text-muted-foreground">
                ${property.price.toLocaleString()}{t('units.month')} • {property.zone}
              </p>
            </div>

            {/* Current step content */}
            {renderStep()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={handleAuthPromptClose}
        onLogin={handleAuthPromptLogin}
        title="Ready to Apply?"
        description={`You're about to apply for ${property.title}. Please sign in to continue with your rental application.`}
        actionText="Sign In to Apply"
      />
    </>
  )
}