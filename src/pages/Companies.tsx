import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Company, CompanyType, Status } from '@/types/financial';
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
import { Plus, Pencil, Archive, Trash2, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Companies() {
  const { 
    companies, 
    addCompany, 
    updateCompany, 
    archiveCompany,
    canDeleteCompany,
  } = useFinancial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'empresa' as CompanyType,
  });

  const openCreateDialog = () => {
    setSelectedCompany(null);
    setFormData({ name: '', type: 'empresa' });
    setDialogOpen(true);
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({ name: company.name, type: company.type });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (selectedCompany) {
      updateCompany(selectedCompany.id, formData);
      toast.success('Empresa atualizada com sucesso');
    } else {
      addCompany({ ...formData, status: 'ativo' });
      toast.success('Empresa criada com sucesso');
    }
    setDialogOpen(false);
  };

  const handleArchive = () => {
    if (selectedCompany) {
      archiveCompany(selectedCompany.id);
      toast.success('Empresa arquivada com sucesso');
      setArchiveDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleReactivate = (company: Company) => {
    updateCompany(company.id, { status: 'ativo' });
    toast.success('Empresa reativada com sucesso');
  };

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${c.type === 'pessoal' ? 'bg-provision/10' : 'bg-primary/10'}`}>
            {c.type === 'pessoal' ? (
              <User className="h-4 w-4 text-provision" />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (c) => (
        <StatusBadge variant={c.type === 'pessoal' ? 'provision' : 'info'}>
          {c.type === 'pessoal' ? 'Pessoal' : 'Empresa'}
        </StatusBadge>
      ),
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
                setSelectedCompany(c);
                if (canDeleteCompany(c.id)) {
                  setArchiveDialogOpen(true);
                } else {
                  setArchiveDialogOpen(true);
                }
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
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeCompanies = companies.filter(c => c.status === 'ativo');
  const archivedCompanies = companies.filter(c => c.status === 'arquivado');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground">Gerencie suas empresas e contas pessoais</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Active Companies */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ativas ({activeCompanies.length})</h2>
        <DataTable
          columns={columns}
          data={activeCompanies}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhuma empresa ativa"
        />
      </div>

      {/* Archived Companies */}
      {archivedCompanies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Arquivadas ({archivedCompanies.length})
          </h2>
          <DataTable
            columns={columns}
            data={archivedCompanies}
            keyExtractor={(c) => c.id}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da empresa"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: CompanyType) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {selectedCompany ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCompany && !canDeleteCompany(selectedCompany.id)
                ? 'Esta empresa possui lançamentos vinculados e não pode ser excluída. Deseja arquivá-la?'
                : 'Tem certeza que deseja arquivar esta empresa?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-warning text-warning-foreground hover:bg-warning/90">
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
