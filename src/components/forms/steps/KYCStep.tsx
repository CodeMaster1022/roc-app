import { RocButton } from "@/components/ui/roc-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { DocumentUpload } from "@/components/ui/document-upload"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Property } from "@/types/unified-property"

interface KYCStepProps {
  applicationType: 'student' | 'professional' | 'entrepreneur'
  paymentResponsible?: 'student' | 'guardian'
  idDocument?: File
  videoSelfie?: File
  guardianIdDocument?: File
  idDocumentUrl?: string
  videoSelfieUrl?: string
  guardianIdDocumentUrl?: string
  onIdDocumentChange: (file: File | undefined, url?: string) => void
  onVideoSelfieChange: (file: File | undefined, url?: string) => void
  onGuardianIdDocumentChange?: (file: File | undefined, url?: string) => void
  onSubmit: () => void
  onBack: () => void
  property: Property
}

export const KYCStep = ({ 
  applicationType,
  paymentResponsible,
  idDocument, 
  videoSelfie,
  guardianIdDocument,
  idDocumentUrl,
  videoSelfieUrl,
  guardianIdDocumentUrl,
  onIdDocumentChange, 
  onVideoSelfieChange,
  onGuardianIdDocumentChange,
  onSubmit, 
  onBack,
  property
}: KYCStepProps) => {
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = () => {
    toast({
      title: t('kyc.application_sent'),
      description: t('kyc.application_sent_description'),
    })
    onSubmit()
  }

  const isReadyToSubmit = () => {
    const basicRequirements = idDocument && videoSelfie
    if (applicationType === 'student' && paymentResponsible === 'guardian') {
      return basicRequirements && guardianIdDocument
    }
    return basicRequirements
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('kyc.title')}</h2>
        <p className="text-muted-foreground">
          {t('kyc.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{t('kyc.required_documents')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID del inquilino */}
          <DocumentUpload
            id="tenant-id-document"
            label={t('kyc.tenant_id_label')}
            description={t('kyc.tenant_id_description')}
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024} // 5MB
            documentType="id"
            file={idDocument}
            fileUrl={idDocumentUrl}
            onFileChange={onIdDocumentChange}
            required
          />

          {/* Video selfie */}
          <DocumentUpload
            id="video-selfie"
            label={t('kyc.video_selfie_label')}
            description={t('kyc.video_selfie_description')}
            accept="video/*"
            maxSize={10 * 1024 * 1024} // 10MB
            documentType="video"
            file={videoSelfie}
            fileUrl={videoSelfieUrl}
            onFileChange={onVideoSelfieChange}
            required
          />

          {/* ID del tutor si es estudiante con tutor */}
          {applicationType === 'student' && paymentResponsible === 'guardian' && (
            <DocumentUpload
              id="guardian-id-document"
              label={t('kyc.guardian_id_label')}
              description={t('kyc.guardian_id_description')}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024} // 5MB
              documentType="guardian-id"
              file={guardianIdDocument}
              fileUrl={guardianIdDocumentUrl}
              onFileChange={onGuardianIdDocumentChange}
              required
            />
          )}
        </CardContent>
      </Card>

      {/* Resumen de la solicitud */}
      <Card>
        <CardHeader>
          <CardTitle>{t('kyc.application_summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>{t('kyc.property')}:</strong> {property.title}</p>
            <p><strong>{t('kyc.price')}:</strong> ${property.price.toLocaleString()}/mes</p>
            <p><strong>{t('kyc.zone')}:</strong> {property.zone}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <RocButton variant="outline" onClick={onBack}>
          {t('common.back')}
        </RocButton>
        <RocButton 
          onClick={handleSubmit}
          disabled={!isReadyToSubmit()}
          className="min-w-[140px]"
        >
          {t('kyc.submit_application')}
        </RocButton>
      </div>
    </div>
  )
}