import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RocButton } from "@/components/ui/roc-button"
import { zones } from "@/data/mockProperties"

interface ZoneSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onZoneSelect: (zone: string) => void
  selectedZone?: string
}

const ZoneSearchModal = ({ open, onOpenChange, onZoneSelect, selectedZone }: ZoneSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredZones = zones.filter(zone => 
    zone.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleZoneClick = (zone: string) => {
    onZoneSelect(zone)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar por zona</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar zona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredZones.map((zone) => (
              <RocButton
                key={zone}
                variant={selectedZone === zone ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleZoneClick(zone)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {zone}
              </RocButton>
            ))}
          </div>

          {selectedZone && (
            <RocButton
              variant="outline"
              className="w-full"
              onClick={() => {
                onZoneSelect("")
                onOpenChange(false)
              }}
            >
              Limpiar selección
            </RocButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ZoneSearchModal