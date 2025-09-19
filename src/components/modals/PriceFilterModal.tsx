import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { RocButton } from "@/components/ui/roc-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface FilterState {
  priceRange: [number, number]
  furnishing: string
  amenities: string[]
}

interface PriceFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const amenitiesList = [
  { value: "gym", label: "🏋️‍♂️ Gym" },
  { value: "ludoteca", label: "🧸 Ludoteca" },
  { value: "roof-garden", label: "🌇 Roof Garden" },
  { value: "lounge", label: "🍷 Lounge" },
  { value: "jardines", label: "🌿 Jardines" },
  { value: "alberca", label: "🏊‍♂️ Alberca" },
  { value: "sala-juntas", label: "📊 Sala de juntas" },
  { value: "yoga", label: "🧘‍♂️ Área de yoga" },
  { value: "salon-fiestas", label: "🎉 Salón de fiestas" },
  { value: "cafeteria", label: "☕ Cafetería" },
  { value: "coworking", label: "💼 Coworking" },
  { value: "salon-juegos", label: "🎮 Salón de juegos" },
  { value: "pet-friendly", label: "🐾 Pet friendly" },
  { value: "sky-bar", label: "🍸 Sky bar" },
  { value: "sauna", label: "🧖 Sauna" },
  { value: "spa", label: "💆‍♂️ Spa" },
  { value: "lavanderia", label: "🧺 Lavandería" },
  { value: "padel", label: "🎾 Cancha de pádel" },
  { value: "salon-belleza", label: "💇‍♀️ Salón de belleza" },
  { value: "basquet", label: "🏀 Cancha de básquet" },
  { value: "futbol", label: "⚽ Cancha de fútbol" },
  { value: "cine", label: "🎥 Cine privado" },
  { value: "golf", label: "⛳ Acceso directo al campo de golf" },
  { value: "jogging", label: "🏃 Zona de jogging" }
]

const PriceFilterModal = ({ open, onOpenChange, filters, onFiltersChange }: PriceFilterModalProps) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters)

  const handleApply = () => {
    onFiltersChange(tempFilters)
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultFilters: FilterState = {
      priceRange: [3000, 50000],
      furnishing: "all",
      amenities: []
    }
    setTempFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onOpenChange(false)
  }

  const handleAmenityChange = (amenityValue: string, checked: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenityValue]
        : prev.amenities.filter(a => a !== amenityValue)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Precio */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rango de precio mensual
            </label>
            <div className="px-2">
              <Slider
                value={tempFilters.priceRange}
                onValueChange={(value) => setTempFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={50000}
                min={3000}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${tempFilters.priceRange[0].toLocaleString('es-MX')}</span>
              <span>${tempFilters.priceRange[1].toLocaleString('es-MX')}</span>
            </div>
          </div>

          {/* Amueblado */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Amueblado
            </label>
            <Select 
              value={tempFilters.furnishing} 
              onValueChange={(value) => setTempFilters(prev => ({ ...prev, furnishing: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="furnished">Amueblado</SelectItem>
                <SelectItem value="semi-furnished">Semi amueblado</SelectItem>
                <SelectItem value="unfurnished">Sin amueblar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenidades */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Amenidades
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
              {amenitiesList.map((amenity) => (
                <div key={amenity.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={amenity.value}
                    checked={tempFilters.amenities.includes(amenity.value)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked as boolean)}
                  />
                  <label 
                    htmlFor={amenity.value} 
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <RocButton variant="outline" className="flex-1" onClick={handleReset}>
              Resetear
            </RocButton>
            <RocButton className="flex-1" onClick={handleApply}>
              Aplicar
            </RocButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PriceFilterModal