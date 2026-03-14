import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface DREData {
  grossRevenue: number;
  variableCosts: number;
  grossProfit: number;
  fixedExpenses: number;
  netProfit: number;
}

const DRE = () => {
  const [dre, setDre] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dre', { params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } })
      .then(res => setDre(response.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch logic fix (correcting the response variable)
  const fetchDRE = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dre', { 
        params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } 
      });
      setDre(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDRE(); }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!dre) return <div className="p-8 text-center text-slate-400">Nenhum dado encontrado.</div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-brand-600 mb-2">
          <FileText size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Resultado do Período</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">DRE Comercial</h1>
      </header>

      <div className="max-w-4xl bg-white rounded-[32px] shadow-card border border-slate-100/50 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-50">
            <DRERow label="Faturamento Bruto (Vendas)" value={dre.grossRevenue} type="income" icon={<PlusCircle size={18} />} isMain />
            <DRERow label="(-) Custos de Mercadorias / Impostos" value={dre.variableCosts} type="expense" indent />
            <DRERow label="(=) Lucro Bruto / Margem" value={dre.grossProfit} type="neutral" isBold />
            <DRERow label="(-) Despesas Operacionais / Aluguel" value={dre.fixedExpenses} type="expense" indent />
            <tr className="bg-slate-900 text-white font-black">
              <td className="px-8 py-6 flex items-center gap-3">
                <div className="p-2 bg-brand-600 text-white rounded-lg"><TrendingUp size={18} /></div>
                (=) Lucro Líquido Final
              </td>
              <td className="px-8 py-6 text-right text-xl">{formatCurrency(dre.netProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DRERow = ({ label, value, type, indent, isMain, isBold }: any) => (
  <tr className={isMain ? "bg-emerald-50/20" : ""}>
    <td className={`px-8 py-5 ${indent ? 'pl-16 text-slate-500' : 'font-bold text-slate-900'} ${isBold ? 'font-black' : ''}`}>
      {label}
    </td>
    <td className={`px-8 py-5 text-right font-bold ${type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-500' : 'text-slate-900'}`}>
      {formatCurrency(value)}
    </td>
  </tr>
);

export default DRE;
