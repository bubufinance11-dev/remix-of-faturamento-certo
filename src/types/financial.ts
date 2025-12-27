// Core financial system types

export type CompanyType = 'empresa' | 'pessoal';
export type Status = 'ativo' | 'arquivado';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'real' | 'provisao';
export type CategoryType = 'receita' | 'despesa' | 'ambos';
export type InvoicePaymentTreatment = 'emprestimo' | 'despesa_pessoal' | 'rateio';
export type MonthClosingStatus = 'aberto' | 'fechado';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  closingDay: number; // 1-28
  dueDay: number; // 1-28
  defaultBankAccountId: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  name: string;
  companyId: string;
  initialBalance: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProvider {
  id: string;
  name: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  date: Date;
  effectiveDate: Date | null; // when provision becomes real
  description: string;
  amount: number; // always positive
  companyId: string | null; // required for income/expense
  categoryId: string | null;
  serviceProviderId: string | null;
  bankAccountId: string | null;
  creditCardId: string | null;
  // Installment info
  purchaseId: string | null; // groups installments
  installmentNumber: number | null;
  totalInstallments: number | null;
  installmentDueDate: Date | null;
  // Transfer specific
  destinationBankAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoicePayment {
  id: string;
  creditCardId: string;
  payingCompanyId: string;
  bankAccountId: string;
  paymentDate: Date;
  amount: number;
  treatment: InvoicePaymentTreatment;
  referenceMonth: string; // YYYY-MM
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthClosing {
  id: string;
  yearMonth: string; // YYYY-MM
  status: MonthClosingStatus;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard types
export interface FinancialSummary {
  realBalance: number;
  projectedBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  pendingProvisions: number;
}

// Audit alert types
export type AlertType = 
  | 'invoice_as_expense'
  | 'transfer_as_income_expense'
  | 'orphan_installment'
  | 'old_provision'
  | 'balance_mismatch';

export interface AuditAlert {
  id: string;
  type: AlertType;
  severity: 'warning' | 'error';
  message: string;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdAt: Date;
}

// Form wizard types
export type WizardTransactionType = 
  | 'entrada'
  | 'saida'
  | 'transferencia'
  | 'compra_cartao'
  | 'pagamento_fatura'
  | 'ajuste';
