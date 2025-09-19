import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RocButton } from "@/components/ui/roc-button"

interface SortModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" }
]

const SortModal = ({ open, onOpenChange, sortBy, onSortChange }: SortModalProps) => {
  const handleSortSelect = (value: string) => {
    onSortChange(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ordenar por</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <RocButton
              key={option.value}
              variant="ghost"
              className="w-full justify-between"
              onClick={() => handleSortSelect(option.value)}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </RocButton>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SortModal