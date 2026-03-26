import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DRE from './pages/DRE';
import CashFlow from './pages/CashFlow';
import Bills from './pages/Bills';
import Login from './pages/Login';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Inventory from './pages/Inventory';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { signed, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!signed) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto transition-all duration-500">
        <div className="container-fluid mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/dre" element={<ProtectedLayout><DRE /></ProtectedLayout>} />
          <Route path="/cash-flow" element={<ProtectedLayout><CashFlow /></ProtectedLayout>} />
          <Route path="/bills" element={<ProtectedLayout><Bills /></ProtectedLayout>} />
          <Route path="/services" element={<ProtectedLayout><Services /></ProtectedLayout>} />
          <Route path="/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/goals" element={<ProtectedLayout><div className="p-8">Página de Metas em construção...</div></ProtectedLayout>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
