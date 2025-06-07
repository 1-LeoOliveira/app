// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado
    const checkAuth = () => {
      const authStatus = localStorage.getItem('admin_auth');
      const userEmail = localStorage.getItem('admin_user');
      
      if (authStatus === 'true' && userEmail) {
        setUser({ email: userEmail, role: 'admin' });
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulação de login (substitua pela chamada real da API)
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar no localStorage
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_user', email);
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        return true;
      } else {
        return false;
      }

    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}