import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Edit2, Trash2, RefreshCcw, ArrowRight, FileDown, Table
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import TransactionModal from '../components/TransactionModal';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { user } = useAuth();
  const { theme } = useTheme();

  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExportPDF = () => {
    exportToPDF(transactions, `Extrato_${new Date().toLocaleDateString('pt-BR')}`, user?.name || 'Empresa PJ');
  };

  const handleExportExcel = () => {
    exportToExcel(transactions, `Extrato_${new Date().toLocaleDateString('pt-BR')}`);
  };

  // Memoização de cálculos para performance
  const stats = useMemo(() => {
    const income = transactions.filter((t: Transaction) => t.type === 'INCOME' && t.status === 'PAID').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    const expense = transactions.filter((t: Transaction) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => [
    { name: 'Vendas', valor: stats.totalIncome },
    { name: 'Compras', valor: stats.totalExpense },
  ], [stats]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50/30">
      <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-10 space-y-10 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Olá, {user?.name?.split(' ')[0] || 'Empresário'}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Veja como estão as movimentações do seu comércio hoje.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <button 
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-600 px-6 py-3 rounded-2xl hover:bg-brand-700 transition-all font-bold text-sm text-white shadow-xl shadow-brand-100 active:scale-95"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Entradas" value={stats.totalIncome} type="income" label="Vendas" icon={<TrendingUp size={20} />} />
        <StatCard title="Total Saídas" value={stats.totalExpense} type="expense" label="Compras" icon={<TrendingDown size={20} />} />
        <StatCard title="Em Caixa" value={stats.balance} type="balance" label="Saldo Real" icon={<DollarSign size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-card border border-slate-100/50 dark:border-slate-800 transition-colors duration-300">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">Balanço Financeiro</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                <Bar dataKey="valor" radius={[8, 8, 8, 8]} barSize={45}>
                  {chartData.map((_, index) => <Cell key={index} fill={index === 0 ? '#4f46e5' : '#f43f5e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900/50 p-8 rounded-[32px] shadow-premium flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-600/20 rounded-full -mb-24 -mr-24 blur-3xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-brand-600/20 text-brand-400 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Desempenho Comercial</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Resultado comercial {stats.balance >= 0 ? 'positivo' : 'abaixo do esperado'}.</p>
          </div>
          <button className="flex items-center gap-2 text-brand-400 font-bold text-sm hover:text-white transition-all group mt-6 relative z-10">
            Análise detalhada DRE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-card border border-slate-100/50 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Movimentações Recentes</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <FileDown size={16} className="text-rose-500" /> EXPORTAR PDF
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <Table size={16} className="text-emerald-500" /> EXPORTAR EXCEL
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Descrição</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right">Valor</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.slice(0, 15).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-900 dark:text-slate-100 font-bold">{t.description}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formatDate(t.date)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-bold text-[10px] uppercase">{t.category?.name}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className={`mx-auto w-2 h-2 rounded-full ${t.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  </td>
                  <td className={`px-8 py-5 text-[13px] font-black text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(t)} className="p-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} onSuccess={() => {}} initialData={editingTransaction} />
    </div>
  );
  };

  const StatCard = ({ title, value, type, label, icon }: any) => {
    const styles = {
      income: "emerald",
      expense: "rose",
      balance: "brand"
    }[type as "income" | "expense" | "balance"];

    const isBrand = styles === "brand";
    const isExpense = type === "expense";

    return (
      <div className={`${isBrand ? 'bg-brand-600 shadow-premium' : 'bg-white dark:bg-slate-900 shadow-card border border-slate-100/50 dark:border-slate-800 hover:border-' + styles + '-100'} p-6 rounded-3xl flex flex-col justify-between h-40 transition-all duration-300`}>
        <div className="flex justify-between items-start">
          <div className={`p-2.5 ${isBrand ? 'bg-white/20 text-white' : isExpense ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500' : 'bg-' + styles + '-50 dark:bg-' + styles + '-900/20 text-' + styles + '-600 dark:text-' + styles + '-400'} rounded-xl`}>{icon}</div>
          <span className={`text-[10px] font-black ${isBrand ? 'text-white bg-white/20' : isExpense ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : 'text-' + styles + '-600 bg-' + styles + '-50 dark:bg-' + styles + '-900/20'} px-2 py-1 rounded-lg uppercase`}>{label}</span>
        </div>
        <div>
          <p className={`${isBrand ? 'text-brand-100' : 'text-slate-400 dark:text-slate-500'} text-[11px] font-bold uppercase tracking-wider mb-1`}>{title}</p>
          <p className={`text-2xl font-black ${isBrand ? 'text-white' : isExpense ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(value)}</p>
        </div>
      </div>
    );
  };

export default Dashboard;
