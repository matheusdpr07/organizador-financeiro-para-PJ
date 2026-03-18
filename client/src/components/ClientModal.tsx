import React, { useEffect, useState } from 'react';
import { X, Save, User, FileText, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const ClientModal = ({ isOpen, onClose, initialData }: ClientModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    observation: ''
  });

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          document: initialData.document || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          address: initialData.address || '',
          observation: initialData.observation || ''
        });
      } else {
        setFormData({
          name: '',
          document: '',
          phone: '',
          email: '',
          address: '',
          observation: ''
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <header className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cadastre os dados de contato e identificação do cliente.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Nome Completo / Razão Social</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">CPF / CNPJ</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.document}
                  onChange={e => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Telefone / WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Endereço Completo</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Observação / Veículo (Placa)</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Ex: Toyota Corolla - BRA2E19"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.observation}
                  onChange={e => setFormData({ ...formData, observation: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-4 bg-brand-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={18} />
              {initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
