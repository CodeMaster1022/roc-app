import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';

interface MapboxMapProps {
  address: string;
  onLocationChange: (address: string, lat: number, lng: number) => void;
  onConfirm?: () => void;
  className?: string;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  address,
  onLocationChange,
  onConfirm,
  className = ""
}) => {
  const [currentAddress, setCurrentAddress] = useState(address);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 }); // Percentage position

  const handleAddressChange = (newAddress: string) => {
    setCurrentAddress(newAddress);
    onLocationChange(newAddress, 19.4326, -99.1332);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPinPosition({ x, y });
    onLocationChange(currentAddress, 19.4326 + (y - 50) * 0.01, -99.1332 + (x - 50) * 0.01);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address-input">Dirección</Label>
        <Input
          id="address-input"
          value={currentAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Escribe la dirección..."
        />
        <p className="text-xs text-muted-foreground">
          Haz clic en el mapa para ajustar la ubicación del pin
        </p>
      </div>
      
      {/* Mock Map */}
      <div 
        className="relative w-full h-80 rounded-lg border bg-gradient-to-br from-green-100 to-green-200 cursor-crosshair overflow-hidden"
        onClick={handleMapClick}
        style={{ minHeight: '320px' }}
      >
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-green-600">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Mock Streets */}
        <div className="absolute inset-0">
          <div className="absolute bg-gray-300 opacity-60" style={{
            top: '30%', left: '0%', width: '100%', height: '8px'
          }} />
          <div className="absolute bg-gray-300 opacity-60" style={{
            top: '60%', left: '0%', width: '100%', height: '8px'
          }} />
          <div className="absolute bg-gray-300 opacity-60" style={{
            top: '0%', left: '25%', width: '8px', height: '100%'
          }} />
          <div className="absolute bg-gray-300 opacity-60" style={{
            top: '0%', left: '70%', width: '8px', height: '100%'
          }} />
        </div>

        {/* Mock Buildings */}
        <div className="absolute bg-gray-400 opacity-40 rounded" style={{
          top: '20%', left: '15%', width: '60px', height: '40px'
        }} />
        <div className="absolute bg-gray-400 opacity-40 rounded" style={{
          top: '40%', left: '30%', width: '80px', height: '50px'
        }} />
        <div className="absolute bg-gray-400 opacity-40 rounded" style={{
          top: '15%', left: '60%', width: '70px', height: '35px'
        }} />
        <div className="absolute bg-gray-400 opacity-40 rounded" style={{
          top: '70%', left: '40%', width: '90px', height: '60px'
        }} />

        {/* Location Pin */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 hover:scale-110"
          style={{
            left: `${pinPosition.x}%`,
            top: `${pinPosition.y}%`
          }}
        >
          <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
        </div>

        {/* Navigation Controls Mock */}
        <div className="absolute top-4 right-4 bg-white rounded shadow-lg p-2 space-y-1">
          <button className="block w-6 h-6 text-gray-600 hover:text-gray-800 text-xs font-bold">+</button>
          <button className="block w-6 h-6 text-gray-600 hover:text-gray-800 text-xs font-bold">−</button>
          <Navigation className="w-4 h-4 text-gray-600 mt-1" />
        </div>

        {/* Address Confirmation */}
        {currentAddress && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium text-sm">{currentAddress}</p>
                <p className="text-xs text-muted-foreground">Ciudad de México, México</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {onConfirm && (
        <Button onClick={onConfirm} className="w-full" variant="default">
          Confirmar ubicación
        </Button>
      )}
    </div>
  );
};