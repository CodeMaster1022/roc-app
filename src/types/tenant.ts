export type TenantType = 'professional' | 'entrepreneur' | 'student';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentBy = 'student' | 'guardian';
export type IncomeRange = 'less-than-10k' | '10k-25k' | '25k-50k' | '50k-100k' | 'more-than-100k';

export interface GuardianInfo {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  incomeRange: IncomeRange;
  incomeDocuments: string[];
  idDocument: string;
}

export interface StudentApplication {
  type: 'student';
  university: string;
  universityEmail: string;
  paymentBy: PaymentBy;
  incomeSource?: string;
  incomeRange?: IncomeRange;
  incomeDocuments?: string[];
  guardian?: GuardianInfo;
}

export interface ProfessionalApplication {
  type: 'professional';
  company: string;
  startDate: Date;
  role: string;
  workEmail: string;
  incomeRange: IncomeRange;
  incomeDocuments: string[];
}

export interface EntrepreneurApplication {
  type: 'entrepreneur';
  ventureName: string;
  ventureDescription: string;
  websiteOrSocial: string;
  incomeRange: IncomeRange;
  incomeDocuments: string[];
}

export interface KYCInfo {
  idDocument: string;
  videoSelfie: string;
}

export interface TenantApplication {
  id: string;
  propertyId: string;
  propertyName: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  contractDuration: string;
  moveInDate: Date;
  tenantType: TenantType;
  applicationData: StudentApplication | ProfessionalApplication | EntrepreneurApplication;
  kyc: KYCInfo;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}