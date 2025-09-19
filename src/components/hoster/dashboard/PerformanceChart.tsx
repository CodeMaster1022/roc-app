import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface PerformanceChartProps {
  data: Array<{
    month: string;
    applications: number;
    revenue: number;
    occupancy: number;
  }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">
          {t('dashboard.performanceByTime') || 'Rendimiento por Tiempo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue') {
                  return [`$${Number(value).toLocaleString()}`, 'Ingresos'];
                }
                if (name === 'occupancy') {
                  return [`${value}%`, 'Ocupación'];
                }
                return [value, 'Solicitudes'];
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="applications" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              name="applications"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="occupancy" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--secondary))" }}
              name="occupancy"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};