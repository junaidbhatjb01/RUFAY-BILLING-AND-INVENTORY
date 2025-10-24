
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dataOwnerId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addStaff: (email: string, password: string) => Promise<void>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user on initial load
    const checkLoggedIn = () => {
        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem('rufay_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Could not parse user from localStorage', error);
            localStorage.removeItem('rufay_user');
            localStorage.removeItem('rufay_token');
        } finally {
            setIsLoading(false);
        }
    };
    checkLoggedIn();
  }, []);

  const dataOwnerId = user ? (user.role === 'admin' ? user.id : user.adminId) || null : null;

  const login = async (email: string, password: string) => {
    const { user, token } = await api.login(email, password);
    localStorage.setItem('rufay_user', JSON.stringify(user));
    localStorage.setItem('rufay_token', token);
    setUser(user);
  };

  const signup = async (email: string, password: string) => {
    const { user, token } = await api.signup(email, password);
    localStorage.setItem('rufay_user', JSON.stringify(user));
    localStorage.setItem('rufay_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('rufay_user');
    localStorage.removeItem('rufay_token');
    setUser(null);
  };
  
  const addStaff = async (email: string, password: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error("Only admins can add staff.");
    }
    await api.addStaff(user.id, email, password);
  };

  const changeEmail = async (newEmail: string, currentPassword: string) => {
    if (!user) throw new Error("Not logged in");
    const updatedUser = await api.changeEmail(user.id, newEmail, currentPassword);
    localStorage.setItem('rufay_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("Not logged in");
    await api.changePassword(user.id, currentPassword, newPassword);
    // Password changed, no need to update user state as it doesn't contain the password.
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, dataOwnerId, login, signup, logout, addStaff, changeEmail, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
