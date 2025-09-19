import React from 'react'
import { Home } from 'lucide-react'
import type { Property } from '@/data/mockProperties'

interface PropertyClusterProps {
  properties: Property[]
  position: { x: number; y: number }
  onClick: () => void
  isSelected?: boolean
  size: string
}

export const PropertyCluster: React.FC<PropertyClusterProps> = ({
  properties,
  position,
  onClick,
  isSelected = false,
  size
}) => {
  const count = properties.length
  
  if (count === 1) {
    // Single property marker
    const property = properties[0]
    const color = property.type === 'propiedad' ? 'bg-blue-500' : 'bg-green-500'
    
    return (
      <div
        className={`${size} ${color} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isSelected ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
        }`}
        onClick={onClick}
      >
        <Home className="h-1/2 w-1/2 text-white" />
      </div>
    )
  }
  
  // Cluster marker
  const getClusterColor = () => {
    if (count < 5) return 'bg-orange-500'
    if (count < 10) return 'bg-red-500'
    return 'bg-purple-500'
  }
  
  const getClusterSize = () => {
    if (count < 5) return size
    if (count < 10) return size.replace('w-', 'w-').replace('h-', 'h-').replace('4', '6').replace('6', '8').replace('8', '10')
    return size.replace('w-', 'w-').replace('h-', 'h-').replace('4', '8').replace('6', '10').replace('8', '12')
  }
  
  return (
    <div
      className={`${getClusterSize()} ${getClusterColor()} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
      }`}
      onClick={onClick}
    >
      <span className="text-white font-bold text-xs">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
} 