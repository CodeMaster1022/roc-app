import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
}

export const KPICard = ({ title, value, subtitle, highlight = false, className }: KPICardProps) => {
  return (
    <Card className={`animate-fade-in hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-1 md:space-y-2">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground truncate">
            {title}
          </h3>
          <div className={`text-lg md:text-3xl font-bold ${highlight ? 'text-highlight' : 'text-foreground'}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};