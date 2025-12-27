import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Company,
  CreditCard,
  BankAccount,
  Category,
  ServiceProvider,
  Transaction,
  InvoicePayment,
  MonthClosing,
  FinancialSummary,
  AuditAlert,
} from '@/types/financial';

interface FinancialContextType {
  // Data
  companies: Company[];
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  categories: Category[];
  serviceProviders: ServiceProvider[];
  transactions: Transaction[];
  invoicePayments: InvoicePayment[];
  monthClosings: MonthClosing[];
  auditAlerts: AuditAlert[];
  
  // Actions - Companies
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, data: Partial<Company>) => void;
  archiveCompany: (id: string) => void;
  
  // Actions - Credit Cards
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCard: (id: string, data: Partial<CreditCard>) => void;
  archiveCreditCard: (id: string) => void;
  
  // Actions - Bank Accounts
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBankAccount: (id: string, data: Partial<BankAccount>) => void;
  archiveBankAccount: (id: string) => void;
  
  // Actions - Categories
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  archiveCategory: (id: string) => void;
  
  // Actions - Service Providers
  addServiceProvider: (provider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceProvider: (id: string, data: Partial<ServiceProvider>) => void;
  archiveServiceProvider: (id: string) => void;
  
  // Actions - Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  confirmProvision: (id: string, effectiveDate: Date) => void;
  
  // Actions - Invoice Payments
  addInvoicePayment: (payment: Omit<InvoicePayment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // Computed values
  getSummary: (startDate?: Date, endDate?: Date) => FinancialSummary;
  getCompanyBalance: (companyId: string) => number;
  getBankAccountBalance: (accountId: string) => number;
  getCreditCardInvoice: (cardId: string, month: string) => Transaction[];
  
  // Helpers
  canDeleteCompany: (id: string) => boolean;
  canDeleteCreditCard: (id: string) => boolean;
  canDeleteBankAccount: (id: string) => boolean;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

// Sample data for demonstration
const sampleCompanies: Company[] = [
  { id: '1', name: 'Empresa Principal', type: 'empresa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Consultoria ABC', type: 'empresa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Pessoal', type: 'pessoal', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
];

const sampleBankAccounts: BankAccount[] = [
  { id: '1', name: 'Bradesco PJ', companyId: '1', initialBalance: 15000, status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Nubank Consultoria', companyId: '2', initialBalance: 8500, status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Itaú Pessoal', companyId: '3', initialBalance: 5000, status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
];

const sampleCreditCards: CreditCard[] = [
  { id: '1', name: 'Visa Empresarial', lastFourDigits: '4521', closingDay: 15, dueDay: 25, defaultBankAccountId: '1', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Mastercard Pessoal', lastFourDigits: '8832', closingDay: 10, dueDay: 20, defaultBankAccountId: '3', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
];

const sampleCategories: Category[] = [
  { id: '1', name: 'Vendas', type: 'receita', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Serviços Prestados', type: 'receita', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Aluguel', type: 'despesa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Software/SaaS', type: 'despesa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Marketing', type: 'despesa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Alimentação', type: 'despesa', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
];

const sampleServiceProviders: ServiceProvider[] = [
  { id: '1', name: 'AWS', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Google Workspace', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Imobiliária Central', status: 'ativo', createdAt: new Date(), updatedAt: new Date() },
];

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    status: 'real',
    date: new Date(2024, 11, 5),
    effectiveDate: null,
    description: 'Pagamento Cliente XYZ',
    amount: 12500,
    companyId: '1',
    categoryId: '1',
    serviceProviderId: null,
    bankAccountId: '1',
    creditCardId: null,
    purchaseId: null,
    installmentNumber: null,
    totalInstallments: null,
    installmentDueDate: null,
    destinationBankAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'expense',
    status: 'real',
    date: new Date(2024, 11, 10),
    effectiveDate: null,
    description: 'AWS - Serviços Cloud',
    amount: 850,
    companyId: '1',
    categoryId: '4',
    serviceProviderId: '1',
    bankAccountId: null,
    creditCardId: '1',
    purchaseId: null,
    installmentNumber: null,
    totalInstallments: null,
    installmentDueDate: null,
    destinationBankAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    type: 'expense',
    status: 'provisao',
    date: new Date(2025, 0, 5),
    effectiveDate: null,
    description: 'Aluguel Janeiro',
    amount: 2500,
    companyId: '1',
    categoryId: '3',
    serviceProviderId: '3',
    bankAccountId: '1',
    creditCardId: null,
    purchaseId: null,
    installmentNumber: null,
    totalInstallments: null,
    installmentDueDate: null,
    destinationBankAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    type: 'income',
    status: 'provisao',
    date: new Date(2025, 0, 15),
    effectiveDate: null,
    description: 'Projeto Consultoria - Previsão',
    amount: 8000,
    companyId: '2',
    categoryId: '2',
    serviceProviderId: null,
    bankAccountId: '2',
    creditCardId: null,
    purchaseId: null,
    installmentNumber: null,
    totalInstallments: null,
    installmentDueDate: null,
    destinationBankAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(sampleCreditCards);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(sampleBankAccounts);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(sampleServiceProviders);
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [invoicePayments, setInvoicePayments] = useState<InvoicePayment[]>([]);
  const [monthClosings, setMonthClosings] = useState<MonthClosing[]>([]);
  const [auditAlerts] = useState<AuditAlert[]>([]);

  // Company actions
  const addCompany = (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const updateCompany = (id: string, data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
    ));
  };

  const archiveCompany = (id: string) => {
    updateCompany(id, { status: 'arquivado' });
  };

  // Credit Card actions
  const addCreditCard = (data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: CreditCard = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCreditCards(prev => [...prev, newCard]);
  };

  const updateCreditCard = (id: string, data: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => 
      c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
    ));
  };

  const archiveCreditCard = (id: string) => {
    updateCreditCard(id, { status: 'arquivado' });
  };

  // Bank Account actions
  const addBankAccount = (data: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: BankAccount = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBankAccounts(prev => [...prev, newAccount]);
  };

  const updateBankAccount = (id: string, data: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(a => 
      a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
    ));
  };

  const archiveBankAccount = (id: string) => {
    updateBankAccount(id, { status: 'arquivado' });
  };

  // Category actions
  const addCategory = (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
    ));
  };

  const archiveCategory = (id: string) => {
    updateCategory(id, { status: 'arquivado' });
  };

  // Service Provider actions
  const addServiceProvider = (data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProvider: ServiceProvider = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setServiceProviders(prev => [...prev, newProvider]);
  };

  const updateServiceProvider = (id: string, data: Partial<ServiceProvider>) => {
    setServiceProviders(prev => prev.map(p => 
      p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
    ));
  };

  const archiveServiceProvider = (id: string) => {
    updateServiceProvider(id, { status: 'arquivado' });
  };

  // Transaction actions
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...data, updatedAt: new Date() } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const confirmProvision = (id: string, effectiveDate: Date) => {
    updateTransaction(id, { status: 'real', effectiveDate });
  };

  // Invoice Payment actions
  const addInvoicePayment = (data: Omit<InvoicePayment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: InvoicePayment = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInvoicePayments(prev => [...prev, newPayment]);
  };

  // Computed values
  const getSummary = (startDate?: Date, endDate?: Date): FinancialSummary => {
    let filteredTransactions = transactions;
    
    if (startDate && endDate) {
      filteredTransactions = transactions.filter(t => 
        t.date >= startDate && t.date <= endDate
      );
    }

    const realTransactions = filteredTransactions.filter(t => t.status === 'real');
    const allTransactions = filteredTransactions;

    const realIncome = realTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const realExpenses = realTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const projectedIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const projectedExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTransfers = allTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingProvisions = allTransactions
      .filter(t => t.status === 'provisao')
      .length;

    const initialBalance = bankAccounts.reduce((sum, a) => sum + a.initialBalance, 0);

    return {
      realBalance: initialBalance + realIncome - realExpenses,
      projectedBalance: initialBalance + projectedIncome - projectedExpenses,
      totalIncome: realIncome,
      totalExpenses: realExpenses,
      totalTransfers,
      pendingProvisions,
    };
  };

  const getCompanyBalance = (companyId: string): number => {
    const companyAccounts = bankAccounts.filter(a => a.companyId === companyId);
    const initialBalance = companyAccounts.reduce((sum, a) => sum + a.initialBalance, 0);
    
    const realTransactions = transactions.filter(t => 
      t.status === 'real' && t.companyId === companyId
    );
    
    const income = realTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = realTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return initialBalance + income - expenses;
  };

  const getBankAccountBalance = (accountId: string): number => {
    const account = bankAccounts.find(a => a.id === accountId);
    if (!account) return 0;

    const accountTransactions = transactions.filter(t => 
      t.status === 'real' && 
      (t.bankAccountId === accountId || t.destinationBankAccountId === accountId)
    );

    let balance = account.initialBalance;

    accountTransactions.forEach(t => {
      if (t.bankAccountId === accountId) {
        if (t.type === 'income') balance += t.amount;
        else if (t.type === 'expense') balance -= t.amount;
        else if (t.type === 'transfer') balance -= t.amount;
      }
      if (t.destinationBankAccountId === accountId && t.type === 'transfer') {
        balance += t.amount;
      }
    });

    return balance;
  };

  const getCreditCardInvoice = (cardId: string, month: string): Transaction[] => {
    const [year, monthNum] = month.split('-').map(Number);
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return [];

    // Get transactions for this card in the billing cycle
    return transactions.filter(t => {
      if (t.creditCardId !== cardId) return false;
      const transactionDate = new Date(t.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      return transactionMonth === monthNum - 1 && transactionYear === year;
    });
  };

  // Helpers
  const canDeleteCompany = (id: string): boolean => {
    const hasTransactions = transactions.some(t => t.companyId === id);
    const hasAccounts = bankAccounts.some(a => a.companyId === id);
    const hasPayments = invoicePayments.some(p => p.payingCompanyId === id);
    return !hasTransactions && !hasAccounts && !hasPayments;
  };

  const canDeleteCreditCard = (id: string): boolean => {
    const hasTransactions = transactions.some(t => t.creditCardId === id);
    const hasPayments = invoicePayments.some(p => p.creditCardId === id);
    return !hasTransactions && !hasPayments;
  };

  const canDeleteBankAccount = (id: string): boolean => {
    const hasTransactions = transactions.some(t => 
      t.bankAccountId === id || t.destinationBankAccountId === id
    );
    const hasPayments = invoicePayments.some(p => p.bankAccountId === id);
    return !hasTransactions && !hasPayments;
  };

  return (
    <FinancialContext.Provider value={{
      companies,
      creditCards,
      bankAccounts,
      categories,
      serviceProviders,
      transactions,
      invoicePayments,
      monthClosings,
      auditAlerts,
      addCompany,
      updateCompany,
      archiveCompany,
      addCreditCard,
      updateCreditCard,
      archiveCreditCard,
      addBankAccount,
      updateBankAccount,
      archiveBankAccount,
      addCategory,
      updateCategory,
      archiveCategory,
      addServiceProvider,
      updateServiceProvider,
      archiveServiceProvider,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      confirmProvision,
      addInvoicePayment,
      getSummary,
      getCompanyBalance,
      getBankAccountBalance,
      getCreditCardInvoice,
      canDeleteCompany,
      canDeleteCreditCard,
      canDeleteBankAccount,
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
