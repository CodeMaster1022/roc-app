import { RocButton } from "@/components/ui/roc-button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Briefcase, Lightbulb } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface OccupationTypeStepProps {
  selectedType: 'student' | 'professional' | 'entrepreneur' | null
  onSelect: (type: 'student' | 'professional' | 'entrepreneur') => void
  onNext: () => void
  onBack: () => void
}

export const OccupationTypeStep = ({ selectedType, onSelect, onNext, onBack }: OccupationTypeStepProps) => {
  const { t } = useLanguage()
  
  const options = [
    {
      id: 'professional' as const,
      title: t('application.professional'),
      description: 'Trabajo en una empresa o institución',
      icon: Briefcase
    },
    {
      id: 'entrepreneur' as const,
      title: t('application.entrepreneur'),
      description: 'Tengo mi propio negocio o empresa',
      icon: Lightbulb
    },
    {
      id: 'student' as const,
      title: t('application.student'),
      description: 'Estoy estudiando en una universidad',
      icon: GraduationCap
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('application.occupation_type')}</h2>
        <p className="text-muted-foreground">
          Selecciona la opción que mejor describe tu situación actual
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all hover:bg-muted ${
                selectedType === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelect(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    selectedType === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedType === option.id 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground'
                  }`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between">
        <RocButton variant="outline" onClick={onBack}>
          {t('back')}
        </RocButton>
        <RocButton 
          onClick={onNext} 
          disabled={!selectedType}
          className="min-w-[120px]"
        >
          {t('continue')}
        </RocButton>
      </div>
    </div>
  )
}