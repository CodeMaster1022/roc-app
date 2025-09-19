export type NotificationType = 'tenant_application' | 'property_status_change' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: {
    applicationId?: string;
    propertyId?: string;
    applicantName?: string;
    propertyName?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}