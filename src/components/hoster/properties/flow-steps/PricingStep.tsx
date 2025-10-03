import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RocButton } from "@/components/ui/roc-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, Calculator } from "lucide-react";
import { format } from "date-fns";
import { Property, ROOM_CHARACTERISTICS, RentalType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingStepProps {  
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PricingStep = ({ property, updateProperty, onNext, onPrev }: PricingStepProps) => {
  const { t } = useLanguage();
  const [totalPrice, setTotalPrice] = useState(property.pricing?.totalPrice || 0);
  const [rentalType, setRentalType] = useState<RentalType>(property.pricing?.rentalType || 'ambos');

  const isPropertyFlow = property.type === 'property';

  const calculateRoomPrices = (totalPrice: number) => {
    if (!property.rooms || totalPrice <= 0) return {};
    
    const totalPoints = property.rooms.reduce((sum, room) => {
      const characteristics = ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics);
      return sum + (characteristics?.points || 0);
    }, 0);

    const roomPrices: { [key: string]: number } = {};
    property.rooms.forEach(room => {
      const characteristics = ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics);
      const points = characteristics?.points || 0;
      roomPrices[room.id] = Math.round((points / totalPoints) * totalPrice);
    });

    return roomPrices;
  };

  const roomPrices = isPropertyFlow && (rentalType === 'ambos' || rentalType === 'habitaciones') 
    ? calculateRoomPrices(totalPrice) 
    : {};

  const updateRoomPrice = (roomId: string, price: number) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, price } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const updateRoomAvailability = (roomId: string, date: Date) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, availableFrom: date } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const updateRoomDeposit = (roomId: string, amount: number) => {
    const updatedRooms = property.rooms?.map(room => 
      room.id === roomId ? { ...room, depositAmount: amount } : room
    ) || [];
    
    updateProperty({ rooms: updatedRooms });
  };

  const updateTotalPrice = (price: number) => {
    setTotalPrice(price);
    updateProperty({ 
      pricing: { 
        ...property.pricing, 
        totalPrice: price,
        rentalType 
      } 
    });
  };

  const updateRentalType = (type: RentalType) => {
    setRentalType(type);
    updateProperty({ 
      pricing: { 
        ...property.pricing, 
        totalPrice,
        rentalType: type 
      } 
    });
  };

  const allRoomsPriced = property.rooms?.every(room => room.price && room.availableFrom) || false;
  const isValid = isPropertyFlow ? (totalPrice > 0 && (rentalType === 'completa' || allRoomsPriced)) : allRoomsPriced;

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {t('pricing.title').split(' ').map((word, index, array) => 
            index >= array.length - 1 ? (
              <span key={index} className="text-highlight">{word} </span>
            ) : (
              <span key={index}>{word} </span>
            )
          )}
        </h2>
        <p className="text-muted-foreground">
          {isPropertyFlow ? t('pricing.property_config') : t('pricing.room_config')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Total Price Configuration - Show for both property and rooms types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {isPropertyFlow ? t('pricing.property_setup') : t('pricing.general_setup')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  {isPropertyFlow ? t('pricing.expected_monthly_price') : t('pricing.total_expected_monthly_price')}
                </Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={totalPrice || ''}
                  onChange={(e) => updateTotalPrice(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {isPropertyFlow 
                    ? t('pricing.price_base_description')
                    : t('pricing.total_sum_description')
                  }
                </p>
              </div>

              {isPropertyFlow && (
                <div className="space-y-2">
                  <Label>{t('pricing.rental_type')}</Label>
                  <Select value={rentalType} onValueChange={updateRentalType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambos">{t('pricing.both_schemes')}</SelectItem>
                      <SelectItem value="completa">{t('pricing.full_property')}</SelectItem>
                      <SelectItem value="habitaciones">{t('pricing.by_rooms')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('pricing.rental_type_description')}
                  </p>
                </div>
              )}
            </div>

            {/* Show price calculator for both types when total price is set */}
            {totalPrice > 0 && (
              <div className="p-4 bg-section-contrast rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">
                    {isPropertyFlow ? t('pricing.recommended_room_prices') : t('pricing.suggested_distribution')}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.rooms?.map(room => {
                    const recommendedPrice = roomPrices[room.id] || 0;
                    const characteristics = ROOM_CHARACTERISTICS.find(c => c.id === room.characteristics);
                    
                    return (
                      <div key={room.id} className="flex items-center justify-between p-3 bg-background rounded">
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{characteristics?.points} {t('pricing.points')}</p>
                        </div>
                        <Badge variant="secondary">
                          ${recommendedPrice.toLocaleString()}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {isPropertyFlow 
                    ? t('pricing.use_reference_prices')
                    : t('pricing.suggested_based_characteristics')
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {(!isPropertyFlow || rentalType !== 'completa') && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('pricing.room_configuration')}</h3>
            {property.rooms?.map((room, index) => {
              const recommendedPrice = roomPrices[room.id];
              
              return (
                <Card key={room.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label>{t('pricing.monthly_price')}</Label>
                         <Input
                           type="number"
                           placeholder={recommendedPrice ? `$${recommendedPrice}` : "$0"}
                           value={room.price || ''}
                           onChange={(e) => updateRoomPrice(room.id, parseInt(e.target.value) || 0)}
                         />
                         {recommendedPrice && (
                           <p className="text-sm text-muted-foreground">
                             {t('pricing.recommended_price')}: ${recommendedPrice.toLocaleString()}
                           </p>
                         )}
                       </div>

                       <div className="space-y-2">
                         <Label>{t('pricing.available_from')}</Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full justify-start text-left font-normal">
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {room.availableFrom ? format(room.availableFrom, "PPP") : t('pricing.select_date')}
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0">
                             <Calendar
                               mode="single"
                               selected={room.availableFrom}
                               onSelect={(date) => date && updateRoomAvailability(room.id, date)}
                               initialFocus
                             />
                           </PopoverContent>
                         </Popover>
                       </div>
                     </div>

                     {/* Deposit Configuration - Only show if deposit is required */}
                     {property.contracts?.requiresDeposit && (
                       <div className="space-y-3 pt-4 border-t animate-fade-in">
                         <div className="flex items-center justify-between">
                           <Label className="font-medium">{t('pricing.deposit_amount')}</Label>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => updateRoomDeposit(room.id, room.price || 0)}
                             disabled={!room.price}
                           >
                             {t('pricing.equal_to_one_month')}
                           </Button>
                         </div>
                         <Input
                           type="number"
                           placeholder="$0"
                           value={room.depositAmount || ''}
                           onChange={(e) => updateRoomDeposit(room.id, parseInt(e.target.value) || 0)}
                         />
                         <p className="text-xs text-muted-foreground">
                           {t('pricing.deposit_description')}
                         </p>
                       </div>
                     )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev}>
          {t('pricing.previous')}
        </Button>
        <RocButton 
          variant="default" 
          onClick={onNext}
          disabled={!isValid}
        >
          {t('pricing.continue')}
        </RocButton>
      </div>
    </div>
  );
};