import React, { useEffect, useState } from 'react';
import { Plus, Package, Search, Edit2, Trash2, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import ProductModal from '../components/ProductModal';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover esta peça do estoque?")) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Erro ao excluir peça");
      }
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStockValue = products.reduce((acc, p: any) => acc + (p.quantity * p.costPrice), 0);
  const lowStockCount = products.filter((p: any) => p.quantity <= 2).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50/30">
      <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 mb-2">
            <Package size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Almoxarifado</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estoque de Peças</h1>
          <p className="text-slate-500 text-sm font-medium">Controle de peças, acessórios e insumos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
            <input 
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold w-64 shadow-sm"
              placeholder="Buscar peça ou código..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-600 px-6 py-3 rounded-2xl hover:bg-brand-700 transition-all font-bold text-sm text-white shadow-xl shadow-brand-100 active:scale-95"
          >
            <Plus size={18} /> Cadastrar Peça
          </button>
        </div>
      </header>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 flex items-center gap-6">
          <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl"><DollarSign size={24} /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Valor em Estoque (Custo)</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalStockValue)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 flex items-center gap-6">
          <div className={`p-4 rounded-2xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Peças com Estoque Baixo</p>
            <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount} Itens</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-card border border-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peça / Produto</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Custo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Venda</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-900 font-bold">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">SKU: {p.sku || 'SEM COD.'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-lg font-black text-[11px] ${p.quantity <= 2 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                      {p.quantity} un
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-[13px] font-bold text-slate-400">{formatCurrency(p.costPrice)}</td>
                  <td className="px-8 py-5 text-right text-[13px] font-black text-slate-900">{formatCurrency(p.salePrice)}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProducts} 
        initialData={editingProduct}
      />
    </div>
  );
};

export default Inventory;
