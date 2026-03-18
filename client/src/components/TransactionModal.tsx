import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import api from '../services/api';
import { useCreateTransaction } from '../hooks/useTransactions';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/formatters';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

interface CostCenter {
  id: string;
  name: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const TransactionModal = ({ isOpen, onClose, onSuccess, initialData }: TransactionModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    costCenterId: '',
    status: 'PAID' as 'PAID' | 'PENDING'
  });

  const createMutation = useCreateTransaction();

  const fetchSetupData = async () => {
    try {
      const [catsRes, centersRes] = await Promise.all([
        api.get('/setup/categories'),
        api.get('/setup/cost-centers')
      ]);
      setCategories(catsRes.data);
      setCostCenters(centersRes.data);

      if (!initialData) {
        const firstCat = catsRes.data.find((c: any) => c.type === formData.type);
        if (firstCat) {
          setFormData(prev => ({ ...prev, categoryId: firstCat.id }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do formulário:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSetupData();
      if (initialData) {
        setFormData({
          description: initialData.description,
          amount: formatCurrencyInput((initialData.amount * 100).toString()),
          date: new Date(initialData.date).toISOString().split('T')[0],
          type: initialData.type,
          categoryId: initialData.categoryId,
          costCenterId: initialData.costCenterId || '',
          status: initialData.status
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          type: 'EXPENSE',
          categoryId: '',
          costCenterId: '',
          status: 'PAID'
        });
      }
    }
  }, [isOpen, initialData]);

  const handleTypeChange = (newType: 'INCOME' | 'EXPENSE') => {
    const firstCatOfType = categories.find(c => c.type === newType);
    setFormData({ 
      ...formData, 
      type: newType, 
      categoryId: firstCatOfType ? firstCatOfType.id : '' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseCurrencyInput(formData.amount)
      };
      
      if (initialData?.id) {
        await api.put(`/transactions/${initialData.id}`, payload);
      } else {
        createMutation.mutate(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao registrar transação.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <header className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Preencha os campos abaixo com as informações da conta.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Venda / Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Compra / Saída
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Descrição do Lançamento</label>
              <input
                required
                type="text"
                placeholder="Ex: Pagamento Fornecedor X"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Valor do Lançamento</label>
                <input
                  required
                  type="text"
                  placeholder="R$ 0,00"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-black"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Data</label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Categoria</label>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold cursor-pointer"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {categories.filter(c => c.type === formData.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Status</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold cursor-pointer"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'PAID' | 'PENDING' })}
                >
                  <option value="PAID">Pago / Recebido</option>
                  <option value="PENDING">Pendente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-4 bg-brand-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={18} />
              {initialData ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
