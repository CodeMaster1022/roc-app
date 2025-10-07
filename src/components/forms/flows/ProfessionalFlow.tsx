import { useState } from "react"
import { RocButton } from "@/components/ui/roc-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { IncomeStep } from "../steps/IncomeStep"
import { MetamapVerification, type MetamapVerificationResult } from "@/components/identity/MetamapVerification"
import type { ApplicationData } from "../RentalApplicationFlow"
import type { Property } from "@/types/unified-property"

interface ProfessionalFlowProps {
  applicationData: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  onBack: () => void
  onComplete: () => void
  property: Property
}

export const ProfessionalFlow = ({ applicationData, updateData, onBack, onComplete, property }: ProfessionalFlowProps) => {
  const [currentSubStep, setCurrentSubStep] = useState(1)

  const nextSubStep = () => setCurrentSubStep(prev => prev + 1)
  const prevSubStep = () => setCurrentSubStep(prev => prev - 1)

  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Información laboral</h2>
              <p className="text-muted-foreground">
                Compártenos algunos detalles sobre tu trabajo actual
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company">¿En qué empresa trabajas?</Label>
                <Input
                  id="company"
                  value={applicationData.company || ''}
                  onChange={(e) => updateData({ company: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div>
                <Label htmlFor="startDate">¿Cuánto tiempo llevas trabajando ahí?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <RocButton
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !applicationData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {applicationData.startDate ? (
                        format(applicationData.startDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
                      ) : (
                        <span>Fecha de inicio</span>
                      )}
                    </RocButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={applicationData.startDate || undefined}
                      onSelect={(date) => updateData({ startDate: date })}
                      disabled={(date) => date > new Date()}
                      locale={es}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="role">¿Cuál es tu puesto en la empresa?</Label>
                <Input
                  id="role"
                  value={applicationData.role || ''}
                  onChange={(e) => updateData({ role: e.target.value })}
                  placeholder="Tu puesto o rol"
                />
              </div>

              <div>
                <Label htmlFor="workEmail">Correo electrónico del trabajo</Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={applicationData.workEmail || ''}
                  onChange={(e) => updateData({ workEmail: e.target.value })}
                  placeholder="tu@empresa.com"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <RocButton variant="outline" onClick={onBack}>
                Regresar
              </RocButton>
              <RocButton 
                onClick={nextSubStep}
                disabled={!applicationData.company || !applicationData.startDate || !applicationData.role || !applicationData.workEmail}
              >
                Continuar
              </RocButton>
            </div>
          </div>
        )

      case 2:
        return (
          <IncomeStep
            applicationType="professional"
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
          <MetamapVerification
            applicationType="professional"
            onVerificationComplete={(result: MetamapVerificationResult) => {
              updateData({
                metamapVerificationId: result.verificationId,
                metamapIdentityId: result.identityId,
                metamapVerificationStatus: result.status,
                metamapVerificationData: result.metadata
              })
              onComplete()
            }}
            onBack={prevSubStep}
          />
        )

      default:
        return null
    }
  }

  return renderSubStep()
}