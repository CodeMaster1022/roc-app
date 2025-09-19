export interface ContractParty {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  role: 'tenant' | 'hoster' | 'guarantor';
}

export interface ContractDocument {
  id: string;
  name: string;
  type: 'contract' | 'addendum' | 'invoice' | 'receipt' | 'inspection' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  mimeType: string;
}

export interface ContractPayment {
  id: string;
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'penalty' | 'other';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  description: string;
  reference?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  category: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'termination' | 'rules' | 'other';
  mandatory: boolean;
  customizable: boolean;
}

export interface ContractTerms {
  rentAmount: number;
  depositAmount: number;
  paymentFrequency: 'monthly' | 'biweekly' | 'weekly';
  paymentDueDay: number; // Day of month (1-31)
  lateFeeAmount?: number;
  lateFeeGracePeriod?: number; // Days
  utilitiesIncluded: string[];
  maintenanceResponsibility: 'tenant' | 'hoster' | 'shared';
  petPolicy: {
    allowed: boolean;
    deposit?: number;
    restrictions?: string;
  };
  smokingPolicy: boolean;
  guestPolicy: {
    allowed: boolean;
    maxDuration?: number; // Days
    maxGuests?: number;
  };
  renewalTerms?: {
    automatic: boolean;
    noticePeriod: number; // Days
    rentIncrease?: number; // Percentage
  };
}

export interface Contract {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  
  // Parties
  tenant: ContractParty;
  hoster: ContractParty;
  guarantors: ContractParty[];
  
  // Contract Details
  startDate: Date;
  endDate: Date;
  terms: ContractTerms;
  clauses: ContractClause[];
  
  // Status and Lifecycle
  status: 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  activatedAt?: Date;
  terminatedAt?: Date;
  terminationReason?: string;
  
  // Documents and Payments
  documents: ContractDocument[];
  payments: ContractPayment[];
  
  // Signatures
  signatures: {
    tenantSigned: boolean;
    tenantSignedAt?: Date;
    tenantSignature?: string;
    hosterSigned: boolean;
    hosterSignedAt?: Date;
    hosterSignature?: string;
    guarantorsSigned: { [guarantorId: string]: { signed: boolean; signedAt?: Date; signature?: string; } };
  };
  
  // Additional Info
  notes?: string;
  customFields?: { [key: string]: any };
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'short_term' | 'student';
  clauses: ContractClause[];
  defaultTerms: Partial<ContractTerms>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractEvent {
  id: string;
  contractId: string;
  type: 'created' | 'signed' | 'activated' | 'payment_due' | 'payment_received' | 'expired' | 'terminated' | 'renewed';
  description: string;
  timestamp: Date;
  userId: string;
  metadata?: { [key: string]: any };
}

// API Request/Response Types
export interface CreateContractRequest {
  propertyId: string;
  tenantId: string;
  guarantorIds?: string[];
  templateId?: string;
  startDate: Date;
  endDate: Date;
  terms: ContractTerms;
  clauses?: ContractClause[];
  customFields?: { [key: string]: any };
}

export interface UpdateContractRequest {
  terms?: Partial<ContractTerms>;
  clauses?: ContractClause[];
  status?: Contract['status'];
  notes?: string;
  customFields?: { [key: string]: any };
}

export interface ContractSearchParams {
  status?: Contract['status'];
  propertyId?: string;
  tenantId?: string;
  hosterId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'rentAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface ContractSearchResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Contract Analytics Types
export interface ContractAnalytics {
  totalContracts: number;
  activeContracts: number;
  expiringSoon: number; // Within 30 days
  overduePayments: number;
  totalRentCollected: number;
  averageRentAmount: number;
  occupancyRate: number;
  contractsByStatus: { [status: string]: number };
  monthlyRevenue: { month: string; amount: number }[];
}

// Notification Types for Contracts
export interface ContractNotification {
  id: string;
  contractId: string;
  type: 'payment_due' | 'payment_overdue' | 'contract_expiring' | 'contract_expired' | 'signature_required';
  title: string;
  message: string;
  recipients: string[]; // User IDs
  scheduledFor: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed';
}

export default Contract; 