import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Target, 
  Wallet,
  LogOut,
  ChevronRight,
  TrendingUp,
  Building2,
  Clock,
  Settings,
  Wrench,
  Users,
  Package,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wrench, label: 'Ordens de Serviço', path: '/services' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Package, label: 'Estoque de Peças', path: '/inventory' },
    { icon: FileText, label: 'DRE', path: '/dre' },
    { icon: Calendar, label: 'Fluxo de Caixa', path: '/cash-flow' },
    { icon: Clock, label: 'Contas Pagar/Rec', path: '/bills' },
    { icon: Target, label: 'Metas', path: '/goals' },
  ];

  const activeIndex = menuItems.findIndex(item => location.pathname === item.path);

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col sticky top-0 h-screen overflow-hidden transition-colors duration-300">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-brand-600">
          <div className="p-2 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-100">
            <Wallet size={22} />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Finanças PJ</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
          title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-4">Oficina & Loja</p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-300 ease-in-out ${
                isActive 
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-sm shadow-brand-50/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={`transition-colors duration-300 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400'}`} />
                <span className="text-[13px] font-bold">{item.label}</span>
              </div>
              
              {/* Indicador Lateral Suave */}
              <div className={`w-1 h-4 bg-brand-600 dark:bg-brand-400 rounded-full transition-all duration-500 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}></div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex items-center gap-3 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer">
          <div className="h-9 w-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700 shadow-sm font-black text-sm">
            {user?.name?.[0] || 'P'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[12px] font-black text-slate-900 dark:text-slate-100 truncate leading-tight">{user?.name || 'Empresa PJ'}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">Plano Premium</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all w-full text-left font-bold text-[13px]"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
