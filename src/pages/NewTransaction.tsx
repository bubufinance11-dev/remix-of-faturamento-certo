import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial } from '@/contexts/FinancialContext';
import { WizardTransactionType, TransactionStatus } from '@/types/financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CreditCard,
  Receipt,
  Settings2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TransactionTypeOption {
  id: WizardTransactionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const transactionTypes: TransactionTypeOption[] = [
  {
    id: 'entrada',
    label: 'Entrada',
    description: 'Receita, pagamento recebido',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'bg-positive/10 text-positive border-positive/30 hover:bg-positive/20',
  },
  {
    id: 'saida',
    label: 'Saída',
    description: 'Despesa, pagamento efetuado',
    icon: <TrendingDown className="h-6 w-6" />,
    color: 'bg-negative/10 text-negative border-negative/30 hover:bg-negative/20',
  },
  {
    id: 'transferencia',
    label: 'Transferência',
    description: 'Entre contas próprias',
    icon: <ArrowRightLeft className="h-6 w-6" />,
    color: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
  },
  {
    id: 'compra_cartao',
    label: 'Compra no Cartão',
    description: 'Despesa parcelada ou à vista',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20',
  },
  {
    id: 'pagamento_fatura',
    label: 'Pagamento de Fatura',
    description: 'Quitar fatura do cartão',
    icon: <Receipt className="h-6 w-6" />,
    color: 'bg-provision/10 text-provision border-provision/30 hover:bg-provision/20',
  },
  {
    id: 'ajuste',
    label: 'Ajuste',
    description: 'Correção de saldo',
    icon: <Settings2 className="h-6 w-6" />,
    color: 'bg-muted text-muted-foreground border-border hover:bg-secondary',
  },
];

export default function NewTransaction() {
  const navigate = useNavigate();
  const { 
    companies, 
    categories, 
    bankAccounts,
    creditCards,
    serviceProviders,
    addTransaction,
  } = useFinancial();

  const [step, setStep] = useState(1);
  const [transactionType, setTransactionType] = useState<WizardTransactionType | null>(null);
  const [isProvision, setIsProvision] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    companyId: '',
    categoryId: '',
    bankAccountId: '',
    creditCardId: '',
    serviceProviderId: '',
    destinationBankAccountId: '',
    installments: 1,
  });

  const activeCompanies = companies.filter(c => c.status === 'ativo');
  const activeCategories = categories.filter(c => c.status === 'ativo');
  const activeBankAccounts = bankAccounts.filter(a => a.status === 'ativo');
  const activeCreditCards = creditCards.filter(c => c.status === 'ativo');
  const activeServiceProviders = serviceProviders.filter(p => p.status === 'ativo');

  const getFilteredCategories = () => {
    if (!transactionType) return activeCategories;
    if (transactionType === 'entrada') {
      return activeCategories.filter(c => c.type === 'receita' || c.type === 'ambos');
    }
    if (['saida', 'compra_cartao'].includes(transactionType)) {
      return activeCategories.filter(c => c.type === 'despesa' || c.type === 'ambos');
    }
    return activeCategories;
  };

  const handleTypeSelect = (type: WizardTransactionType) => {
    setTransactionType(type);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    const amount = parseFloat(formData.amount);
    const status: TransactionStatus = isProvision ? 'provisao' : 'real';
    const baseTransaction = {
      description: formData.description,
      date: new Date(formData.date),
      amount,
      status,
      effectiveDate: null,
      companyId: formData.companyId || null,
      categoryId: formData.categoryId || null,
      serviceProviderId: formData.serviceProviderId || null,
      bankAccountId: formData.bankAccountId || null,
      creditCardId: null as string | null,
      purchaseId: null as string | null,
      installmentNumber: null as number | null,
      totalInstallments: null as number | null,
      installmentDueDate: null as Date | null,
      destinationBankAccountId: null as string | null,
    };

    switch (transactionType) {
      case 'entrada':
        addTransaction({
          ...baseTransaction,
          type: 'income',
        });
        toast.success('Entrada registrada com sucesso');
        break;

      case 'saida':
        addTransaction({
          ...baseTransaction,
          type: 'expense',
        });
        toast.success('Saída registrada com sucesso');
        break;

      case 'transferencia':
        if (!formData.destinationBankAccountId) {
          toast.error('Selecione a conta de destino');
          return;
        }
        addTransaction({
          ...baseTransaction,
          type: 'transfer',
          companyId: null,
          categoryId: null,
          destinationBankAccountId: formData.destinationBankAccountId,
        });
        toast.success('Transferência registrada com sucesso');
        break;

      case 'compra_cartao':
        if (!formData.creditCardId) {
          toast.error('Selecione o cartão');
          return;
        }
        const purchaseId = Math.random().toString(36).substring(2, 15);
        const installmentAmount = amount / formData.installments;
        
        for (let i = 1; i <= formData.installments; i++) {
          const dueDate = new Date(formData.date);
          dueDate.setMonth(dueDate.getMonth() + i - 1);
          
          addTransaction({
            ...baseTransaction,
            type: 'expense',
            amount: installmentAmount,
            creditCardId: formData.creditCardId,
            bankAccountId: null,
            purchaseId,
            installmentNumber: i,
            totalInstallments: formData.installments,
            installmentDueDate: dueDate,
          });
        }
        toast.success(`Compra registrada em ${formData.installments}x`);
        break;

      case 'ajuste':
        addTransaction({
          ...baseTransaction,
          type: amount >= 0 ? 'income' : 'expense',
          amount: Math.abs(amount),
          description: `[AJUSTE] ${formData.description}`,
        });
        toast.success('Ajuste registrado com sucesso');
        break;

      default:
        toast.error('Tipo de lançamento não suportado');
        return;
    }

    navigate('/lancamentos');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Qual tipo de lançamento você deseja fazer?
        </h2>
        <p className="text-muted-foreground">
          Escolha o tipo apropriado para que o sistema aplique as regras corretas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactionTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className={cn(
              'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
              type.color
            )}
          >
            {type.icon}
            <div className="text-center">
              <p className="font-semibold">{type.label}</p>
              <p className="text-sm opacity-80">{type.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedType = transactionTypes.find(t => t.id === transactionType);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('p-3 rounded-lg', selectedType?.color.split(' ')[0])}>
            {selectedType?.icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {selectedType?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedType?.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o lançamento..."
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          {/* Company - not for transfers */}
          {transactionType !== 'transferencia' && (
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
                  {activeCompanies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category - not for transfers */}
          {transactionType !== 'transferencia' && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {getFilteredCategories().map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bank account - for income, expense, transfer */}
          {['entrada', 'saida', 'transferencia', 'ajuste'].includes(transactionType || '') && (
            <div className="space-y-2">
              <Label htmlFor="bankAccount">
                {transactionType === 'transferencia' ? 'Conta de Origem' : 'Conta Bancária'}
              </Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bankAccountId: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {activeBankAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Destination account - for transfers */}
          {transactionType === 'transferencia' && (
            <div className="space-y-2">
              <Label htmlFor="destinationAccount">Conta de Destino</Label>
              <Select
                value={formData.destinationBankAccountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, destinationBankAccountId: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {activeBankAccounts
                    .filter(a => a.id !== formData.bankAccountId)
                    .map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Credit card - for card purchases */}
          {transactionType === 'compra_cartao' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="creditCard">Cartão de Crédito</Label>
                <Select
                  value={formData.creditCardId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, creditCardId: value }))}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecione o cartão" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {activeCreditCards.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (****{c.lastFourDigits})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Select
                  value={formData.installments.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-60">
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}x {n === 1 ? '(à vista)' : `de ${(parseFloat(formData.amount || '0') / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Service provider */}
          {['saida', 'compra_cartao'].includes(transactionType || '') && activeServiceProviders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="serviceProvider">Prestador (opcional)</Label>
              <Select
                value={formData.serviceProviderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceProviderId: value }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione o prestador" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {activeServiceProviders.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Provision toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <Label htmlFor="provision" className="font-medium">Provisão</Label>
              <p className="text-sm text-muted-foreground">
                Marque se este lançamento ainda não foi efetivado
              </p>
            </div>
            <Switch
              id="provision"
              checked={isProvision}
              onCheckedChange={setIsProvision}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => {
              setStep(1);
              setTransactionType(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar Lançamento
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/lancamentos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Lançamento</h1>
          <p className="text-muted-foreground">
            {step === 1 ? 'Selecione o tipo de lançamento' : 'Preencha os dados'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'h-2 flex-1 rounded-full transition-colors',
          step >= 1 ? 'bg-primary' : 'bg-muted'
        )} />
        <div className={cn(
          'h-2 flex-1 rounded-full transition-colors',
          step >= 2 ? 'bg-primary' : 'bg-muted'
        )} />
      </div>

      {/* Content */}
      <div className="financial-card">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
}
