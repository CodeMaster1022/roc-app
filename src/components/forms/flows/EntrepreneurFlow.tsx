import { useState } from "react"
import { RocButton } from "@/components/ui/roc-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { IncomeStep } from "../steps/IncomeStep"
import { KYCStep } from "../steps/KYCStep"
import type { ApplicationData } from "../RentalApplicationFlow"
import type { Property } from "@/types/unified-property"

interface EntrepreneurFlowProps {
  applicationData: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  onBack: () => void
  onComplete: () => void
  property: Property
}

export const EntrepreneurFlow = ({ applicationData, updateData, onBack, onComplete, property }: EntrepreneurFlowProps) => {
  const [currentSubStep, setCurrentSubStep] = useState(1)

  const nextSubStep = () => setCurrentSubStep(prev => prev + 1)
  const prevSubStep = () => setCurrentSubStep(prev => prev - 1)

  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Información del negocio</h2>
              <p className="text-muted-foreground">
                Compártenos algunos detalles sobre tu emprendimiento
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">¿Cuál es el nombre de tu emprendimiento/empresa?</Label>
                <Input
                  id="businessName"
                  value={applicationData.businessName || ''}
                  onChange={(e) => updateData({ businessName: e.target.value })}
                  placeholder="Nombre de tu empresa o emprendimiento"
                />
              </div>

              <div>
                <Label htmlFor="businessDescription">¿A qué se dedica tu emprendimiento?</Label>
                <Textarea
                  id="businessDescription"
                  value={applicationData.businessDescription || ''}
                  onChange={(e) => updateData({ businessDescription: e.target.value })}
                  placeholder="Describe brevemente el giro de tu negocio"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="businessWebsite">¿Tu página tiene sitio web o redes sociales?</Label>
                <Input
                  id="businessWebsite"
                  value={applicationData.businessWebsite || ''}
                  onChange={(e) => updateData({ businessWebsite: e.target.value })}
                  placeholder="www.ejemplo.com, @miempresa, etc."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <RocButton variant="outline" onClick={onBack}>
                Regresar
              </RocButton>
              <RocButton 
                onClick={nextSubStep}
                disabled={!applicationData.businessName || !applicationData.businessDescription}
              >
                Continuar
              </RocButton>
            </div>
          </div>
        )

      case 2:
        return (
          <IncomeStep
            applicationType="entrepreneur"
            incomeRange={applicationData.incomeRange}
            incomeDocuments={applicationData.incomeDocuments}
            onIncomeRangeChange={(range) => updateData({ incomeRange: range })}
            onDocumentsChange={(documents) => updateData({ incomeDocuments: documents })}
            onNext={nextSubStep}
            onBack={prevSubStep}
          />
        )

      case 3:
        return (
          <KYCStep
            applicationType="entrepreneur"
            idDocument={applicationData.idDocument}
            videoSelfie={applicationData.videoSelfie}
            idDocumentUrl={applicationData.idDocumentUrl}
            videoSelfieUrl={applicationData.videoSelfieUrl}
            onIdDocumentChange={(file, url) => updateData({ idDocument: file, idDocumentUrl: url })}
            onVideoSelfieChange={(file, url) => updateData({ videoSelfie: file, videoSelfieUrl: url })}
            onSubmit={onComplete}
            onBack={prevSubStep}
            property={property}
          />
        )

      default:
        return null
    }
  }

  return renderSubStep()
}