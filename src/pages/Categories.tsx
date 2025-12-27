import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Category, CategoryType } from '@/types/financial';
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
import { Plus, Pencil, Archive, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Categories() {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    archiveCategory,
  } = useFinancial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'despesa' as CategoryType,
  });

  const openCreateDialog = () => {
    setSelectedCategory(null);
    setFormData({ name: '', type: 'despesa' });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, type: category.type });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (selectedCategory) {
      updateCategory(selectedCategory.id, formData);
      toast.success('Categoria atualizada com sucesso');
    } else {
      addCategory({ ...formData, status: 'ativo' });
      toast.success('Categoria criada com sucesso');
    }
    setDialogOpen(false);
  };

  const handleArchive = (category: Category) => {
    archiveCategory(category.id);
    toast.success('Categoria arquivada com sucesso');
  };

  const handleReactivate = (category: Category) => {
    updateCategory(category.id, { status: 'ativo' });
    toast.success('Categoria reativada com sucesso');
  };

  const getTypeLabel = (type: CategoryType) => {
    switch (type) {
      case 'receita': return 'Receita';
      case 'despesa': return 'Despesa';
      case 'ambos': return 'Ambos';
    }
  };

  const getTypeVariant = (type: CategoryType) => {
    switch (type) {
      case 'receita': return 'success';
      case 'despesa': return 'error';
      case 'ambos': return 'info';
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Tags className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (c) => (
        <StatusBadge variant={getTypeVariant(c.type) as 'success' | 'error' | 'info'}>
          {getTypeLabel(c.type)}
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
                handleArchive(c);
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

  const activeCategories = categories.filter(c => c.status === 'ativo');
  const archivedCategories = categories.filter(c => c.status === 'arquivado');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize seus lançamentos por categoria</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Active Categories */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ativas ({activeCategories.length})</h2>
        <DataTable
          columns={columns}
          data={activeCategories}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhuma categoria ativa"
        />
      </div>

      {/* Archived Categories */}
      {archivedCategories.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Arquivadas ({archivedCategories.length})
          </h2>
          <DataTable
            columns={columns}
            data={archivedCategories}
            keyExtractor={(c) => c.id}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da categoria"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: CategoryType) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {selectedCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
