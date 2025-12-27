import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { BankAccount } from '@/types/financial';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Archive, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BankAccounts() {
  const { 
    bankAccounts, 
    companies,
    addBankAccount, 
    updateBankAccount, 
    archiveBankAccount,
    canDeleteBankAccount,
    getBankAccountBalance,
  } = useFinancial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    initialBalance: 0,
  });

  const activeCompanies = companies.filter(c => c.status === 'ativo');

  const openCreateDialog = () => {
    setSelectedAccount(null);
    setFormData({ name: '', companyId: activeCompanies[0]?.id || '', initialBalance: 0 });
    setDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormData({ 
      name: account.name, 
      companyId: account.companyId, 
      initialBalance: account.initialBalance 
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.companyId) {
      toast.error('Empresa é obrigatória');
      return;
    }

    if (selectedAccount) {
      updateBankAccount(selectedAccount.id, formData);
      toast.success('Conta atualizada com sucesso');
    } else {
      addBankAccount({ ...formData, status: 'ativo' });
      toast.success('Conta criada com sucesso');
    }
    setDialogOpen(false);
  };

  const handleArchive = () => {
    if (selectedAccount) {
      archiveBankAccount(selectedAccount.id);
      toast.success('Conta arquivada com sucesso');
      setArchiveDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const handleReactivate = (account: BankAccount) => {
    updateBankAccount(account.id, { status: 'ativo' });
    toast.success('Conta reativada com sucesso');
  };

  const getCompanyName = (id: string) => {
    return companies.find(c => c.id === id)?.name || '-';
  };

  const columns: Column<BankAccount>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Landmark className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{a.name}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Empresa',
      render: (a) => getCompanyName(a.companyId),
    },
    {
      key: 'initialBalance',
      header: 'Saldo Inicial',
      render: (a) => (
        <span className={a.initialBalance >= 0 ? 'text-positive' : 'text-negative'}>
          {a.initialBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      ),
    },
    {
      key: 'currentBalance',
      header: 'Saldo Atual',
      render: (a) => {
        const balance = getBankAccountBalance(a.id);
        return (
          <span className={balance >= 0 ? 'text-positive' : 'text-negative'}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <StatusBadge variant={a.status === 'ativo' ? 'success' : 'default'}>
          {a.status === 'ativo' ? 'Ativo' : 'Arquivado'}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (a) => format(a.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(a);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {a.status === 'ativo' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAccount(a);
                setArchiveDialogOpen(true);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeAccounts = bankAccounts.filter(a => a.status === 'ativo');
  const archivedAccounts = bankAccounts.filter(a => a.status === 'arquivado');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas Bancárias</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias por empresa</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Active Accounts */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ativas ({activeAccounts.length})</h2>
        <DataTable
          columns={columns}
          data={activeAccounts}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhuma conta ativa"
        />
      </div>

      {/* Archived Accounts */}
      {archivedAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Arquivadas ({archivedAccounts.length})
          </h2>
          <DataTable
            columns={columns}
            data={archivedAccounts}
            keyExtractor={(a) => a.id}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Bradesco PJ"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {activeCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Saldo Inicial</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {selectedAccount ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Conta</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAccount && !canDeleteBankAccount(selectedAccount.id)
                ? 'Esta conta possui lançamentos vinculados e não pode ser excluída. Deseja arquivá-la?'
                : 'Tem certeza que deseja arquivar esta conta?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-warning hover:bg-warning/90">
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
