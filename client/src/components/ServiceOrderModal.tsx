import React, { useEffect, useState } from 'react';
import { X, Save, Plus, Trash2, UserPlus, Search, Package, Wrench } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../utils/formatters';
import ClientModal from './ClientModal';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceOrderModal = ({ isOpen, onClose, onSuccess }: ServiceOrderModalProps) => {
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
    unitPrice: '', // Agora como string para a máscara
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
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const addItem = () => {
    const price = parseCurrencyInput(newItem.unitPrice);
    if (!newItem.description || price <= 0) return;
    
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem, unitPrice: price, totalPrice: newItem.quantity * price }]
    });
    setNewItem({ description: '', quantity: 1, unitPrice: '', type: 'SERVICE' });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
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
      setFormData({ clientId: '', description: '', items: [] });
    } catch (err) {
      alert("Erro ao criar Ordem de Serviço");
    }
  };

  const totalOS = formData.items.reduce((acc, item) => acc + item.totalPrice, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors duration-300">
          <header className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Wrench className="text-brand-600" size={28} />
                Nova Ordem de Serviço
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Registre serviços e peças aplicadas ao veículo/cliente.</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Seleção de Cliente */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente / Veículo</label>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase flex items-center gap-1 hover:underline"
                  >
                    <UserPlus size={12} /> Novo Cliente
                  </button>
                </div>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold cursor-pointer"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.observation || 'Sem veículo'})</option>
                  ))}
                </select>
              </div>

              {/* Observações Gerais */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Observações Técnicas</label>
                <input
                  type="text"
                  placeholder="Ex: Barulho na suspensão, Troca de óleo..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Lançamento de Itens */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Adicionar Itens (Serviços e Peças)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Tipo */}
                <div className="md:col-span-2">
                  <select
                    className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-600 text-xs font-black text-slate-900 dark:text-white"
                    value={newItem.type}
                    onChange={e => setNewItem({ ...newItem, type: e.target.value as 'SERVICE' | 'PART', description: '', unitPrice: '' })}
                  >
                    <option value="SERVICE">SERVIÇO</option>
                    <option value="PART">PEÇA</option>
                  </select>
                </div>

                {/* Descrição */}
                <div className="md:col-span-5">
                  <input
                    className={`w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 ${newItem.type === 'PART' ? 'focus:border-emerald-500' : 'focus:border-brand-600'}`}
                    placeholder={newItem.type === 'PART' ? "Nome da peça..." : "Descrição do serviço..."}
                    value={newItem.description}
                    list="product-suggestions"
                    onChange={e => {
                      const val = e.target.value;
                      setNewItem(prev => {
                        const updated = { ...prev, description: val };
                        if (prev.type === 'PART') {
                          const product: any = products.find((p: any) => p.name === val);
                          if (product) {
                            updated.unitPrice = formatCurrencyInput((product.salePrice * 100).toString());
                          }
                        }
                        return updated;
                      });
                    }}
                  />
                  <datalist id="product-suggestions">
                    {products.map((p: any) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                {/* Qtd */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-600 text-xs font-black text-slate-900 dark:text-white"
                    placeholder="Qtd"
                    value={newItem.quantity === 0 ? '' : newItem.quantity}
                    onChange={e => {
                      const val = e.target.value;
                      setNewItem({ ...newItem, quantity: val === '' ? 0 : Number(val) });
                    }}
                  />
                </div>

                {/* Valor */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-600 text-xs font-black text-slate-900 dark:text-white"
                    placeholder="Valor"
                    value={newItem.unitPrice}
                    onChange={e => {
                      const val = e.target.value;
                      setNewItem({ ...newItem, unitPrice: formatCurrencyInput(val) });
                    }}
                  />
                </div>

                {/* Botão Add */}
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full h-full aspect-square md:aspect-auto flex items-center justify-center bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 dark:shadow-none"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>

              {/* Tabela de Itens Adicionados */}
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4 text-center">Tipo</th>
                      <th className="px-6 py-4 text-center">Qtd</th>
                      <th className="px-6 py-4 text-right">Total</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {formData.items.map((item, idx) => (
                      <tr key={idx} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        <td className="px-6 py-4">{item.description}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${item.type === 'PART' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600'}`}>
                            {item.type === 'PART' ? 'Peça' : 'Serviço'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => removeItem(idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-300 dark:text-slate-700 font-bold italic">Nenhum item adicionado ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </form>

          <footer className="p-8 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky bottom-0">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total da Ordem de Serviço</p>
              <p className="text-3xl font-black text-brand-600 dark:text-brand-400 tracking-tighter">{formatCurrency(totalOS)}</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-8 py-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="px-10 py-4 bg-brand-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
              >
                <Save size={20} /> Finalizar e Gerar OS
              </button>
            </div>
          </footer>
        </div>
      </div>

      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={() => {
          fetchData();
          setIsClientModalOpen(false);
        }} 
      />
    </>
  );
};

export default ServiceOrderModal;
