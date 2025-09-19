import { Contract, ContractPayment } from '@/types/contract';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const getContractStatusText = (status: Contract['status']): string => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'pending_signatures':
      return 'Pendiente de Firmas';
    case 'draft':
      return 'Borrador';
    case 'expired':
      return 'Expirado';
    case 'terminated':
      return 'Terminado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

export const getContractStatusColor = (status: Contract['status']): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending_signatures':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'terminated':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPaymentStatusText = (status: ContractPayment['status']): string => {
  switch (status) {
    case 'paid':
      return 'Pagado';
    case 'pending':
      return 'Pendiente';
    case 'overdue':
      return 'Vencido';
    case 'partial':
      return 'Parcial';
    default:
      return status;
  }
};

export const getPaymentStatusColor = (status: ContractPayment['status']): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'partial':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const isContractExpiringSoon = (contract: Contract, days: number = 30): boolean => {
  const today = new Date();
  const daysUntilExpiration = differenceInDays(contract.endDate, today);
  return daysUntilExpiration <= days && daysUntilExpiration > 0 && contract.status === 'active';
};

export const hasOverduePayments = (contract: Contract): boolean => {
  const today = new Date();
  return contract.payments.some(payment => 
    payment.status === 'overdue' || 
    (payment.status === 'pending' && payment.dueDate < today)
  );
};

export const getSignatureProgress = (contract: Contract): { completed: number; total: number; percentage: number } => {
  const { signatures } = contract;
  const totalSignatures = 2 + contract.guarantors.length; // tenant + hoster + guarantors
  const completedSignatures = 
    (signatures.tenantSigned ? 1 : 0) + 
    (signatures.hosterSigned ? 1 : 0) + 
    Object.values(signatures.guarantorsSigned).filter(g => g.signed).length;
  
  return {
    completed: completedSignatures,
    total: totalSignatures,
    percentage: (completedSignatures / totalSignatures) * 100
  };
};

export const getNextPaymentDue = (contract: Contract): ContractPayment | null => {
  const pendingPayments = contract.payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  return pendingPayments[0] || null;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatContractDate = (date: Date): string => {
  return format(date, 'PPP', { locale: es });
};

export const formatContractDateTime = (date: Date): string => {
  return format(date, 'PPP p', { locale: es });
};

export const getContractDuration = (startDate: Date, endDate: Date): string => {
  const days = differenceInDays(endDate, startDate);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    const remainingMonths = months % 12;
    return `${years} año${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`;
  } else if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  } else {
    return `${days} día${days > 1 ? 's' : ''}`;
  }
};

export const getPaymentFrequencyText = (frequency: 'monthly' | 'biweekly' | 'weekly'): string => {
  switch (frequency) {
    case 'monthly':
      return 'Mensual';
    case 'biweekly':
      return 'Quincenal';
    case 'weekly':
      return 'Semanal';
    default:
      return frequency;
  }
};

export const getMaintenanceResponsibilityText = (responsibility: 'tenant' | 'hoster' | 'shared'): string => {
  switch (responsibility) {
    case 'tenant':
      return 'Inquilino';
    case 'hoster':
      return 'Arrendador';
    case 'shared':
      return 'Compartida';
    default:
      return responsibility;
  }
};

export const validateContractDates = (startDate: Date, endDate: Date): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate >= endDate) {
    return 'La fecha de fin debe ser posterior a la fecha de inicio';
  }
  
  if (endDate <= today) {
    return 'La fecha de fin debe ser futura';
  }
  
  const minDuration = 30; // 30 days minimum
  const durationDays = differenceInDays(endDate, startDate);
  
  if (durationDays < minDuration) {
    return `La duración mínima del contrato debe ser de ${minDuration} días`;
  }
  
  return null;
};

export const calculateTotalContractValue = (contract: Contract): number => {
  const durationInDays = differenceInDays(contract.endDate, contract.startDate);
  const { rentAmount, paymentFrequency } = contract.terms;
  
  let paymentsPerYear: number;
  switch (paymentFrequency) {
    case 'weekly':
      paymentsPerYear = 52;
      break;
    case 'biweekly':
      paymentsPerYear = 26;
      break;
    case 'monthly':
    default:
      paymentsPerYear = 12;
      break;
  }
  
  const paymentsPerDay = paymentsPerYear / 365;
  const totalPayments = Math.ceil(durationInDays * paymentsPerDay);
  
  return totalPayments * rentAmount;
};

export default {
  getContractStatusText,
  getContractStatusColor,
  getPaymentStatusText,
  getPaymentStatusColor,
  isContractExpiringSoon,
  hasOverduePayments,
  getSignatureProgress,
  getNextPaymentDue,
  formatCurrency,
  formatContractDate,
  formatContractDateTime,
  getContractDuration,
  getPaymentFrequencyText,
  getMaintenanceResponsibilityText,
  validateContractDates,
  calculateTotalContractValue
}; 