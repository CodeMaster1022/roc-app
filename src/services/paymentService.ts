import { API_CONFIG, getAuthHeaders } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface PaymentData {
  applicationId: string;
  paymentType: 'deposit' | 'first_month' | 'monthly_rent' | 'security_deposit';
  amount: number;
  currency?: string;
  description?: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  tenantId: string;
  hosterId: string;
  propertyId: string;
  amount: number;
  currency: string;
  paymentType: 'deposit' | 'first_month' | 'monthly_rent' | 'security_deposit';
  stripePaymentIntentId: string;
  stripeClientSecret: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  paymentMethod?: string;
  description: string;
  dueDate?: string;
  paidAt?: string;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  application?: {
    id: string;
    contractDuration: number;
    occupancyDate: string;
    occupationType: string;
  };
  property?: {
    id: string;
    title: string;
    location: {
      address: string;
    };
    pricing: {
      totalPrice: number;
    };
    images?: string[];
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
    profile?: any;
  };
  hoster?: {
    id: string;
    name: string;
    email: string;
    profile?: any;
  };
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data: {
    payment: Payment;
    clientSecret?: string;
  };
}

export interface PaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class PaymentService {
  // Create a new payment
  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment');
    }

    return data;
  }

  // Get user's payments (tenant or hoster)
  async getUserPayments(params?: {
    status?: string;
    page?: number;
    limit?: number;
    role?: 'tenant' | 'hoster';
  }): Promise<PaymentsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);

    const url = `${API_BASE_URL}/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payments');
    }

    return data;
  }

  // Get a specific payment by ID
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment');
    }

    return data;
  }

  // Cancel a payment
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel payment');
    }

    return data;
  }

  // Helper method to get payment status display text
  getPaymentStatusText(status: Payment['status']): string {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'processing':
        return 'Processing';
      case 'succeeded':
        return 'Paid';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  }

  // Helper method to get payment status color
  getPaymentStatusColor(status: Payment['status']): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'succeeded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Helper method to get payment type display text
  getPaymentTypeText(paymentType: Payment['paymentType']): string {
    switch (paymentType) {
      case 'deposit':
        return 'Security Deposit';
      case 'first_month':
        return 'First Month Rent';
      case 'monthly_rent':
        return 'Monthly Rent';
      case 'security_deposit':
        return 'Security Deposit';
      default:
        return (paymentType as string).replace('_', ' ');
    }
  }

  // Check if payment exists for application and payment type
  async checkPaymentExists(applicationId: string, paymentType: Payment['paymentType']): Promise<Payment | null> {
    try {
      const response = await this.getUserPayments({ limit: 100 });
      const existingPayment = response.data.payments.find(payment => 
        payment.applicationId === applicationId && 
        payment.paymentType === paymentType &&
        ['pending', 'processing', 'succeeded'].includes(payment.status)
      );
      return existingPayment || null;
    } catch (error) {
      console.error('Error checking payment existence:', error);
      return null;
    }
  }
}

export const paymentService = new PaymentService(); 