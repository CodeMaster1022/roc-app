import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Home } from "lucide-react";
import buildingHero from "@/assets/building-hero.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmptyStatePrompt = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-section-contrast animate-fade-in">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-48 h-32 rounded-lg overflow-hidden">
            <img 
              src={buildingHero} 
              alt="Edificio moderno para rentas"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <Home className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">
              {t('dashboard.startEarning')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('dashboard.uploadFirst')}
            </p>
          </div>
          
          <Button variant="gradient" size="lg" className="mt-6">
            <Plus className="w-5 h-5 mr-2" />
            {t('dashboard.uploadProperty')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};