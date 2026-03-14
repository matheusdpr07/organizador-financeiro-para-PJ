import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  status: 'PAID' | 'PENDING';
  category: { name: string };
}

const Bills = () => {
  const [bills, setBills] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('PENDING');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/transactions');
      setBills(response.data);
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/transactions/${id}/status`, {
        status: 'PAID'
      });
      fetchBills(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao marcar como pago");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredBills = bills.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  if (loading) return <div className="p-8">Carregando contas...</div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Compromissos</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contas a Pagar e Receber</h1>
          <p className="text-slate-500 mt-2 font-medium">Não perca o prazo de nenhum vencimento importante.</p>
        </div>

        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setFilter('PENDING')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'PENDING' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setFilter('PAID')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'PAID' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pagas
          </button>
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Todas
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBills.map((bill) => {
                const isOverdue = new Date(bill.date) < new Date() && bill.status === 'PENDING';
                return (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Calendar size={16} />
                        </div>
                        <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                          {new Date(bill.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 font-bold">{bill.description}</span>
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">{bill.category.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      {bill.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-[11px]">
                          <ArrowUpCircle size={12} /> A RECEBER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full font-bold text-[11px]">
                          <ArrowDownCircle size={12} /> A PAGAR
                        </span>
                      )}
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${bill.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {bill.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                        >
                          {bill.type === 'INCOME' ? 'Receber' : 'Pagar'}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-green-600 font-bold text-xs">
                          <CheckCircle2 size={16} /> Concluído
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Nenhuma conta encontrada neste filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Resumo de Projeção Rápida */}
      <div className="mt-8 p-6 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-100 flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Saldo Projetado de Vencimentos</h3>
            <p className="text-blue-100 text-sm font-medium opacity-80">Considerando todos os compromissos pendentes acima.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black">
            {formatCurrency(
              filteredBills
                .filter(b => b.status === 'PENDING')
                .reduce((acc, b) => b.type === 'INCOME' ? acc + b.amount : acc - b.amount, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bills;
