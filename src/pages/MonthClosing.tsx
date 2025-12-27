import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CalendarCheck,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'ok' | 'warning' | 'error';
  count?: number;
}

export default function MonthClosing() {
  const { transactions, monthClosings } = useFinancial();
  const [selectedMonth, setSelectedMonth] = useState(format(subMonths(new Date(), 1), 'yyyy-MM'));
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  // Generate last 12 months options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    };
  });

  const monthClosing = monthClosings.find(mc => mc.yearMonth === selectedMonth);
  const isClosed = monthClosing?.status === 'fechado';

  // Get transactions for selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === month - 1 && transactionDate.getFullYear() === year;
  });

  // Generate checklist
  const checklist: ChecklistItem[] = [];

  // Check pending provisions
  const pendingProvisions = monthTransactions.filter(t => t.status === 'provisao');
  checklist.push({
    id: 'provisions',
    label: 'Provisões Pendentes',
    description: pendingProvisions.length === 0 
      ? 'Todas as provisões foram confirmadas'
      : `${pendingProvisions.length} provisão(ões) não confirmada(s)`,
    status: pendingProvisions.length === 0 ? 'ok' : 'warning',
    count: pendingProvisions.length,
  });

  // Check installment consistency
  const installmentGroups = monthTransactions.filter(t => t.purchaseId);
  const purchaseIds = [...new Set(installmentGroups.map(t => t.purchaseId))];
  let orphanInstallments = 0;
  
  purchaseIds.forEach(purchaseId => {
    const installments = transactions.filter(t => t.purchaseId === purchaseId);
    const totalExpected = installments[0]?.totalInstallments || 0;
    if (installments.length !== totalExpected) {
      orphanInstallments++;
    }
  });

  checklist.push({
    id: 'installments',
    label: 'Consistência de Parcelas',
    description: orphanInstallments === 0
      ? 'Todas as compras parceladas estão consistentes'
      : `${orphanInstallments} compra(s) com parcelas inconsistentes`,
    status: orphanInstallments === 0 ? 'ok' : 'error',
    count: orphanInstallments,
  });

  // Check transactions without company
  const noCompanyTransactions = monthTransactions.filter(
    t => t.type !== 'transfer' && !t.companyId
  );
  checklist.push({
    id: 'company',
    label: 'Lançamentos sem Empresa',
    description: noCompanyTransactions.length === 0
      ? 'Todos os lançamentos têm empresa vinculada'
      : `${noCompanyTransactions.length} lançamento(s) sem empresa`,
    status: noCompanyTransactions.length === 0 ? 'ok' : 'warning',
    count: noCompanyTransactions.length,
  });

  // Check transactions without category
  const noCategoryTransactions = monthTransactions.filter(
    t => t.type !== 'transfer' && !t.categoryId
  );
  checklist.push({
    id: 'category',
    label: 'Lançamentos sem Categoria',
    description: noCategoryTransactions.length === 0
      ? 'Todos os lançamentos têm categoria'
      : `${noCategoryTransactions.length} lançamento(s) sem categoria`,
    status: noCategoryTransactions.length === 0 ? 'ok' : 'warning',
    count: noCategoryTransactions.length,
  });

  const hasErrors = checklist.some(item => item.status === 'error');
  const hasWarnings = checklist.some(item => item.status === 'warning');

  const handleCloseMonth = () => {
    if (hasErrors) {
      toast.error('Corrija os erros antes de fechar o mês');
      return;
    }
    // In a real app, this would add to monthClosings
    toast.success(`Mês ${format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })} fechado com sucesso`);
    setCloseDialogOpen(false);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'ok': return <Check className="h-5 w-5 text-positive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <X className="h-5 w-5 text-negative" />;
    }
  };

  const getStatusStyle = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'ok': return 'border-positive/30 bg-positive/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'error': return 'border-negative/30 bg-negative/5';
    }
  };

  // Calculate month totals
  const realTransactions = monthTransactions.filter(t => t.status === 'real');
  const totalIncome = realTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = realTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fechamento Mensal</h1>
          <p className="text-muted-foreground">
            Verifique e finalize o período contábil
          </p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="financial-card flex items-end gap-4">
        <div className="space-y-2">
          <Label>Mês de Referência</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-64 bg-secondary border-border">
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
        <div className="flex items-center gap-2">
          {isClosed ? (
            <StatusBadge variant="error">
              <Lock className="h-3 w-3 mr-1" />
              Fechado
            </StatusBadge>
          ) : (
            <StatusBadge variant="success">
              <Unlock className="h-3 w-3 mr-1" />
              Aberto
            </StatusBadge>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="financial-card">
          <p className="text-sm text-muted-foreground mb-1">Total de Lançamentos</p>
          <p className="text-2xl font-bold text-foreground">{monthTransactions.length}</p>
        </div>
        <div className="financial-card">
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-bold text-positive">
            {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="financial-card">
          <p className="text-sm text-muted-foreground mb-1">Despesas</p>
          <p className="text-2xl font-bold text-negative">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="financial-card">
          <p className="text-sm text-muted-foreground mb-1">Resultado</p>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-positive' : 'text-negative'}`}>
            {(totalIncome - totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="financial-card">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Checklist de Fechamento</h3>
        </div>
        
        <div className="space-y-3">
          {checklist.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${getStatusStyle(item.status)}`}
            >
              {getStatusIcon(item.status)}
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-sm font-medium px-2 py-1 rounded bg-secondary">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isClosed && (
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => setCloseDialogOpen(true)}
            disabled={hasErrors}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Lock className="h-4 w-4 mr-2" />
            Fechar Mês
          </Button>
        </div>
      )}

      {/* Warning message */}
      {hasErrors && !isClosed && (
        <div className="financial-card border-negative/30 bg-negative/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-negative mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Não é possível fechar o mês</p>
              <p className="text-sm text-muted-foreground">
                Existem erros que precisam ser corrigidos antes do fechamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasWarnings && !hasErrors && !isClosed && (
        <div className="financial-card border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Atenção</p>
              <p className="text-sm text-muted-foreground">
                Existem avisos pendentes. O fechamento é possível, mas recomendamos revisar os itens acima.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Fechamento</AlertDialogTitle>
            <AlertDialogDescription>
              Ao fechar o mês de {format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })}, 
              não será mais possível editar lançamentos deste período.
              {hasWarnings && (
                <span className="block mt-2 text-warning">
                  Atenção: Existem avisos pendentes que não foram resolvidos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCloseMonth}
              className="bg-accent hover:bg-accent/90"
            >
              Confirmar Fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
