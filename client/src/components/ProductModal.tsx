import React, { useEffect, useState } from 'react';
import { X, Save, Package, Hash, BarChart3, DollarSign, Tag } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const ProductModal = ({ isOpen, onClose, initialData }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    costPrice: 0,
    salePrice: 0
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          sku: initialData.sku || '',
          quantity: initialData.quantity,
          costPrice: initialData.costPrice,
          salePrice: initialData.salePrice
        });
      } else {
        setFormData({
          name: '',
          sku: '',
          quantity: 0,
          costPrice: 0,
          salePrice: 0
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <header className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle seu estoque de peças e insumos.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Nome do Produto / Peça</label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  required
                  type="text"
                  placeholder="Ex: Pastilha de Freio Dianteira"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Código / SKU</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Ex: PF-001"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Quantidade</label>
                <div className="relative group">
                  <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <input
                    required
                    type="number"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-black"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Preço de Custo</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Preço de Venda</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all text-slate-900 dark:text-white font-black"
                    value={formData.salePrice}
                    onChange={e => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-4 bg-brand-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={18} />
              {initialData ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
