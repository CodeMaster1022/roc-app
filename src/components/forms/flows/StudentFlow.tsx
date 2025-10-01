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

interface StudentFlowProps {
  applicationData: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  onBack: () => void
  onComplete: () => void
  property: Property
}

export const StudentFlow = ({ applicationData, updateData, onBack, onComplete, property }: StudentFlowProps) => {
  const [currentSubStep, setCurrentSubStep] = useState(1)

  const nextSubStep = () => setCurrentSubStep(prev => prev + 1)
  const prevSubStep = () => setCurrentSubStep(prev => prev - 1)

  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Información universitaria</h2>
              <p className="text-muted-foreground">
                Compártenos algunos detalles sobre tu universidad
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="university">¿A qué universidad asistes?</Label>
                <Input
                  id="university"
                  value={applicationData.university || ''}
                  onChange={(e) => updateData({ university: e.target.value })}
                  placeholder="Escribe el nombre de tu universidad"
                />
              </div>

              <div>
                <Label htmlFor="universityEmail">Correo electrónico universitario</Label>
                <Input
                  id="universityEmail"
                  type="email"
                  value={applicationData.universityEmail || ''}
                  onChange={(e) => updateData({ universityEmail: e.target.value })}
                  placeholder="tu@universidad.edu.mx"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <RocButton variant="outline" onClick={onBack}>
                Regresar
              </RocButton>
              <RocButton 
                onClick={nextSubStep}
                disabled={!applicationData.university || !applicationData.universityEmail}
              >
                Continuar
              </RocButton>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Responsable de pagos</h2>
              <p className="text-muted-foreground">
                ¿Quién se encargará de realizar los pagos mensuales?
              </p>
            </div>

            <div className="grid gap-3">
              {[
                { id: 'student', title: 'Yo haré los pagos', description: 'Tengo ingresos propios para cubrir la renta' },
                { id: 'guardian', title: 'Un tutor hará los pagos', description: 'Un familiar o tutor se encargará de los pagos' }
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:bg-muted ${
                    applicationData.paymentResponsible === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateData({ paymentResponsible: option.id as 'student' | 'guardian' })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.title}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        applicationData.paymentResponsible === option.id 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <RocButton variant="outline" onClick={prevSubStep}>
                Regresar
              </RocButton>
              <RocButton 
                onClick={nextSubStep}
                disabled={!applicationData.paymentResponsible}
              >
                Continuar
              </RocButton>
            </div>
          </div>
        )

      case 3:
        if (applicationData.paymentResponsible === 'student') {
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Información de ingresos</h2>
                <p className="text-muted-foreground">
                  Cuéntanos sobre tus fuentes de ingresos
                </p>
              </div>

              <div>
                <Label htmlFor="incomeSource">¿De dónde obtienes tus ingresos?</Label>
                <Textarea
                  id="incomeSource"
                  value={applicationData.incomeSource || ''}
                  onChange={(e) => updateData({ incomeSource: e.target.value })}
                  placeholder="Describe brevemente de dónde obtienes tus ingresos"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <RocButton variant="outline" onClick={prevSubStep}>
                  Regresar
                </RocButton>
                <RocButton 
                  onClick={nextSubStep}
                  disabled={!applicationData.incomeSource}
                >
                  Continuar
                </RocButton>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Información del tutor</h2>
                <p className="text-muted-foreground">
                  Proporciona los datos de la persona que se encargará de los pagos
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="guardianName">Nombre del tutor</Label>
                  <Input
                    id="guardianName"
                    value={applicationData.guardianName || ''}
                    onChange={(e) => updateData({ guardianName: e.target.value })}
                    placeholder="Nombre completo del tutor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardianPhone">Teléfono</Label>
                    <Input
                      id="guardianPhone"
                      value={applicationData.guardianPhone || ''}
                      onChange={(e) => updateData({ guardianPhone: e.target.value })}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianEmail">Correo electrónico</Label>
                    <Input
                      id="guardianEmail"
                      type="email"
                      value={applicationData.guardianEmail || ''}
                      onChange={(e) => updateData({ guardianEmail: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relationship">Parentesco</Label>
                  <Select 
                    value={applicationData.guardianRelationship || ''} 
                    onValueChange={(value) => updateData({ guardianRelationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padre">Padre</SelectItem>
                      <SelectItem value="madre">Madre</SelectItem>
                      <SelectItem value="tio">Tío/Tía</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <RocButton variant="outline" onClick={prevSubStep}>
                  Regresar
                </RocButton>
                <RocButton 
                  onClick={nextSubStep}
                  disabled={!applicationData.guardianName || !applicationData.guardianPhone || !applicationData.guardianEmail || !applicationData.guardianRelationship}
                >
                  Continuar
                </RocButton>
              </div>
            </div>
          )
        }

      case 4:
        return (
          <IncomeStep
            applicationType="student"
            paymentResponsible={applicationData.paymentResponsible!}
            incomeRange={applicationData.paymentResponsible === 'student' ? applicationData.incomeRange : applicationData.guardianIncomeRange}
            incomeDocuments={applicationData.paymentResponsible === 'student' ? applicationData.incomeDocuments : applicationData.guardianIncomeDocuments}
            onIncomeRangeChange={(range) => {
              if (applicationData.paymentResponsible === 'student') {
                updateData({ incomeRange: range })
              } else {
                updateData({ guardianIncomeRange: range })
              }
            }}
            onDocumentsChange={(documents) => {
              if (applicationData.paymentResponsible === 'student') {
                updateData({ incomeDocuments: documents })
              } else {
                updateData({ guardianIncomeDocuments: documents })
              }
            }}
            onNext={nextSubStep}
            onBack={prevSubStep}
          />
        )

      case 5:
        return (
          <KYCStep
            applicationType="student"
            paymentResponsible={applicationData.paymentResponsible!}
            idDocument={applicationData.idDocument}
            videoSelfie={applicationData.videoSelfie}
            guardianIdDocument={applicationData.guardianIdDocument}
            idDocumentUrl={applicationData.idDocumentUrl}
            videoSelfieUrl={applicationData.videoSelfieUrl}
            guardianIdDocumentUrl={applicationData.guardianIdDocumentUrl}
            onIdDocumentChange={(file, url) => updateData({ idDocument: file, idDocumentUrl: url })}
            onVideoSelfieChange={(file, url) => updateData({ videoSelfie: file, videoSelfieUrl: url })}
            onGuardianIdDocumentChange={(file, url) => updateData({ guardianIdDocument: file, guardianIdDocumentUrl: url })}
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