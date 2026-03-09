import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getToken, setToken, removeToken, getUser, setUser as saveUser, removeUser } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // 初始化：从 localStorage 读取用户信息
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    if (savedToken && savedUser) {
      setTokenState(savedToken);
      setUserState(savedUser);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    saveUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  };

  const updateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
