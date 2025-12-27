import { useFinancial } from '@/contexts/FinancialContext';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Transaction } from '@/types/financial';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { 
    getSummary, 
    transactions, 
    companies, 
    categories,
    creditCards,
    bankAccounts,
  } = useFinancial();
  
  const summary = getSummary();
  
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const getCompanyName = (id: string | null) => {
    if (!id) return '-';
    return companies.find(c => c.id === id)?.name || '-';
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    return categories.find(c => c.id === id)?.name || '-';
  };

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Data',
      render: (t) => format(t.date, 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (t) => (
        <div className="flex items-center gap-2">
          <span>{t.description}</span>
          {t.status === 'provisao' && (
            <StatusBadge variant="provision">Provisão</StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Empresa',
      render: (t) => getCompanyName(t.companyId),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (t) => getCategoryName(t.categoryId),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (t) => (
        <StatusBadge
          variant={
            t.type === 'income' ? 'success' : 
            t.type === 'expense' ? 'error' : 
            'info'
          }
        >
          {t.type === 'income' ? 'Entrada' : t.type === 'expense' ? 'Saída' : 'Transferência'}
        </StatusBadge>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      className: 'text-right',
      render: (t) => (
        <span className={t.type === 'income' ? 'text-positive' : t.type === 'expense' ? 'text-negative' : 'text-foreground'}>
          {t.type === 'expense' ? '-' : ''}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Saldo Real"
          value={summary.realBalance}
          icon={<Wallet className="h-5 w-5" />}
          variant={summary.realBalance >= 0 ? 'positive' : 'negative'}
          className="xl:col-span-2"
        />
        <StatCard
          title="Saldo Previsto"
          subtitle="Inclui provisões"
          value={summary.projectedBalance}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="provision"
          className="xl:col-span-2"
        />
        <StatCard
          title="Entradas"
          subtitle="Este mês"
          value={summary.totalIncome}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="positive"
        />
        <StatCard
          title="Saídas"
          subtitle="Este mês"
          value={summary.totalExpenses}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="negative"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cartões Ativos</p>
            <p className="text-xl font-bold text-foreground">
              {creditCards.filter(c => c.status === 'ativo').length}
            </p>
          </div>
        </div>
        
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <ArrowRightLeft className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contas Bancárias</p>
            <p className="text-xl font-bold text-foreground">
              {bankAccounts.filter(a => a.status === 'ativo').length}
            </p>
          </div>
        </div>
        
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10">
            <AlertCircle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Provisões Pendentes</p>
            <p className="text-xl font-bold text-warning">
              {summary.pendingProvisions}
            </p>
          </div>
        </div>
        
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-secondary">
            <TrendingUp className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Empresas Ativas</p>
            <p className="text-xl font-bold text-foreground">
              {companies.filter(c => c.status === 'ativo').length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lançamentos Recentes</h2>
        </div>
        <DataTable
          columns={transactionColumns}
          data={recentTransactions}
          keyExtractor={(t) => t.id}
          emptyMessage="Nenhum lançamento registrado"
        />
      </div>

      {/* Company Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Saldo por Empresa</h2>
          <div className="space-y-3">
            {companies
              .filter(c => c.status === 'ativo')
              .map(company => {
                const companyAccounts = bankAccounts.filter(a => a.companyId === company.id);
                const balance = companyAccounts.reduce((sum, acc) => {
                  const accountTransactions = transactions.filter(
                    t => t.status === 'real' && t.bankAccountId === acc.id
                  );
                  const income = accountTransactions
                    .filter(t => t.type === 'income')
                    .reduce((s, t) => s + t.amount, 0);
                  const expenses = accountTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((s, t) => s + t.amount, 0);
                  return sum + acc.initialBalance + income - expenses;
                }, 0);

                return (
                  <div key={company.id} className="financial-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${company.type === 'pessoal' ? 'bg-provision' : 'bg-primary'}`} />
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.type === 'pessoal' ? 'Pessoal' : 'Empresa'}
                        </p>
                      </div>
                    </div>
                    <span className={balance >= 0 ? 'text-positive' : 'text-negative'}>
                      {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Saldo por Conta</h2>
          <div className="space-y-3">
            {bankAccounts
              .filter(a => a.status === 'ativo')
              .map(account => {
                const accountTransactions = transactions.filter(
                  t => t.status === 'real' && t.bankAccountId === account.id
                );
                const income = accountTransactions
                  .filter(t => t.type === 'income')
                  .reduce((s, t) => s + t.amount, 0);
                const expenses = accountTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((s, t) => s + t.amount, 0);
                const balance = account.initialBalance + income - expenses;
                const company = companies.find(c => c.id === account.companyId);

                return (
                  <div key={account.id} className="financial-card flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{company?.name}</p>
                    </div>
                    <span className={balance >= 0 ? 'text-positive' : 'text-negative'}>
                      {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
