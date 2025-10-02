import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || ' http://localhost:5000/api';

// Create axios instance with auth token
const createAuthenticatedAxios = () => {
  const token = localStorage.getItem('roc_token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export interface DashboardAnalytics {
  // Overview metrics
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  occupancyRate: number;
  
  // Financial data
  financialOverview: {
    monthlyRevenue: number;
    estimatedAnnualRevenue: number;
    averageRentPerProperty: number;
    totalRentCollected: number;
    pendingPayments: number;
    overduePayments: number;
  };
  
  // Charts data
  monthlyPerformance: Array<{
    month: string;
    applications: number;
    revenue: number;
    occupancy: number;
  }>;
  
  applicationsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  
  // Property insights
  propertyPerformance: Array<{
    id: string;
    title: string;
    location: string;
    rent: number;
    applications: number;
    approvedApplications: number;
    occupancyRate: number;
    status: string;
  }>;
  
  topProperties: Array<{
    id: string;
    title: string;
    location: string;
    rent: number;
    applications: number;
    approvedApplications: number;
    occupancyRate: number;
    status: string;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: string;
    status: string;
    propertyTitle: string;
    createdAt: string;
  }>;
  
  // Additional insights
  insights: {
    bestPerformingProperty: any;
    averageApplicationsPerProperty: number;
    approvalRate: number;
  };
}

export interface PropertyAnalytics {
  property: {
    id: string;
    title: string;
    rent: number;
    status: string;
  };
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  approvalRate: number;
  rejectionRate: number;
  monthlyApplications: Array<{
    month: string;
    applications: number;
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

class AnalyticsService {
  async getDashboardAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    period?: '6months' | '12months';
  }): Promise<DashboardAnalytics> {
    try {
      const api = createAuthenticatedAxios();
      const response = await api.get('/analytics/dashboard', { params });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard analytics');
      }
    } catch (error: any) {
      console.error('Analytics service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard analytics');
    }
  }

  async getPropertyAnalytics(propertyId: string): Promise<PropertyAnalytics> {
    try {
      const api = createAuthenticatedAxios();
      const response = await api.get(`/analytics/property/${propertyId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch property analytics');
      }
    } catch (error: any) {
      console.error('Property analytics service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch property analytics');
    }
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Helper method to format percentage
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  // Helper method to calculate growth rate
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

export const analyticsService = new AnalyticsService(); 