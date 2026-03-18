import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import ProductModal from '../components/ProductModal';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { Product } from '../types';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Carregando estoque...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Package className="text-brand-600 dark:text-brand-400" size={32} />
            Gestão de Estoque
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle de peças, acessórios e insumos.</p>
        </div>
        
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 dark:shadow-none flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Cadastrar Produto
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-card border border-slate-100 dark:border-slate-800 mb-8 flex items-center gap-4 transition-colors duration-300">
        <Search className="text-slate-400 dark:text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou código da peça..."
          className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Produto / Peça</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SKU / Código</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Qtd. Atual</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Preço Venda</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Custo: {formatCurrency(p.costPrice)}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-black text-[10px] uppercase">
                      {p.sku || 'SEM SKU'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className={`inline-flex items-center gap-1.5 font-black text-sm ${p.quantity <= 2 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {p.quantity}
                      {p.quantity <= 2 && <AlertTriangle size={14} className="animate-bounce" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(p.salePrice)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p)} className="p-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300 dark:text-slate-700 font-bold italic">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingProduct} 
      />
    </div>
  );
};

export default Inventory;
