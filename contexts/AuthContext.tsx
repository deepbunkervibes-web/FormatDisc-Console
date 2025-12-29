/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  role: 'ROOT' | 'GUEST';
  clearance: 'L0' | 'L1' | 'L5';
  sessionStart: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'slavko_session_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Audit Requirement: No hardcoded auto-login.
    // Check for existing session token validity (Simulated async verification)
    const initSession = async () => {
      const token = sessionStorage.getItem(SESSION_KEY);
      if (token) {
        // Simulate validation latency
        await new Promise(r => setTimeout(r, 600));
        setUser({
          id: 'OPERATOR_RESUMED',
          role: 'ROOT',
          clearance: 'L5',
          sessionStart: Date.now()
        });
      }
      setIsLoading(false);
    };

    initSession();
  }, []);

  const login = async (key: string): Promise<boolean> => {
    // Simulate cryptographic handshake latency
    await new Promise(r => setTimeout(r, 1200));

    // In a real backend, this would verify a signature.
    // For this strict frontend architecture, we accept a specific "key" to unlock root.
    if (key === 'auth_root_b1' || key === 'sudo su') {
      const newUser: User = {
        id: `OP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        role: 'ROOT',
        clearance: 'L5',
        sessionStart: Date.now()
      };
      setUser(newUser);
      sessionStorage.setItem(SESSION_KEY, 'valid_token_hash');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};