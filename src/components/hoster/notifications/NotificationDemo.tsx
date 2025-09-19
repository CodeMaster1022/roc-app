import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/hooks/use-toast';
import { Bell, User, Home } from 'lucide-react';

export const NotificationDemo = () => {
  const { addNotification } = useNotifications();

  const simulateNewApplication = () => {
    const applicants = [
      'Ana García', 'Carlos López', 'María Rodríguez', 'Diego Martínez', 'Sofía Hernández'
    ];
    const properties = [
      'Casa Roma Norte', 'Departamento Condesa', 'Estudio Polanco', 'Casa Santa Fe', 'Loft Centro'
    ];
    
    const applicant = applicants[Math.floor(Math.random() * applicants.length)];
    const property = properties[Math.floor(Math.random() * properties.length)];
    
    addNotification({
      type: 'tenant_application',
      title: 'Nueva aplicación de inquilino',
      message: `${applicant} ha aplicado para ${property}`,
      isRead: false,
      data: {
        applicationId: Date.now().toString(),
        applicantName: applicant,
        propertyName: property
      }
    });

    toast({
      title: "Nueva aplicación recibida",
      description: `${applicant} ha aplicado para ${property}`,
    });
  };

  const simulateStatusChange = () => {
    const properties = [
      'Casa Roma Norte', 'Departamento Condesa', 'Estudio Polanco', 'Casa Santa Fe', 'Loft Centro'
    ];
    const statuses = [
      { old: 'review', new: 'approved', message: 'ha sido aprobada' },
      { old: 'draft', new: 'review', message: 'está en revisión' },
      { old: 'review', new: 'returned', message: 'ha sido regresada' },
    ];
    
    const property = properties[Math.floor(Math.random() * properties.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    addNotification({
      type: 'property_status_change',
      title: 'Cambio de estatus de propiedad',
      message: `${property} ${status.message}`,
      isRead: false,
      data: {
        propertyId: Date.now().toString(),
        propertyName: property,
        oldStatus: status.old,
        newStatus: status.new
      }
    });

    toast({
      title: "Cambio de estatus",
      description: `${property} ${status.message}`,
    });
  };

  return (
    <div className="hidden md:flex gap-2 p-4 bg-muted/30 rounded-lg">
      <div className="text-sm text-muted-foreground mr-2">Demo:</div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={simulateNewApplication}
        className="text-xs"
      >
        <User className="w-3 h-3 mr-1" />
        Simular nueva aplicación
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={simulateStatusChange}
        className="text-xs"
      >
        <Home className="w-3 h-3 mr-1" />
        Simular cambio de estatus
      </Button>
    </div>
  );
};