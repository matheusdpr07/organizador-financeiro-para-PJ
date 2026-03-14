import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface CashFlowDay {
  date: string;
  incomes: number;
  expenses: number;
  balance: number;
}

const CashFlow = () => {
  const [data, setData] = useState<CashFlowDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/reports/cash-flow', {
          params: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), companyId: 'demo-company-id' }
        });
        setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar fluxo de caixa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCashFlow();
  }, []);

  if (loading) return <div className="p-8">Carregando Fluxo de Caixa...</div>;

  const totalIncomes = data.reduce((acc, d) => acc + d.incomes, 0);
  const totalExpenses = data.reduce((acc, d) => acc + d.expenses, 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          Fluxo de Caixa Diário
        </h1>
        <p className="text-gray-500">Acompanhamento detalhado de entradas e saídas</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <ArrowUpCircle className="text-green-600 mb-2" />
          <h3 className="text-gray-500 text-sm">Total Entradas</h3>
          <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncomes)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <ArrowDownCircle className="text-red-600 mb-2" />
          <h3 className="text-gray-500 text-sm">Total Saídas</h3>
          <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg">
          <DollarSign className="text-white mb-2" />
          <h3 className="text-blue-100 text-sm font-medium">Saldo do Mês</h3>
          <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncomes - totalExpenses)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Tendência de Saldo Diário</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(date) => date.split('-')[2]} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="balance" stroke="#2563eb" fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dia</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Entradas</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Saídas</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.filter(d => d.incomes > 0 || d.expenses > 0).map((d) => (
              <tr key={d.date} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900">{d.date.split('-').reverse().join('/')}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.incomes)}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-medium">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.expenses)}</td>
                <td className={`px-6 py-4 text-sm font-bold ${d.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlow;
