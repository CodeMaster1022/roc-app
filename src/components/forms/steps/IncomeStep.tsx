import { RocButton } from "@/components/ui/roc-button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X } from "lucide-react"

interface IncomeStepProps {
  applicationType: 'student' | 'professional' | 'entrepreneur'
  paymentResponsible?: 'student' | 'guardian'
  incomeRange?: string
  incomeDocuments?: File[]
  onIncomeRangeChange: (range: string) => void
  onDocumentsChange: (documents: File[]) => void
  onNext: () => void
  onBack: () => void
}

export const IncomeStep = ({ 
  applicationType, 
  paymentResponsible,
  incomeRange, 
  incomeDocuments = [], 
  onIncomeRangeChange, 
  onDocumentsChange, 
  onNext, 
  onBack 
}: IncomeStepProps) => {
  const incomeRanges = [
    "$10,000 - $20,000",
    "$20,000 - $30,000",
    "$30,000 - $50,000", 
    "$50,000 - $80,000",
    "$80,000 - $100,000",
    "Más de $100,000"
  ]

  const getTitle = () => {
    if (applicationType === 'student' && paymentResponsible === 'guardian') {
      return 'Ingresos del tutor'
    }
    return applicationType === 'student' ? 'Tus ingresos' : 'Tus ingresos'
  }

  const getDescription = () => {
    if (applicationType === 'student' && paymentResponsible === 'guardian') {
      return 'Información sobre los ingresos del tutor que realizará los pagos'
    }
    return 'Información sobre tus ingresos mensuales'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newDocuments = [...incomeDocuments, ...files].slice(0, 3) // Máximo 3 documentos
    onDocumentsChange(newDocuments)
  }

  const removeDocument = (index: number) => {
    const newDocuments = incomeDocuments.filter((_, i) => i !== index)
    onDocumentsChange(newDocuments)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{getTitle()}</h2>
        <p className="text-muted-foreground">{getDescription()}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Rango de ingresos mensuales</Label>
          <div className="grid gap-2 mt-2">
            {incomeRanges.map((range) => (
              <Card
                key={range}
                className={`cursor-pointer transition-all hover:bg-muted ${
                  incomeRange === range ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onIncomeRangeChange(range)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{range}</span>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      incomeRange === range 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label>Comprobantes de ingresos (últimos 3 meses)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Pueden ser estados de cuenta bancarios o recibos de nómina
          </p>
          
          <div className="space-y-3">
            {incomeDocuments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <RocButton
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <X className="h-4 w-4" />
                </RocButton>
              </div>
            ))}

            {incomeDocuments.length < 3 && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label
                  htmlFor="income-documents"
                  className="text-sm font-medium cursor-pointer hover:text-primary"
                >
                  Subir comprobante de ingresos
                </Label>
                <Input
                  id="income-documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG o PNG (máx. 5MB cada uno)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <RocButton variant="outline" onClick={onBack}>
          Regresar
        </RocButton>
        <RocButton 
          onClick={onNext}
          disabled={!incomeRange || incomeDocuments.length === 0}
        >
          Continuar
        </RocButton>
      </div>
    </div>
  )
}