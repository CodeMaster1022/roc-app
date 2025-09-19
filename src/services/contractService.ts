import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { 
  Contract, 
  CreateContractRequest, 
  UpdateContractRequest, 
  ContractSearchParams, 
  ContractSearchResponse,
  ContractTemplate,
  ContractEvent,
  ContractAnalytics,
  ContractPayment,
  ContractDocument,
  ContractNotification
} from '@/types/contract';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ContractService {
  // Contract CRUD Operations
  async createContract(data: CreateContractRequest): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create contract');
    }

    return response.json();
  }

  async getContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch contract');
    }

    const contract = await response.json();
    
    // Transform date strings to Date objects
    return {
      ...contract,
      startDate: new Date(contract.startDate),
      endDate: new Date(contract.endDate),
      createdAt: new Date(contract.createdAt),
      updatedAt: new Date(contract.updatedAt),
      signedAt: contract.signedAt ? new Date(contract.signedAt) : undefined,
      activatedAt: contract.activatedAt ? new Date(contract.activatedAt) : undefined,
      terminatedAt: contract.terminatedAt ? new Date(contract.terminatedAt) : undefined,
      documents: contract.documents.map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt)
      })),
      payments: contract.payments.map((payment: any) => ({
        ...payment,
        dueDate: new Date(payment.dueDate),
        paidDate: payment.paidDate ? new Date(payment.paidDate) : undefined
      }))
    };
  }

  async updateContract(contractId: string, data: UpdateContractRequest): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update contract');
    }

    return response.json();
  }

  async deleteContract(contractId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete contract');
    }
  }

  async searchContracts(params: ContractSearchParams = {}): Promise<ContractSearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          queryParams.append(key, value.toISOString());
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/contracts?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search contracts');
    }

    const result = await response.json();
    
    // Transform date strings to Date objects
    return {
      ...result,
      contracts: result.contracts.map((contract: any) => ({
        ...contract,
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
        createdAt: new Date(contract.createdAt),
        updatedAt: new Date(contract.updatedAt),
        signedAt: contract.signedAt ? new Date(contract.signedAt) : undefined,
        activatedAt: contract.activatedAt ? new Date(contract.activatedAt) : undefined,
        terminatedAt: contract.terminatedAt ? new Date(contract.terminatedAt) : undefined,
      }))
    };
  }

  // Contract Lifecycle Operations
  async signContract(contractId: string, signatureType: 'tenant' | 'hoster' | 'guarantor', guarantorId?: string, signature?: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ signatureType, guarantorId, signature }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign contract');
    }

    return response.json();
  }

  async activateContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate contract');
    }

    return response.json();
  }

  async terminateContract(contractId: string, reason: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/terminate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to terminate contract');
    }

    return response.json();
  }

  async renewContract(contractId: string, newEndDate: Date, newTerms?: Partial<Contract['terms']>): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ 
        newEndDate: newEndDate.toISOString(),
        newTerms 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to renew contract');
    }

    return response.json();
  }

  // Payment Management
  async getContractPayments(contractId: string): Promise<ContractPayment[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/payments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payments');
    }

    const payments = await response.json();
    return payments.map((payment: any) => ({
      ...payment,
      dueDate: new Date(payment.dueDate),
      paidDate: payment.paidDate ? new Date(payment.paidDate) : undefined
    }));
  }

  async recordPayment(contractId: string, paymentData: Omit<ContractPayment, 'id'>): Promise<ContractPayment> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...paymentData,
        dueDate: paymentData.dueDate.toISOString(),
        paidDate: paymentData.paidDate?.toISOString()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to record payment');
    }

    return response.json();
  }

  async updatePayment(contractId: string, paymentId: string, updates: Partial<ContractPayment>): Promise<ContractPayment> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...updates,
        dueDate: updates.dueDate?.toISOString(),
        paidDate: updates.paidDate?.toISOString()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment');
    }

    return response.json();
  }

  // Document Management
  async uploadDocument(contractId: string, file: File, type: ContractDocument['type']): Promise<ContractDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(), // Don't set Content-Type for FormData
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }

    return response.json();
  }

  async deleteDocument(contractId: string, documentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete document');
    }
  }

  async downloadDocument(contractId: string, documentId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/documents/${documentId}/download`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download document');
    }

    return response.blob();
  }

  // Template Management
  async getContractTemplates(): Promise<ContractTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch templates');
    }

    return response.json();
  }

  async getContractTemplate(templateId: string): Promise<ContractTemplate> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/${templateId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch template');
    }

    return response.json();
  }

  // Analytics and Reporting
  async getContractAnalytics(dateFrom?: Date, dateTo?: Date): Promise<ContractAnalytics> {
    const queryParams = new URLSearchParams();
    if (dateFrom) queryParams.append('dateFrom', dateFrom.toISOString());
    if (dateTo) queryParams.append('dateTo', dateTo.toISOString());

    const response = await fetch(`${API_BASE_URL}/contracts/analytics?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return response.json();
  }

  async getContractEvents(contractId: string): Promise<ContractEvent[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/events`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch contract events');
    }

    const events = await response.json();
    return events.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
  }

  // Notifications
  async getContractNotifications(): Promise<ContractNotification[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch notifications');
    }

    const notifications = await response.json();
    return notifications.map((notification: any) => ({
      ...notification,
      scheduledFor: new Date(notification.scheduledFor),
      sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  // Utility Methods
  async generateContractPDF(contractId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/pdf`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate PDF');
    }

    return response.blob();
  }

  async validateContract(contractData: CreateContractRequest): Promise<{ valid: boolean; errors: string[] }> {
    const response = await fetch(`${API_BASE_URL}/contracts/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate contract');
    }

    return response.json();
  }
}

export const contractService = new ContractService();
export default contractService; 