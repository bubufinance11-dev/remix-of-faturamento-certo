import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { CreditCard as CreditCardType } from '@/types/financial';
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
import { Plus, Pencil, Archive, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CreditCards() {
  const { 
    creditCards, 
    bankAccounts,
    addCreditCard, 
    updateCreditCard, 
    archiveCreditCard,
    canDeleteCreditCard,
  } = useFinancial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lastFourDigits: '',
    closingDay: 15,
    dueDay: 25,
    defaultBankAccountId: null as string | null,
  });

  const activeAccounts = bankAccounts.filter(a => a.status === 'ativo');

  const openCreateDialog = () => {
    setSelectedCard(null);
    setFormData({ 
      name: '', 
      lastFourDigits: '', 
      closingDay: 15, 
      dueDay: 25, 
      defaultBankAccountId: null 
    });
    setDialogOpen(true);
  };

  const openEditDialog = (card: CreditCardType) => {
    setSelectedCard(card);
    setFormData({ 
      name: card.name, 
      lastFourDigits: card.lastFourDigits,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      defaultBankAccountId: card.defaultBankAccountId,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.lastFourDigits || formData.lastFourDigits.length !== 4) {
      toast.error('Informe os 4 últimos dígitos do cartão');
      return;
    }

    if (selectedCard) {
      updateCreditCard(selectedCard.id, formData);
      toast.success('Cartão atualizado com sucesso');
    } else {
      addCreditCard({ ...formData, status: 'ativo' });
      toast.success('Cartão criado com sucesso');
    }
    setDialogOpen(false);
  };

  const handleArchive = () => {
    if (selectedCard) {
      archiveCreditCard(selectedCard.id);
      toast.success('Cartão arquivado com sucesso');
      setArchiveDialogOpen(false);
      setSelectedCard(null);
    }
  };

  const handleReactivate = (card: CreditCardType) => {
    updateCreditCard(card.id, { status: 'ativo' });
    toast.success('Cartão reativado com sucesso');
  };

  const getAccountName = (id: string | null) => {
    if (!id) return '-';
    return bankAccounts.find(a => a.id === id)?.name || '-';
  };

  const columns: Column<CreditCardType>[] = [
    {
      key: 'name',
      header: 'Cartão',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium">{c.name}</span>
            <p className="text-xs text-muted-foreground">**** {c.lastFourDigits}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'closingDay',
      header: 'Fechamento',
      render: (c) => `Dia ${c.closingDay}`,
    },
    {
      key: 'dueDay',
      header: 'Vencimento',
      render: (c) => `Dia ${c.dueDay}`,
    },
    {
      key: 'defaultAccount',
      header: 'Conta Padrão',
      render: (c) => getAccountName(c.defaultBankAccountId),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <StatusBadge variant={c.status === 'ativo' ? 'success' : 'default'}>
          {c.status === 'ativo' ? 'Ativo' : 'Arquivado'}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (c) => format(c.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(c);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {c.status === 'ativo' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCard(c);
                setArchiveDialogOpen(true);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleReactivate(c);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeCards = creditCards.filter(c => c.status === 'ativo');
  const archivedCards = creditCards.filter(c => c.status === 'arquivado');

  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões compartilhados entre empresas</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Active Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ativos ({activeCards.length})</h2>
        <DataTable
          columns={columns}
          data={activeCards}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhum cartão ativo"
        />
      </div>

      {/* Archived Cards */}
      {archivedCards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Arquivados ({archivedCards.length})
          </h2>
          <DataTable
            columns={columns}
            data={archivedCards}
            keyExtractor={(c) => c.id}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome/Apelido</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Visa Empresarial"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
              <Input
                id="lastFourDigits"
                value={formData.lastFourDigits}
                onChange={(e) => setFormData(prev => ({ ...prev, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="0000"
                maxLength={4}
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closingDay">Dia de Fechamento</Label>
                <Select
                  value={formData.closingDay.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, closingDay: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-60">
                    {dayOptions.map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia de Vencimento</Label>
                <Select
                  value={formData.dueDay.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dueDay: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-60">
                    {dayOptions.map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultAccount">Conta Padrão para Pagamento</Label>
              <Select
                value={formData.defaultBankAccountId || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, defaultBankAccountId: value || null }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {activeAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {selectedCard ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Cartão</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCard && !canDeleteCreditCard(selectedCard.id)
                ? 'Este cartão possui lançamentos vinculados e não pode ser excluído. Deseja arquivá-lo?'
                : 'Tem certeza que deseja arquivar este cartão?'}
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
