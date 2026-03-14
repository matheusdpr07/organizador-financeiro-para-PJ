import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextData {
  signed: boolean;
  user: any;
  companyId: string | null;
  login(email: string, pass: string): Promise<void>;
  logout(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@FinPj:user');
    const storagedToken = localStorage.getItem('@FinPj:token');
    const storagedCompanyId = localStorage.getItem('@FinPj:companyId');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
      setCompanyId(storagedCompanyId);
      axios.defaults.headers.Authorization = `Bearer ${storagedToken}`;
    }
    setLoading(false);
  }, []);

  async function login(email: string, pass: string) {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email,
      password: pass,
    });

    const { token, user: userData, companyId: cid } = response.data;

    setUser(userData);
    setCompanyId(cid);
    axios.defaults.headers.Authorization = `Bearer ${token}`;

    localStorage.setItem('@FinPj:user', JSON.stringify(userData));
    localStorage.setItem('@FinPj:token', token);
    localStorage.setItem('@FinPj:companyId', cid);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setCompanyId(null);
    delete axios.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, companyId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
