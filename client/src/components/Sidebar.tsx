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
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'DRE', path: '/dre' },
    { icon: Calendar, label: 'Fluxo de Caixa', path: '/cash-flow' },
    { icon: Clock, label: 'Contas Pagar/Rec', path: '/bills' },
    { icon: Target, label: 'Metas', path: '/goals' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col sticky top-0 h-screen overflow-hidden">
      {/* Brand Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-brand-600">
          <div className="p-2 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-100">
            <Wallet size={22} weight="bold" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">Finanças PJ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Gerenciamento</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-50 text-brand-600 shadow-sm shadow-brand-50/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className="text-[13px] font-bold">{item.label}</span>
              </div>
              {isActive && <div className="w-1 h-4 bg-brand-600 rounded-full"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3 group border border-transparent hover:border-slate-200 transition-all cursor-pointer">
          <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-brand-600 border border-slate-200 shadow-sm font-black text-sm">
            {user?.name?.[0] || 'P'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[12px] font-black text-slate-900 truncate leading-tight">{user?.name || 'Empresa PJ'}</span>
            <span className="text-[10px] text-slate-500 font-bold leading-tight">Plano Premium</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all w-full text-left font-bold text-[13px]"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
