import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search
} from 'lucide-react';
import { useTransactions, useUpdateTransactionStatus } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction } from '../types';

const Bills = () => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions = [], isLoading } = useTransactions();
  const updateStatusMutation = useUpdateTransactionStatus();

  const handleMarkAsPaid = async (id: string) => {
    if (confirm("Deseja marcar esta conta como paga?")) {
      updateStatusMutation.mutate({ id, status: 'PAID', paymentDate: new Date().toISOString() });
    }
  };

  const filteredBills = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const matchesFilter = filter === 'ALL' || t.status === filter;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchTerm]);

  const projectedBalance = useMemo(() => {
    return filteredBills
      .filter((b: Transaction) => b.status === 'PENDING')
      .reduce((acc: number, b: Transaction) => b.type === 'INCOME' ? acc + b.amount : acc - b.amount, 0);
  }, [filteredBills]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50/30 dark:bg-slate-950">
      <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950 min-h-screen space-y-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Compromissos</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Contas a Pagar e Receber</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Não perca o prazo de nenhum vencimento importante.</p>
        </div>

        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          {(['PENDING', 'PAID', 'ALL'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {f === 'PENDING' ? 'PENDENTES' : f === 'PAID' ? 'PAGAS' : 'TODAS'}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors">
        <Search className="text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por descrição..."
          className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredBills.map((bill) => {
                const isOverdue = new Date(bill.date) < new Date() && bill.status === 'PENDING';
                return (
                  <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          <Calendar size={16} />
                        </div>
                        <span className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {formatDate(bill.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-slate-100 font-bold">{bill.description}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{bill.category?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      {bill.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full font-black text-[10px] uppercase">
                          <ArrowUpCircle size={12} /> A RECEBER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full font-black text-[10px] uppercase">
                          <ArrowDownCircle size={12} /> A PAGAR
                        </span>
                      )}
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${bill.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {bill.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className="px-4 py-2 bg-brand-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 dark:shadow-none active:scale-95"
                        >
                          {bill.type === 'INCOME' ? 'Receber' : 'Pagar'}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase">
                          <CheckCircle2 size={16} /> Liquidado
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 dark:text-slate-600 font-bold italic uppercase tracking-widest">
                    Nenhuma conta encontrada neste filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Resumo de Projeção Rápida */}
      <div className="bg-brand-600 dark:bg-brand-700 p-8 rounded-[40px] shadow-2xl shadow-brand-100 dark:shadow-none flex flex-col md:flex-row items-center justify-between text-white gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Saldo Projetado de Vencimentos</h3>
            <p className="text-brand-100 text-sm font-medium opacity-80">Considerando todos os compromissos pendentes acima.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tracking-tighter">
            {formatCurrency(projectedBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bills;
