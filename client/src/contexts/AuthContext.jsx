import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_ME } from '../graphql/queries.js';
import useGameStore from '../store/gameStore.js';
import useLiveQuery from '../hooks/useLiveQuery.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const client = useApolloClient();
  const {
    data,
    error,
    refetch,
  } = useLiveQuery(GET_ME, {
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    if (data?.me) {
      setUser(data.me);
      setAuthLoading(false);
      return;
    }

    if (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setAuthLoading(false);
    }
  }, [data, error, token]);

  const login = useCallback((nextToken, userData) => {
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(userData);
    setAuthLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthLoading(false);
    useGameStore.getState().reset();
    client.resetStore();
  }, [client]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const { data: refreshedData } = await refetch();
      if (refreshedData?.me) {
        setUser(refreshedData.me);
      }
    } catch {
      if (!localStorage.getItem('token')) {
        setToken(null);
        setUser(null);
      }
    }
  }, [refetch, token]);

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
