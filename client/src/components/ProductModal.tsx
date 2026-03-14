import React, { useEffect, useState } from 'react';
import { X, Save, Package, Hash, BarChart3, DollarSign, Tag } from 'lucide-react';
import api from '../services/api';

const ProductModal = ({ isOpen, onClose, onSuccess, initialData }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    costPrice: '',
    salePrice: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          sku: initialData.sku || '',
          quantity: initialData.quantity.toString(),
          costPrice: initialData.costPrice.toString(),
          salePrice: initialData.salePrice.toString()
        });
      } else {
        setFormData({ name: '', sku: '', quantity: '', costPrice: '', salePrice: '' });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await api.put(`/inventory/${initialData.id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao salvar produto");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <header className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{initialData ? 'Editar Peça' : 'Nova Peça'}</h2>
            <p className="text-slate-500 text-sm font-medium">Controle de preços e quantidade em estoque.</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
              <input 
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                placeholder="Nome da Peça / Produto"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                  placeholder="Código / SKU"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  required
                  type="number"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                  placeholder="Qtd em Estoque"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Preço de Custo (R$)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                  placeholder="0,00"
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-emerald-600">Preço de Venda (R$)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full px-6 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all text-sm font-bold text-slate-900"
                  placeholder="0,00"
                  value={formData.salePrice}
                  onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 px-6 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={20} /> {initialData ? 'Atualizar Peça' : 'Salvar no Estoque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
