import React, { useEffect, useState } from 'react';
import { X, Save, Plus, Trash2, UserPlus, Search, Package, Wrench } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import ClientModal from './ClientModal';

const ServiceOrderModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    items: [] as any[]
  });
  
  const [newItem, setNewItem] = useState({ 
    description: '', 
    quantity: 1, 
    unitPrice: 0, 
    type: 'SERVICE' as 'SERVICE' | 'PART' 
  });

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/services/clients'),
        api.get('/inventory')
      ]);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados para OS:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setFormData({ clientId: '', description: '', items: [] });
    }
  }, [isOpen]);

  const handleProductSelect = (productId: string) => {
    const product: any = products.find((p: any) => p.id === productId);
    if (product) {
      setNewItem({
        ...newItem,
        description: product.name,
        unitPrice: product.salePrice,
        type: 'PART'
      });
    }
  };

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    setFormData({ ...formData, items: [...formData.items, newItem] });
    setNewItem({ description: '', quantity: 1, unitPrice: 0, type: newItem.type });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || formData.items.length === 0) {
      alert("Selecione um cliente e adicione pelo menos um item.");
      return;
    }
    try {
      await api.post('/services/orders', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao criar Ordem de Serviço");
    }
  };

  if (!isOpen) return null;

  const total = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
          <header className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nova Ordem de Serviço</h2>
              <p className="text-slate-500 text-sm font-medium">Gestão completa de peças e mão de obra.</p>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Seção Cliente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificação do Cliente</label>
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(true)}
                  className="flex items-center gap-1.5 text-brand-600 font-black text-[10px] uppercase hover:text-brand-700 transition-colors"
                >
                  <UserPlus size={14} /> Cadastrar Novo
                </button>
              </div>
              <select
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Selecione o Cliente na base de dados...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.observation ? `(${c.observation})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Seção Problema */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Relato do Problema / Observações</label>
              <textarea
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-medium text-slate-900 h-20 resize-none"
                placeholder="Ex: Cliente relata barulho na suspensão dianteira..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Seção Itens Inteligente */}
            <div className="space-y-6 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Lançamento de Itens</label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Tipo de Item */}
                <div className="md:col-span-3 flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: 'SERVICE' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newItem.type === 'SERVICE' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Wrench size={14} /> Serviço
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: 'PART' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newItem.type === 'PART' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Package size={14} /> Peça
                  </button>
                </div>

                {/* Busca de Peça (Apenas se for PART) ou Descrição Manual */}
                <div className="md:col-span-5">
                  {newItem.type === 'PART' ? (
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-[13px] font-bold text-slate-900 shadow-sm"
                      onChange={e => handleProductSelect(e.target.value)}
                      value=""
                    >
                      <option value="">Buscar peça no estoque...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-600 text-[13px] font-bold text-slate-900 shadow-sm"
                      placeholder="Descrição do serviço..."
                      value={newItem.description}
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  )}
                </div>

                {/* Preço Unitário */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-600 text-[13px] font-black text-slate-900 shadow-sm text-center"
                    placeholder="R$ 0,00"
                    value={newItem.unitPrice || ''}
                    onChange={e => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                  />
                </div>

                <button 
                  type="button"
                  onClick={addItem}
                  className="md:col-span-2 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>

              {/* Tabela de Itens Lançados */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Item / Descrição</th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Tipo</th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Qtd</th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Preço</th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{item.description}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-black text-[8px] uppercase ${item.type === 'PART' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                            {item.type === 'PART' ? 'Peça' : 'Serviço'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-500">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.items.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-300 italic font-medium">O orçamento está vazio. Adicione itens acima.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </form>

          <footer className="p-8 border-t border-slate-50 bg-white flex items-center justify-between sticky bottom-0">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total do Orçamento</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(total)}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all text-sm">Cancelar</button>
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 bg-brand-600 text-white font-black rounded-[20px] hover:bg-brand-700 shadow-xl shadow-brand-100 transition-all active:scale-95 flex items-center gap-3 text-sm"
              >
                <Save size={20} /> Salvar Ordem de Serviço
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal Aninhado de Cadastro de Cliente */}
      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={() => {
          fetchData(); // Recarrega a lista de clientes para incluir o novo
          setIsClientModalOpen(false);
        }} 
      />
    </>
  );
};

export default ServiceOrderModal;
