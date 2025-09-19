import { Calendar } from "@/components/ui/calendar"
import { RocButton } from "@/components/ui/roc-button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useLanguage } from "@/contexts/LanguageContext"

interface OccupancyDateStepProps {
  selectedDate: Date | null
  onSelect: (date: Date | undefined) => void
  onNext: () => void
  onBack: () => void
}

export const OccupancyDateStep = ({ selectedDate, onSelect, onNext, onBack }: OccupancyDateStepProps) => {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('application.occupancy_date')}</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona la fecha en la que planeas ocupar la propiedad
        </p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={onSelect}
          disabled={(date) => date < new Date()}
          locale={es}
          className="rounded-md border scale-90"
        />
      </div>

      {selectedDate && (
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Fecha seleccionada:</p>
          <p className="text-base">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <RocButton variant="outline" onClick={onBack}>
          {t('back')}
        </RocButton>
        <RocButton 
          onClick={onNext} 
          disabled={!selectedDate}
          className="min-w-[120px]"
        >
          {t('continue')}
        </RocButton>
      </div>
    </div>
  )
}