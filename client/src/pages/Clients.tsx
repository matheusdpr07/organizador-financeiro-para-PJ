import React, { useEffect, useState } from 'react';
import { Plus, Users, Search, Edit2, Trash2, Phone, Mail, CarFront, MapPin } from 'lucide-react';
import api from '../services/api';
import ClientModal from '../components/ClientModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    try {
      const res = await api.get('/services/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      try {
        await api.delete(`/services/clients/${id}`);
        fetchClients();
      } catch (err) {
        alert("Erro ao excluir cliente");
      }
    }
  };

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.observation && c.observation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Base de Contatos</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 text-sm font-medium">Cadastre e gerencie os proprietários e seus veículos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
            <input 
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold w-64 shadow-sm"
              placeholder="Buscar por nome ou placa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-600 px-6 py-3 rounded-2xl hover:bg-brand-700 transition-all font-bold text-sm text-white shadow-xl shadow-brand-100 active:scale-95"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client: any) => (
          <div key={client.id} className="bg-white p-8 rounded-[32px] shadow-card border border-slate-100 group hover:border-brand-100 transition-all relative overflow-hidden">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-14 w-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-xl border border-brand-100/50 shadow-sm">
                    {client.name[0]}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingClient(client); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-900 font-black text-xl truncate">{client.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-emerald-600">
                    <CarFront size={14} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{client.observation || 'VEÍCULO NÃO INFORMADO'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={14} className="text-slate-300" />
                    <span className="text-xs font-bold">{client.phone || '(00) 00000-0000'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail size={14} className="text-slate-300" />
                    <span className="text-xs font-bold truncate">{client.email || 'cliente@sem-email.com'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={14} className="text-slate-300" />
                    <span className="text-xs font-bold truncate">{client.address || 'Endereço não cadastrado'}</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-brand-100">
                Ver Histórico de Serviços
              </button>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4">
            <Users size={48} className="opacity-20" />
            <p className="font-bold uppercase text-[10px] tracking-[0.2em]">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchClients} 
        initialData={editingClient}
      />
    </div>
  );
};

export default Clients;
