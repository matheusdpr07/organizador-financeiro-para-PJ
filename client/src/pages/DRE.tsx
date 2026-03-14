import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, ArrowDown, ArrowUp, Info } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface DREData {
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  directCosts: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  financialResult: number;
  netProfit: number;
}

const DRE = () => {
  const [dre, setDre] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50/30">
      <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!dre) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum dado financeiro encontrado.</div>;

  const calculatePercent = (value: number) => {
    if (dre.grossRevenue === 0) return '0.0%';
    return ((value / dre.grossRevenue) * 100).toFixed(1) + '%';
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 mb-2">
            <FileText size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Relatório de Performance</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">DRE Profissional</h1>
          <p className="text-slate-500 text-sm font-medium">Demonstrativo de Resultados do Exercício (Padrão Contábil)</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <CalendarIcon className="text-slate-400" size={16} />
          <span className="text-xs font-bold text-slate-600 uppercase">{new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      <div className="max-w-5xl bg-white rounded-[40px] shadow-card border border-slate-100/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrutura de Resultados</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor (R$)</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">% Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* RECEITA BRUTA */}
            <DRERow label="RECEITA BRUTA DE VENDAS" value={dre.grossRevenue} percent="100%" isMain />
            
            {/* DEDUÇÕES */}
            <DRERow label="(-) Impostos e Deduções de Vendas" value={dre.deductions} percent={calculatePercent(dre.deductions)} type="negative" indent />
            
            {/* RECEITA LÍQUIDA */}
            <DRERow label="(=) RECEITA OPERACIONAL LÍQUIDA" value={dre.netRevenue} percent={calculatePercent(dre.netRevenue)} isSubtotal />
            
            {/* CMV */}
            <DRERow label="(-) Custos de Mercadorias / CMV" value={dre.directCosts} percent={calculatePercent(dre.directCosts)} type="negative" indent />
            
            {/* LUCRO BRUTO */}
            <DRERow label="(=) LUCRO BRUTO (Margem de Contribuição)" value={dre.grossProfit} percent={calculatePercent(dre.grossProfit)} isSubtotal />
            
            {/* DESPESAS OPERACIONAIS */}
            <DRERow label="(-) Despesas Operacionais (Fixas/Adm)" value={dre.operatingExpenses} percent={calculatePercent(dre.operatingExpenses)} type="negative" indent />
            
            {/* EBITDA */}
            <DRERow label="(=) EBITDA / LAJIDA" value={dre.ebitda} percent={calculatePercent(dre.ebitda)} isSubtotal highlight />
            
            {/* RESULTADO FINANCEIRO */}
            <DRERow label="(+/-) Resultado Financeiro / Tarifas" value={dre.financialResult} percent={calculatePercent(dre.financialResult)} type={dre.financialResult > 0 ? "negative" : "positive"} indent />
            
            {/* LUCRO LÍQUIDO FINAL */}
            <tr className="bg-slate-900 text-white font-black">
              <td className="px-10 py-8 flex items-center gap-4">
                <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-900/20">
                  <TrendingUp size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg tracking-tight">LUCRO LÍQUIDO DO EXERCÍCIO</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resultado Final Após Deduções</span>
                </div>
              </td>
              <td className="px-10 py-8 text-right text-2xl tracking-tighter">{formatCurrency(dre.netProfit)}</td>
              <td className="px-10 py-8 text-right text-lg text-slate-400">{calculatePercent(dre.netProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex gap-4">
          <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm h-fit"><ArrowUp size={20} /></div>
          <div>
            <h4 className="text-emerald-900 font-black text-sm uppercase mb-1 tracking-tight">Ponto de Atenção: Margem</h4>
            <p className="text-emerald-700 text-xs font-medium leading-relaxed">
              Sua margem bruta está em {calculatePercent(dre.grossProfit)}. Isso indica quanto sobra após pagar os produtos para cobrir as despesas fixas.
            </p>
          </div>
        </div>
        <div className="bg-brand-50 border border-brand-100 p-6 rounded-3xl flex gap-4">
          <div className="p-3 bg-white rounded-2xl text-brand-600 shadow-sm h-fit"><Info size={20} /></div>
          <div>
            <h4 className="text-brand-900 font-black text-sm uppercase mb-1 tracking-tight">O que é o EBITDA?</h4>
            <p className="text-brand-700 text-xs font-medium leading-relaxed">
              É o lucro operacional real. Ele mostra se o seu comércio é viável antes de considerar dívidas bancárias ou impostos de renda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DRERow = ({ label, value, percent, type, indent, isMain, isSubtotal, highlight }: any) => {
  const isNegative = type === "negative";
  
  return (
    <tr className={`${isMain ? "bg-slate-50/30" : ""} ${isSubtotal ? "bg-slate-50/50" : ""} ${highlight ? "bg-brand-50/30" : ""} transition-colors hover:bg-slate-50/20`}>
      <td className={`px-10 py-5 ${indent ? 'pl-20 text-slate-500 font-medium' : 'font-bold text-slate-900'} ${isSubtotal || isMain ? 'text-sm' : 'text-[13px]'} tracking-tight`}>
        {label}
      </td>
      <td className={`px-10 py-5 text-right font-black ${isSubtotal ? 'text-slate-900' : isNegative ? 'text-rose-500' : 'text-slate-700'} ${isSubtotal ? 'text-base' : 'text-[13px]'}`}>
        {isNegative && value !== 0 ? '-' : ''} {formatCurrency(Math.abs(value))}
      </td>
      <td className="px-10 py-5 text-right text-xs font-bold text-slate-400">
        {percent}
      </td>
    </tr>
  );
};

const CalendarIcon = ({ className, size }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default DRE;
