import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Home, Car, Bath, Users, Shield, PawPrint, Cigarette, Calendar } from "lucide-react";
import { Property } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdditionalInfoStepProps {
  property: Partial<Property>;
  updateProperty: (updates: Partial<Property>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AdditionalInfoStep = ({ property, updateProperty, onNext, onPrev }: AdditionalInfoStepProps) => {
  const { t } = useLanguage();
  const [info, setInfo] = useState({
    area: property.additionalInfo?.area || 0,
    parking: property.additionalInfo?.parking || 0,
    bathrooms: property.additionalInfo?.bathrooms || 0
  });

  const [roommates, setRoommates] = useState(0); // For rooms type
  const [houseRules, setHouseRules] = useState({
    pets: property.details?.advancedConfig?.rules?.pets || false,
    smoking: property.details?.advancedConfig?.rules?.smoking || false,
    parties: property.details?.advancedConfig?.rules?.smoking || false, // Assuming parties is similar to smoking
    meetings: {
      allowed: property.details?.advancedConfig?.rules?.meetings?.allowed || false,
      schedule: property.details?.advancedConfig?.rules?.meetings?.schedule || ''
    }
  });

  const updateInfo = (field: keyof typeof info, value: number) => {
    const newInfo = { ...info, [field]: value };
    setInfo(newInfo);
    updateProperty({ additionalInfo: newInfo });
  };

  const updateHouseRules = (updates: Partial<typeof houseRules>) => {
    const newRules = { ...houseRules, ...updates };
    setHouseRules(newRules);
    
    updateProperty({
      details: {
        ...property.details,
        advancedConfig: {
          ...property.details?.advancedConfig,
          enabled: true,
          rules: newRules,
          environment: property.details?.advancedConfig?.environment || { title: '', description: '' }
        }
      }
    });
  };

  const handleNext = () => {
    if (info.area > 0) {
      onNext();
    }
  };

  const isValid = info.area > 0;
  const isRoomsType = property.type === 'rooms';

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-highlight">{t('propertyFlow.additional_info') || 'Información Adicional'}</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('propertyFlow.additional_info_desc') || 'Completa los detalles de tu propiedad'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              {t('propertyFlow.property_details') || 'Detalles de la propiedad'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t('propertyFlow.square_meters') || 'Metros cuadrados'}
                </Label>
                <Input
                  type="number"
                  placeholder="m²"
                  value={info.area || ''}
                  onChange={(e) => updateInfo('area', parseInt(e.target.value) || 0)}
                  className="text-center"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  {t('propertyFlow.parking_spaces') || 'Estacionamientos'}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={info.parking || ''}
                  onChange={(e) => updateInfo('parking', parseInt(e.target.value) || 0)}
                  className="text-center"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  {t('propertyFlow.total_bathrooms') || 'Baños totales'}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={info.bathrooms || ''}
                  onChange={(e) => updateInfo('bathrooms', parseInt(e.target.value) || 0)}
                  className="text-center"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  {t('propertyFlow.bathrooms_note') || '(Incluyendo los de las habitaciones)'}
                </p>
              </div>
            </div>

            {/* Roommates count for rooms type */}
            {isRoomsType && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('propertyFlow.max_roommates') || 'Número máximo de compañeros de cuarto'}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={roommates || ''}
                  onChange={(e) => setRoommates(parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  {t('propertyFlow.roommates_note') || 'Total de personas que pueden vivir en la propiedad'}
                </p>
              </div>
            )}

            {isValid && (
              <div className="p-4 bg-muted/50 rounded-lg animate-fade-in">
                <div className={`grid gap-4 text-center ${isRoomsType ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.area}</p>
                    <p className="text-sm text-muted-foreground">m²</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.parking}</p>
                    <p className="text-sm text-muted-foreground">{t('propertyFlow.parking') || 'Estacionamientos'}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{info.bathrooms}</p>
                    <p className="text-sm text-muted-foreground">{t('propertyFlow.bathrooms') || 'Baños'}</p>
                  </div>
                  {isRoomsType && (
                    <div>
                      <p className="text-2xl font-bold text-primary">{roommates}</p>
                      <p className="text-sm text-muted-foreground">{t('propertyFlow.roommates') || 'Compañeros'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* House Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('propertyFlow.house_rules') || 'Reglas de la casa'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="pets"
                  checked={houseRules.pets}
                  onCheckedChange={(checked) => updateHouseRules({ pets: checked as boolean })}
                />
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="pets" className="cursor-pointer">
                    {t('propertyFlow.pets_allowed') || 'Se permiten mascotas'}
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="smoking"
                  checked={houseRules.smoking}
                  onCheckedChange={(checked) => updateHouseRules({ smoking: checked as boolean })}
                />
                <div className="flex items-center gap-2">
                  <Cigarette className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="smoking" className="cursor-pointer">
                    {t('propertyFlow.smoking_allowed') || 'Se permite fumar'}
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="parties"
                  checked={houseRules.parties}
                  onCheckedChange={(checked) => updateHouseRules({ parties: checked as boolean })}
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="parties" className="cursor-pointer">
                    {t('propertyFlow.parties_allowed') || 'Se permiten fiestas'}
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="meetings"
                  checked={houseRules.meetings.allowed}
                  onCheckedChange={(checked) => updateHouseRules({ 
                    meetings: { ...houseRules.meetings, allowed: checked as boolean }
                  })}
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="meetings" className="cursor-pointer">
                    {t('propertyFlow.meetings_allowed') || 'Se permiten reuniones de trabajo'}
                  </Label>
                </div>
              </div>
            </div>

            {houseRules.meetings.allowed && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="meeting-schedule">
                  {t('propertyFlow.meeting_schedule') || 'Horario permitido para reuniones'}
                </Label>
                <Textarea
                  id="meeting-schedule"
                  placeholder="Ej: Lunes a viernes de 9:00 AM a 6:00 PM"
                  value={houseRules.meetings.schedule}
                  onChange={(e) => updateHouseRules({ 
                    meetings: { ...houseRules.meetings, schedule: e.target.value }
                  })}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Rules Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{t('propertyFlow.rules_summary') || 'Resumen de reglas'}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {houseRules.pets ? '✅' : '❌'} {t('propertyFlow.pets') || 'Mascotas'}</p>
                <p>• {houseRules.smoking ? '✅' : '❌'} {t('propertyFlow.smoking') || 'Fumar'}</p>
                <p>• {houseRules.parties ? '✅' : '❌'} {t('propertyFlow.parties') || 'Fiestas'}</p>
                <p>• {houseRules.meetings.allowed ? '✅' : '❌'} {t('propertyFlow.work_meetings') || 'Reuniones de trabajo'}</p>
                {houseRules.meetings.allowed && houseRules.meetings.schedule && (
                  <p className="ml-4 text-xs">📅 {houseRules.meetings.schedule}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev} className="order-2 sm:order-1">
          {t('propertyFlow.previous') || 'Anterior'}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="order-1 sm:order-2"
        >
          {t('propertyFlow.continue') || 'Continuar'}
        </Button>
      </div>
    </div>
  );
};