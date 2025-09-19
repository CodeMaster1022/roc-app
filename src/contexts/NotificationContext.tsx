import { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '@/types/notification';

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'tenant_application',
    title: 'Nueva aplicación de inquilino',
    message: 'María González ha aplicado para Departamento Centro',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    data: {
      applicationId: '1',
      applicantName: 'María González',
      propertyName: 'Departamento Centro'
    }
  },
  {
    id: '2',
    type: 'property_status_change',
    title: 'Cambio de estatus de propiedad',
    message: 'Casa Colonia Roma ha sido aprobada',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    data: {
      propertyId: '1',
      propertyName: 'Casa Colonia Roma',
      oldStatus: 'review',
      newStatus: 'approved'
    }
  },
  {
    id: '3',
    type: 'tenant_application',
    title: 'Nueva aplicación de inquilino',
    message: 'Roberto Silva ha aplicado para Casa Roma Norte',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    data: {
      applicationId: '2',
      applicantName: 'Roberto Silva',
      propertyName: 'Casa Roma Norte'
    }
  },
  {
    id: '4',
    type: 'property_status_change',
    title: 'Cambio de estatus de propiedad',
    message: 'Habitaciones Condesa requiere revisión',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    data: {
      propertyId: '2',
      propertyName: 'Habitaciones Condesa',
      oldStatus: 'draft',
      newStatus: 'review'
    }
  },
  {
    id: '5',
    type: 'general',
    title: 'Bienvenido a Hoster',
    message: 'Tu cuenta ha sido configurada exitosamente',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  }
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const addNotification = (newNotification: Omit<Notification, 'id' | 'createdAt'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};