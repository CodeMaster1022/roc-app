import { RocButton } from "@/components/ui/roc-button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

interface ContractDurationStepProps {
  options: number[]
  selectedDuration: number | null
  onSelect: (duration: number) => void
  onNext: () => void
}

export const ContractDurationStep = ({ options, selectedDuration, onSelect, onNext }: ContractDurationStepProps) => {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('application.contract_duration')}</h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de contrato que mejor se ajuste a tus necesidades
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((months) => (
          <Card
            key={months}
            className={`cursor-pointer transition-all hover:bg-muted ${
              selectedDuration === months ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelect(months)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {months} {months === 1 ? 'mes' : 'meses'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contrato de {months} {months === 1 ? 'mes' : 'meses'}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedDuration === months 
                    ? 'bg-primary border-primary' 
                    : 'border-muted-foreground'
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <RocButton 
          onClick={onNext} 
          disabled={!selectedDuration}
          className="min-w-[120px]"
        >
          {t('continue')}
        </RocButton>
      </div>
    </div>
  )
}