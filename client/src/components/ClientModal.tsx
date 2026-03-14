import React, { useEffect, useState } from 'react';
import { X, Save, User, Phone, Mail, MapPin, CarFront } from 'lucide-react';
import api from '../services/api';

const ClientModal = ({ isOpen, onClose, onSuccess, initialData }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    observation: ''
  });

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
        setFormData({ name: '', document: '', phone: '', email: '', address: '', observation: '' });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await api.put(`/services/clients/${initialData.id}`, formData);
      } else {
        await api.post('/services/clients', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao salvar cliente");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <header className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{initialData ? 'Editar Cliente' : 'Novo Cadastro'}</h2>
            <p className="text-slate-500 text-sm font-medium">Informações de contato e veículo do cliente.</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
              <input 
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                placeholder="Nome Completo / Razão Social (Obrigatório)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                  placeholder="Telefone (Opcional)"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <input 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                placeholder="CPF / CNPJ (Opcional)"
                value={formData.document}
                onChange={e => setFormData({ ...formData, document: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
              <input 
                type="email"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                placeholder="E-mail de Contato (Opcional)"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
              <input 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-sm font-bold text-slate-900"
                placeholder="Endereço Completo (Opcional)"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="relative group">
              <CarFront className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
              <textarea 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all text-sm font-bold text-slate-900 h-24 resize-none"
                placeholder="Veículo: Placa, Marca, Modelo... (Opcional)"
                value={formData.observation}
                onChange={e => setFormData({ ...formData, observation: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 px-6 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Save size={20} /> {initialData ? 'Atualizar Dados' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
