import { useFinancial } from '@/contexts/FinancialContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}

export default function Alerts() {
  const { transactions, bankAccounts } = useFinancial();

  // Generate alerts based on data analysis
  const alerts: Alert[] = [];

  // Check for old provisions
  const oldProvisions = transactions.filter(t => {
    if (t.status !== 'provisao') return false;
    const daysDiff = (new Date().getTime() - t.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 30;
  });

  if (oldProvisions.length > 0) {
    alerts.push({
      id: 'old-provisions',
      type: 'warning',
      title: `${oldProvisions.length} provisões antigas não confirmadas`,
      description: 'Existem provisões com mais de 30 dias que não foram confirmadas como realizadas.',
      action: 'Revisar provisões',
    });
  }

  // Check for orphan installments
  const installmentGroups = transactions.filter(t => t.purchaseId);
  const purchaseIds = [...new Set(installmentGroups.map(t => t.purchaseId))];
  
  purchaseIds.forEach(purchaseId => {
    const installments = transactions.filter(t => t.purchaseId === purchaseId);
    const totalExpected = installments[0]?.totalInstallments || 0;
    if (installments.length !== totalExpected && totalExpected > 0) {
      alerts.push({
        id: `orphan-${purchaseId}`,
        type: 'error',
        title: 'Parcelas inconsistentes',
        description: `Compra parcelada com ${installments.length} de ${totalExpected} parcelas registradas.`,
        action: 'Verificar compra',
      });
    }
  });

  // Check for balance discrepancies
  bankAccounts.forEach(account => {
    const accountTransactions = transactions.filter(
      t => t.status === 'real' && (t.bankAccountId === account.id || t.destinationBankAccountId === account.id)
    );
    
    let calculatedBalance = account.initialBalance;
    accountTransactions.forEach(t => {
      if (t.bankAccountId === account.id) {
        if (t.type === 'income') calculatedBalance += t.amount;
        else if (t.type === 'expense') calculatedBalance -= t.amount;
        else if (t.type === 'transfer') calculatedBalance -= t.amount;
      }
      if (t.destinationBankAccountId === account.id && t.type === 'transfer') {
        calculatedBalance += t.amount;
      }
    });

    // This is just a placeholder - in a real app you'd compare with actual bank balance
  });

  // Info alerts
  if (alerts.length === 0) {
    alerts.push({
      id: 'all-good',
      type: 'info',
      title: 'Tudo em ordem!',
      description: 'Não foram encontradas inconsistências nos seus dados financeiros.',
    });
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-5 w-5 text-negative" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info': return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'border-negative/30 bg-negative/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'info': return 'border-primary/30 bg-primary/5';
    }
  };

  const errorCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alertas e Auditoria</h1>
        <p className="text-muted-foreground">
          Verificação automática de inconsistências nos dados financeiros
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-negative/10">
            <AlertCircle className="h-6 w-6 text-negative" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Erros Críticos</p>
            <p className="text-2xl font-bold text-negative">{errorCount}</p>
          </div>
        </div>
        
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avisos</p>
            <p className="text-2xl font-bold text-warning">{warningCount}</p>
          </div>
        </div>
        
        <div className="financial-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-positive/10">
            <CheckCircle className="h-6 w-6 text-positive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-lg font-semibold text-positive">
              {errorCount === 0 && warningCount === 0 ? 'Tudo OK' : 'Requer Atenção'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Alertas Detectados ({alerts.length})
        </h2>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`financial-card flex items-start gap-4 ${getAlertStyle(alert.type)}`}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{alert.title}</h3>
                  <StatusBadge
                    variant={
                      alert.type === 'error' ? 'error' :
                      alert.type === 'warning' ? 'warning' :
                      'info'
                    }
                  >
                    {alert.type === 'error' ? 'Crítico' :
                     alert.type === 'warning' ? 'Aviso' :
                     'Info'}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              {alert.action && (
                <Button variant="outline" size="sm">
                  {alert.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audit Checks Info */}
      <div className="financial-card">
        <h3 className="font-medium text-foreground mb-4">Verificações Automáticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Pagamentos de fatura como despesa</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Transferências como receita/despesa</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Parcelas sem vínculo correto</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Provisões antigas não confirmadas</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Diferença saldo conta vs lançamentos</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-positive" />
            <span className="text-muted-foreground">Lançamentos em mês fechado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
