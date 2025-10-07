import { API_CONFIG, getAuthHeaders } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ApplicationData {
  // Basic info
  propertyId: string;
  contractDuration: number;
  occupancyDate: string; // ISO date string
  occupationType: 'student' | 'professional' | 'entrepreneur';
  phone: string;
  
  // Student specific
  university?: string;
  universityEmail?: string;
  paymentResponsible?: 'student' | 'guardian';
  incomeSource?: string;
  incomeRange?: string;
  incomeDocuments?: string[]; // URLs to uploaded documents
  
  // Guardian info (for students)
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  guardianIncomeRange?: string;
  guardianIncomeDocuments?: string[];
  guardianIdDocument?: string;
  
  // Professional specific
  company?: string;
  workStartDate?: string; // ISO date string
  role?: string;
  workEmail?: string;
  
  // Entrepreneur specific
  businessName?: string;
  businessDescription?: string;
  businessWebsite?: string;
  
  // KYC documents (legacy)
  idDocument?: string; // URL to uploaded document
  videoSelfie?: string; // URL to uploaded video
  
  // Metamap verification
  metamapVerificationId?: string;
  metamapIdentityId?: string;
  metamapVerificationStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';
  metamapVerificationData?: any;
  metamapGuardianVerificationId?: string;
  metamapGuardianIdentityId?: string;
  metamapGuardianVerificationStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';
  metamapGuardianVerificationData?: any;
}

export interface Application {
  id: string;
  applicantId: string;
  propertyId: string;
  contractDuration: number;
  occupancyDate: string;
  occupationType: 'student' | 'professional' | 'entrepreneur';
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Property details (populated)
  property?: {
    id: string;
    title: string;
    name: string;
    location: {
      address: string;
    };
    pricing: {
      totalPrice: number;
    };
    images?: string[];
    photos?: string[];
  };
  
  // All the application data fields
  university?: string;
  universityEmail?: string;
  paymentResponsible?: 'student' | 'guardian';
  incomeSource?: string;
  incomeRange?: string;
  incomeDocuments?: string[];
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  guardianIncomeRange?: string;
  guardianIncomeDocuments?: string[];
  guardianIdDocument?: string;
  company?: string;
  workStartDate?: string;
  role?: string;
  workEmail?: string;
  businessName?: string;
  businessDescription?: string;
  businessWebsite?: string;
  idDocument?: string;
  videoSelfie?: string;
}

export interface ApplicationResponse {
  success: boolean;
  message?: string;
  data: {
    application: Application;
  };
}

export interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class ApplicationService {
  // Submit a new rental application
  async submitApplication(applicationData: ApplicationData): Promise<ApplicationResponse> {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit application');
    }

    return data;
  }

  // Get user's applications
  async getUserApplications(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/applications/my-applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch applications');
    }

    return data;
  }

  // Get a specific application by ID
  async getApplicationById(applicationId: string): Promise<ApplicationResponse> {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch application');
    }

    return data;
  }

  // Withdraw an application
  async withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
    // Validate application ID
    if (!applicationId || applicationId === 'undefined' || applicationId.trim() === '') {
      throw new Error('Invalid application ID provided');
    }

    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to withdraw application');
    }

    return data;
  }

  // Upload document (for KYC or income documents)
  async uploadDocument(file: File, type: 'id' | 'video' | 'income' | 'guardian-id'): Promise<{ success: boolean; data: { url: string } }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/applications/upload-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('roc_token')}`
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload document');
    }

    return data;
  }

  // HOSTER METHODS
  
  // Get all applications for a hoster across all their properties
  async getHosterApplications(status?: string, page?: number, limit?: number): Promise<ApplicationsResponse> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/applications/hoster${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch applications');
    }

    return data;
  }

  // Update application status (for hosters)
  async updateApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn', 
    reviewNotes?: string
  ): Promise<ApplicationResponse> {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        reviewNotes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update application status');
    }

    return data;
  }
}

export const applicationService = new ApplicationService(); 