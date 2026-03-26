import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Target, 
  Wallet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Users,
  Package,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

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
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out z-40`}
    >
      {/* Botão de Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-brand-700 transition-all z-50 active:scale-90 border-2 border-white dark:border-slate-900"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Cabeçalho */}
      <div className="p-6 flex items-center justify-between min-w-max h-20">
        <div className="flex items-center gap-3 text-brand-600">
          <div className="p-2 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-100 shrink-0">
            <Wallet size={22} />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Finanças PJ
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        )}
      </div>

      {/* Menu Principal */}
      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden relative">
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-4 h-4">
            Oficina & Loja
          </p>
        )}
        
        <div className="relative">
          {/* O Destaque Deslizante (Pílula) - Ajustado para ser 100% preciso */}
          {activeIndex !== -1 && (
            <div 
              className="absolute left-0 bg-brand-50 dark:bg-brand-900/30 rounded-xl transition-all duration-300 ease-in-out pointer-events-none border border-brand-100/50 dark:border-brand-500/10"
              style={{ 
                width: '100%',
                height: '44px',
                transform: `translateY(${activeIndex * 48}px)`, // 48px é a altura exata de cada item (44px + 4px gap)
                zIndex: 0
              }}
            />
          )}

          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`flex items-center h-11 group px-3 rounded-xl transition-colors duration-300 relative z-10 mb-1 ${
                  isActive 
                    ? 'text-brand-600 dark:text-brand-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-[13px] font-bold whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
        {isCollapsed && (
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full mb-2"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        )}

        <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex items-center gap-3 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="h-9 w-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700 shadow-sm font-black text-sm shrink-0">
            {user?.name?.[0] || 'P'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[12px] font-black text-slate-900 dark:text-slate-100 truncate leading-tight">{user?.name || 'Empresa PJ'}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">Premium</span>
            </div>
          )}
        </div>

        <button 
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all w-full text-left font-bold text-[13px] ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sair do Sistema</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
