import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeSelectorProps {
  selectedPeriod: '6months' | '12months';
  onPeriodChange: (period: '6months' | '12months') => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">
          {t('dashboard.analytics') || 'Analytics Dashboard'}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex space-x-1">
          <Button
            variant={selectedPeriod === '6months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('6months')}
            className="text-xs"
          >
            {t('dashboard.sixMonths') || '6 Meses'}
          </Button>
          <Button
            variant={selectedPeriod === '12months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('12months')}
            className="text-xs"
          >
            {t('dashboard.twelveMonths') || '12 Meses'}
          </Button>
        </div>
      </div>
    </div>
  );
};