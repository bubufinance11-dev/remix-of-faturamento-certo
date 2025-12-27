import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Transaction, TransactionType, TransactionStatus } from '@/types/financial';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function Transactions() {
  const { 
    transactions, 
    companies, 
    categories,
    bankAccounts,
    creditCards,
  } = useFinancial();

  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | TransactionType,
    status: 'all' as 'all' | TransactionStatus,
    companyId: 'all',
    categoryId: 'all',
  });

  const getCompanyName = (id: string | null) => {
    if (!id) return '-';
    return companies.find(c => c.id === id)?.name || '-';
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    return categories.find(c => c.id === id)?.name || '-';
  };

  const getBankAccountName = (id: string | null) => {
    if (!id) return '-';
    return bankAccounts.find(a => a.id === id)?.name || '-';
  };

  const getCreditCardName = (id: string | null) => {
    if (!id) return null;
    const card = creditCards.find(c => c.id === id);
    return card ? `${card.name} (****${card.lastFourDigits})` : null;
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-4 w-4 text-positive" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-negative" />;
      case 'transfer': return <ArrowRightLeft className="h-4 w-4 text-primary" />;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.companyId !== 'all' && t.companyId !== filters.companyId) return false;
    if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) return false;
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const columns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Data',
      render: (t) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(t.date, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (t) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(t.type)}
          <span>
            {t.type === 'income' ? 'Entrada' : t.type === 'expense' ? 'Saída' : 'Transferência'}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (t) => (
        <div>
          <p className="font-medium">{t.description}</p>
          {t.creditCardId && (
            <p className="text-xs text-muted-foreground">
              {getCreditCardName(t.creditCardId)}
            </p>
          )}
          {t.installmentNumber && (
            <p className="text-xs text-provision">
              Parcela {t.installmentNumber}/{t.totalInstallments}
            </p>
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
      key: 'account',
      header: 'Conta',
      render: (t) => getBankAccountName(t.bankAccountId),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <StatusBadge variant={t.status === 'real' ? 'success' : 'provision'}>
          {t.status === 'real' ? 'Real' : 'Provisão'}
        </StatusBadge>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      className: 'text-right',
      render: (t) => (
        <span className={
          t.type === 'income' ? 'text-positive font-medium' : 
          t.type === 'expense' ? 'text-negative font-medium' : 
          'text-foreground font-medium'
        }>
          {t.type === 'expense' ? '-' : ''}
          {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      ),
    },
  ];

  const activeCompanies = companies.filter(c => c.status === 'ativo');
  const activeCategories = categories.filter(c => c.status === 'ativo');

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.status === 'real') {
        if (t.type === 'income') acc.income += t.amount;
        else if (t.type === 'expense') acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lançamentos</h1>
          <p className="text-muted-foreground">Visualize e gerencie todos os lançamentos</p>
        </div>
        <Link to="/lancamentos/novo">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="financial-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Descrição..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 bg-secondary border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={filters.type}
              onValueChange={(value: 'all' | TransactionType) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Saída</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value: 'all' | TransactionStatus) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="real">Real</SelectItem>
                <SelectItem value="provisao">Provisão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select
              value={filters.companyId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, companyId: value }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todas</SelectItem>
                {activeCompanies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todas</SelectItem>
                {activeCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="financial-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Entradas</p>
            <p className="text-xl font-bold text-positive">
              {totals.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-positive/50" />
        </div>
        <div className="financial-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Saídas</p>
            <p className="text-xl font-bold text-negative">
              {totals.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-negative/50" />
        </div>
        <div className="financial-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Resultado</p>
            <p className={`text-xl font-bold ${totals.income - totals.expense >= 0 ? 'text-positive' : 'text-negative'}`}>
              {(totals.income - totals.expense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <ArrowRightLeft className="h-8 w-8 text-primary/50" />
        </div>
      </div>

      {/* Transactions Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Lançamentos ({filteredTransactions.length})
          </h2>
        </div>
        <DataTable
          columns={columns}
          data={filteredTransactions}
          keyExtractor={(t) => t.id}
          emptyMessage="Nenhum lançamento encontrado"
        />
      </div>
    </div>
  );
}
