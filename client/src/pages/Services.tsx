import React, { useEffect, useState } from 'react';
import { Plus, Wrench, Clock, CheckCircle2, ChevronRight, UserPlus, Search, FileText, Trash2 } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateServiceReceipt } from '../utils/serviceExportUtils';
import ServiceOrderModal from '../components/ServiceOrderModal';
import { useAuth } from '../contexts/AuthContext';

const Services = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/services/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleFinalize = async (id: number) => {
    if (confirm("Deseja finalizar esta Ordem de Serviço? Isso gerará um lançamento no seu financeiro.")) {
      try {
        await api.patch(`/services/orders/${id}/finalize`);
        fetchOrders();
      } catch (err) {
        alert("Erro ao finalizar OS");
      }
    }
  };

  const handlePrint = (os: any) => {
    generateServiceReceipt(os, user?.name || 'Oficina PJ');
  };

  const handleSelectOrder = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedOrders([...selectedOrders, id]);
    } else {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;
    if (confirm(`Deseja excluir ${selectedOrders.length} Ordens de Serviço selecionadas?`)) {
      try {
        await api.delete('/services/orders', { data: { ids: selectedOrders } });
        fetchOrders();
        setSelectedOrders([]);
      } catch (err) {
        alert("Erro ao excluir Ordens de Serviço");
      }
    }
  };

  const handleDeleteIndividual = async (id: number) => {
    if (confirm("Deseja excluir esta Ordem de Serviço?")) {
      try {
        await api.delete(`/services/orders/${id}`);
        fetchOrders();
      } catch (err) {
        alert("Erro ao excluir Ordem de Serviço");
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 mb-2">
            <Wrench size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Oficina & Manutenção</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie os trabalhos e emissões para seus clientes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedOrders.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 bg-rose-600 px-6 py-3 rounded-2xl hover:bg-rose-700 transition-all font-bold text-sm text-white shadow-xl shadow-rose-100 active:scale-95"
            >
              <Trash2 size={18} /> Excluir ({selectedOrders.length})
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 px-6 py-3 rounded-2xl hover:bg-brand-700 transition-all font-bold text-sm text-white shadow-xl shadow-brand-100 active:scale-95"
          >
            <Plus size={18} /> Nova OS
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((os: any) => (
          <div key={os.id} className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 group hover:border-brand-100 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={selectedOrders.includes(os.id)}
                    onChange={e => handleSelectOrder(os.id, e.target.checked)}
                  />
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl font-black text-xs uppercase">OS #{os.id}</div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                  os.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : 
                  os.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {os.status === 'OPEN' ? 'Aberta' : os.status === 'PAID' ? 'Finalizada' : os.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900 font-black text-lg truncate">{os.client.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{os.client.observation || 'Sem veículo inf.'}</p>
                </div>

                <div className="py-4 border-y border-slate-50 space-y-2">
                  <p className="text-slate-500 text-[13px] font-medium leading-relaxed italic line-clamp-2">
                    "{os.description || 'Nenhuma observação técnica descrita.'}"
                  </p>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-slate-900">{formatCurrency(os.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {os.status === 'OPEN' && (
                <button 
                  onClick={() => handleFinalize(os.id)}
                  className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-xs font-black hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={14} /> Finalizar
                </button>
              )}
              {os.status === 'PAID' && (
                <div className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 size={14} /> Recebido
                </div>
              )}
              <button 
                onClick={() => handlePrint(os)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" 
                title="Gerar Recibo PDF"
              >
                <FileText size={18} />
              </button>
              <button 
                onClick={() => handleDeleteIndividual(os.id)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                title="Excluir OS"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4">
            <Wrench size={48} />
            <p className="font-bold uppercase text-xs tracking-widest">Nenhuma OS em andamento</p>
          </div>
        )}
      </div>

      <ServiceOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchOrders} 
      />
    </div>
  );
};

export default Services;
