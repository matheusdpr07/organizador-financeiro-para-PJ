import React, { useEffect, useState } from 'react';
import { X, Save, User, FileText, Phone, Mail, MapPin, Car, Search, Loader2 } from 'lucide-react';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';
import api from '../services/api';

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

  const [vehicleData, setVehicleData] = useState({
    brandModel: '',
    year: '',
    color: '',
    plate: ''
  });

  const [isSearchingPlate, setIsSearchingPlate] = useState(false);

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
        
        const obs = initialData.observation || '';
        const plateMatch = obs.match(/\(Placa: (.*?)\)/);
        setVehicleData({
          brandModel: obs.split(' - ')[0] || '',
          color: obs.split(' - ')[1]?.split(' (')[0] || '',
          year: obs.match(/\((.*?)\)/)?.[1] || '',
          plate: plateMatch ? plateMatch[1] : ''
        });
      } else {
        setFormData({ name: '', document: '', phone: '', email: '', address: '', observation: '' });
        setVehicleData({ brandModel: '', year: '', color: '', plate: '' });
      }
    }
  }, [isOpen, initialData]);

  // Sincroniza dados do veículo com a observação final
  const syncObservation = (v: typeof vehicleData) => {
    if (v.brandModel || v.plate) {
      const summary = `${v.brandModel} - ${v.color} (${v.year}) (Placa: ${v.plate})`;
      setFormData(prev => ({ ...prev, observation: summary }));
    }
  };

  const handlePlateSearch = async (targetPlate: string) => {
    if (targetPlate.length !== 7) return;

    setIsSearchingPlate(true);
    try {
      const response = await api.get(`/proxy/plate/${targetPlate}`);
      const data = response.data;

      if (data && data.marca) {
        const newVehicle = {
          brandModel: `${data.marca} ${data.modelo}`.trim().toUpperCase(),
          year: data.ano.toString(),
          color: data.cor.toUpperCase(),
          plate: targetPlate.toUpperCase()
        };
        setVehicleData(newVehicle);
        syncObservation(newVehicle);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Não foi possível buscar os dados automaticamente.";
      alert(errorMsg);
    } finally {
      setIsSearchingPlate(false);
    }
  };

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
              {initialData ? 'Editar Registro' : 'Novo Registro'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Preencha a placa para buscar os dados automaticamente.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="bg-brand-50/50 dark:bg-brand-900/10 p-8 rounded-[32px] border border-brand-100 dark:border-brand-900/30 space-y-6">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Car size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Veículo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Placa (Busca Automática)</label>
                <div className="relative group">
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="AAA0000"
                    className="w-full pl-5 pr-12 py-4 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-black uppercase tracking-widest"
                    value={vehicleData.plate}
                    onChange={e => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setVehicleData({ ...vehicleData, plate: val });
                      if (val.length === 7) handlePlateSearch(val);
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isSearchingPlate ? <Loader2 className="animate-spin text-brand-600" size={20} /> : <Search className="text-brand-300" size={20} />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Marca / Modelo</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={vehicleData.brandModel}
                  onChange={e => {
                    const next = { ...vehicleData, brandModel: e.target.value };
                    setVehicleData(next);
                    syncObservation(next);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Ano</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                    value={vehicleData.year}
                    onChange={e => {
                      const next = { ...vehicleData, year: e.target.value };
                      setVehicleData(next);
                      syncObservation(next);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Cor</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                    value={vehicleData.color}
                    onChange={e => {
                      const next = { ...vehicleData, color: e.target.value };
                      setVehicleData(next);
                      syncObservation(next);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <User size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Proprietário</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">CPF / CNPJ</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-brand-600/10 focus:border-brand-600 transition-all text-slate-900 dark:text-white font-bold"
                  value={formData.document}
                  onChange={e => setFormData({ ...formData, document: e.target.value })}
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
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
