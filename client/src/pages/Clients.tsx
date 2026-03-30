import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, Car } from 'lucide-react';
import ClientModal from '../components/ClientModal';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { Client } from '../types';

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients = [], isLoading } = useClients();
  const deleteMutation = useDeleteClient();

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document && c.document.includes(searchTerm))
  );

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Carregando clientes...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Users className="text-brand-600 dark:text-brand-400" size={32} />
            Meus Clientes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão e histórico de contatos.</p>
        </div>
        
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 dark:shadow-none flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Adicionar Cliente
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-card border border-slate-100 dark:border-slate-800 mb-8 flex items-center gap-4 transition-colors duration-300">
        <Search className="text-slate-400 dark:text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF/CNPJ..."
          className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-card border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900 transition-all group relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => handleEdit(client)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-all"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(client.id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"><Trash2 size={16} /></button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center font-black text-xl mb-4">
                {client.name.charAt(0)}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{client.name}</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{client.document || 'CPF/CNPJ NÃO INFORMADO'}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                <Phone size={14} className="text-slate-400 dark:text-slate-500" />
                {client.phone || '(00) 00000-0000'}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                <span className="truncate">{client.email || 'E-mail não cadastrado'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
                <span className="truncate">{client.address || 'Endereço não informado'}</span>
              </div>
            </div>

            {client.observation && (
              <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Car size={12} className="text-brand-600 dark:text-brand-400" />
                  Veículo / Placa
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">{client.observation}</p>
              </div>
            )}
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300 font-bold italic">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingClient} 
      />
    </div>
  );
};

export default Clients;
