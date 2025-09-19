import { RocButton } from "@/components/ui/roc-button"
import { useLanguage } from "@/contexts/LanguageContext"

interface FilterSectionProps {
  currentFilter: "ambas" | "propiedad" | "habitacion"
  onFilterChange: (filter: "ambas" | "propiedad" | "habitacion") => void
  isMobile?: boolean
}

const FilterSection = ({ 
  currentFilter, 
  onFilterChange,
  isMobile = false
}: FilterSectionProps) => {
  const { t } = useLanguage()
  
  const filterOptions = [
    { value: "ambas" as const, label: t('filter.both') },
    { value: "propiedad" as const, label: t('filter.property') },
    { value: "habitacion" as const, label: t('filter.room') }
  ]

  return (
    <div className="space-y-4">
      <div>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {filterOptions.map((option) => (
            <RocButton
              key={option.value}
              variant={currentFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(option.value)}
              className="w-full"
            >
              {option.label}
            </RocButton>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterSection