import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const { 
    transactions, 
    companies, 
    categories,
    creditCards,
  } = useFinancial();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCompany, setSelectedCompany] = useState('all');

  const activeCompanies = companies.filter(c => c.status === 'ativo');

  // Generate last 12 months options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    };
  });

  // Filter transactions by selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const inDateRange = transactionDate >= startDate && transactionDate <= endDate;
    const matchesCompany = selectedCompany === 'all' || t.companyId === selectedCompany;
    return inDateRange && matchesCompany;
  });

  const realTransactions = monthTransactions.filter(t => t.status === 'real');

  // Calculate summaries
  const totalIncome = realTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = realTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const result = totalIncome - totalExpenses;

  // Group expenses by category
  const expensesByCategory = realTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryId = t.categoryId || 'uncategorized';
      acc[categoryId] = (acc[categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryId === 'uncategorized' 
        ? 'Sem Categoria' 
        : categories.find(c => c.id === categoryId)?.name || 'Desconhecida',
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Credit card expenses
  const cardExpenses = realTransactions
    .filter(t => t.creditCardId)
    .reduce((acc, t) => {
      const cardId = t.creditCardId!;
      acc[cardId] = (acc[cardId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Company breakdown
  const companyBreakdown = realTransactions.reduce((acc, t) => {
    const companyId = t.companyId || 'none';
    if (!acc[companyId]) {
      acc[companyId] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') acc[companyId].income += t.amount;
    if (t.type === 'expense') acc[companyId].expense += t.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise financeira por período e empresa</p>
        </div>
      </div>

      {/* Filters */}
      <div className="financial-card flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 bg-secondary border-border">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Empresa</Label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-48 bg-secondary border-border">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Todas as Empresas</SelectItem>
              {activeCompanies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Receitas"
          value={totalIncome}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="positive"
        />
        <StatCard
          title="Despesas"
          value={totalExpenses}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="negative"
        />
        <StatCard
          title="Resultado"
          value={result}
          icon={result >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          variant={result >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="companies">Por Empresa</TabsTrigger>
          <TabsTrigger value="cards">Por Cartão</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="financial-card">
            <h3 className="font-semibold text-foreground mb-4">Despesas por Categoria</h3>
            {sortedCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma despesa no período selecionado
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map((category, index) => {
                  const percentage = totalExpenses > 0 
                    ? (category.amount / totalExpenses * 100).toFixed(1) 
                    : '0';
                  
                  return (
                    <div key={category.categoryId} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-negative">
                            {category.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-negative/60 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="financial-card">
            <h3 className="font-semibold text-foreground mb-4">Resultado por Empresa</h3>
            {Object.keys(companyBreakdown).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum lançamento no período selecionado
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(companyBreakdown).map(([companyId, data]) => {
                  const company = companies.find(c => c.id === companyId);
                  const companyResult = data.income - data.expense;
                  
                  return (
                    <div key={companyId} className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {company?.name || 'Sem Empresa'}
                          </span>
                          {company?.type === 'pessoal' && (
                            <StatusBadge variant="provision">Pessoal</StatusBadge>
                          )}
                        </div>
                        <span className={companyResult >= 0 ? 'text-positive font-semibold' : 'text-negative font-semibold'}>
                          {companyResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Receitas</span>
                          <span className="text-positive">
                            {data.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Despesas</span>
                          <span className="text-negative">
                            {data.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="financial-card">
            <h3 className="font-semibold text-foreground mb-4">Gastos por Cartão</h3>
            {Object.keys(cardExpenses).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma despesa em cartão no período selecionado
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(cardExpenses).map(([cardId, amount]) => {
                  const card = creditCards.find(c => c.id === cardId);
                  
                  return (
                    <div key={cardId} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{card?.name || 'Cartão Desconhecido'}</p>
                          <p className="text-xs text-muted-foreground">****{card?.lastFourDigits}</p>
                        </div>
                      </div>
                      <span className="text-negative font-semibold">
                        {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
