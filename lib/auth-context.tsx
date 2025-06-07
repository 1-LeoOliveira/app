// lib/auth-context.tsx - Versão com Debug
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token salvo ao inicializar
  useEffect(() => {
    console.log('[AuthContext] 🎬 Inicializando...');
    verificarTokenSalvo();
  }, []);

  const verificarTokenSalvo = async () => {
    try {
      console.log('[AuthContext] 🔍 Verificando token salvo...');
      const tokenSalvo = localStorage.getItem('adminToken');
      
      if (!tokenSalvo) {
        console.log('[AuthContext] ❌ Nenhum token encontrado');
        setIsLoading(false);
        return;
      }

      console.log('[AuthContext] 🔑 Token encontrado, verificando validade...');
      
      const response = await fetch('/api/auth/verificar', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenSalvo}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[AuthContext] 📡 Status da verificação:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] ✅ Token válido:', data);
        
        setToken(tokenSalvo);
        setUser(data.user);
      } else {
        console.log('[AuthContext] ❌ Token inválido, removendo...');
        localStorage.removeItem('adminToken');
      }

    } catch (error) {
      console.error('[AuthContext] 💥 Erro ao verificar token:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] 🔐 Tentando fazer login...');
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      console.log('[AuthContext] 📡 Status do login:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] ✅ Login bem-sucedido:', data);

        // Salvar token
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setUser(data.user);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('[AuthContext] ❌ Erro no login:', errorData);
        return false;
      }

    } catch (error) {
      console.error('[AuthContext] 💥 Erro na requisição de login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] 🚪 Fazendo logout...');
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user && !!token;

  console.log('[AuthContext] 📊 Estado atual:', {
    user: user?.email || 'null',
    hasToken: !!token,
    isAuthenticated,
    isLoading
  });

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}