import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { ServiceProvider } from '@/types/financial';
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
import { Plus, Pencil, Archive, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ServiceProviders() {
  const { 
    serviceProviders, 
    addServiceProvider, 
    updateServiceProvider, 
    archiveServiceProvider,
  } = useFinancial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const openCreateDialog = () => {
    setSelectedProvider(null);
    setFormData({ name: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setFormData({ name: provider.name });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (selectedProvider) {
      updateServiceProvider(selectedProvider.id, formData);
      toast.success('Prestador atualizado com sucesso');
    } else {
      addServiceProvider({ ...formData, status: 'ativo' });
      toast.success('Prestador criado com sucesso');
    }
    setDialogOpen(false);
  };

  const handleArchive = (provider: ServiceProvider) => {
    archiveServiceProvider(provider.id);
    toast.success('Prestador arquivado com sucesso');
  };

  const handleReactivate = (provider: ServiceProvider) => {
    updateServiceProvider(provider.id, { status: 'ativo' });
    toast.success('Prestador reativado com sucesso');
  };

  const columns: Column<ServiceProvider>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusBadge variant={p.status === 'ativo' ? 'success' : 'default'}>
          {p.status === 'ativo' ? 'Ativo' : 'Arquivado'}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (p) => format(p.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(p);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {p.status === 'ativo' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleArchive(p);
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
                handleReactivate(p);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeProviders = serviceProviders.filter(p => p.status === 'ativo');
  const archivedProviders = serviceProviders.filter(p => p.status === 'arquivado');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prestadores de Serviço</h1>
          <p className="text-muted-foreground">Gerencie fornecedores e prestadores</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Prestador
        </Button>
      </div>

      {/* Active Providers */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ativos ({activeProviders.length})</h2>
        <DataTable
          columns={columns}
          data={activeProviders}
          keyExtractor={(p) => p.id}
          emptyMessage="Nenhum prestador ativo"
        />
      </div>

      {/* Archived Providers */}
      {archivedProviders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Arquivados ({archivedProviders.length})
          </h2>
          <DataTable
            columns={columns}
            data={archivedProviders}
            keyExtractor={(p) => p.id}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedProvider ? 'Editar Prestador' : 'Novo Prestador'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do prestador"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {selectedProvider ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
