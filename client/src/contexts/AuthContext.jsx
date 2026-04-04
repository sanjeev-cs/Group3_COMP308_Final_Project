import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_ME } from '../graphql/queries.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.query({
          query: GET_ME,
          fetchPolicy: 'network-only',
        });
        if (data?.me) {
          setUser(data.me);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    loadUser();
  }, [client]);

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    client.resetStore();
  }, [client]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      });
      if (data?.me) setUser(data.me);
    } catch {
      // Silently fail — user state remains unchanged
    }
  }, [client]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
