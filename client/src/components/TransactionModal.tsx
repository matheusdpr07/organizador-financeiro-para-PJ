import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle } from 'lucide-react';

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

  const fetchSetupData = async () => {
    try {
      console.log("Buscando categorias e centros de custo...");
      const [catsRes, centersRes] = await Promise.all([
        axios.get('http://localhost:3001/api/setup/categories'),
        axios.get('http://localhost:3001/api/setup/cost-centers')
      ]);
      
      console.log("Categorias recebidas:", catsRes.data.length);
      setCategories(catsRes.data);
      setCostCenters(centersRes.data);

      // Se for novo registro e não tiver categoria selecionada
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
          amount: initialData.amount.toString(),
          date: new Date(initialData.date).toISOString().split('T')[0],
          type: initialData.type,
          categoryId: initialData.categoryId,
          costCenterId: initialData.costCenterId || '',
          status: initialData.status
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
        amount: parseFloat(formData.amount),
        companyId: 'demo-company-id'
      };
      
      if (initialData?.id) {
        await axios.put(`http://localhost:3001/api/transactions/${initialData.id}`, payload);
      } else {
        await axios.post('http://localhost:3001/api/transactions', payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao registrar transação. Verifique se todos os campos estão preenchidos.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
        <header className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Preencha os campos abaixo com as informações da conta.</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.type === 'INCOME' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Venda / Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Compra / Saída
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
              <input
                required
                type="text"
                placeholder="Ex: Pagamento Fornecedor X"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-medium"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-bold"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data</label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-semibold"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                <select
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-semibold"
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                <select
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-semibold"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'PAID' | 'PENDING' })}
                >
                  <option value="PAID">Pago / Recebido</option>
                  <option value="PENDING">Pendente (Vencimento)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Centro de Custo</label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 font-semibold"
                value={formData.costCenterId}
                onChange={e => setFormData({ ...formData, costCenterId: e.target.value })}
              >
                <option value="">Nenhum</option>
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={20} />
              {initialData ? 'Atualizar Alterações' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
