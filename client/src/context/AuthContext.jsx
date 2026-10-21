import { createContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { mockUser } from '../lib/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with no user; in mock mode loading is false initially, otherwise true until /auth/me finishes
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    // In mock mode, skip network verification without invoking setState in effect
    if (USE_MOCK) {
      return;
    }

    let ignore = false;

    // Verify session on mount via HTTP-only cookie
    api
      .get('/auth/me')
      .then((res) => {
        if (!ignore) {
          setUser(res.data.user ?? res.data);
        }
      })
      .catch(() => {
        // Any error (including 401 unauthenticated) means no active session
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        // Guarantee loading state completes once the request finishes
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    if (USE_MOCK) {
      setUser(mockUser);
      return mockUser;
    }

    // Errors propagate up so caller/form can handle err.response?.data?.message
    const res = await api.post('/auth/login', { email, password });
    const loggedInUser = res.data.user ?? res.data;
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, username, email, password) => {
    if (USE_MOCK) {
      setUser(mockUser);
      return mockUser;
    }

    // Errors propagate up to the caller
    const res = await api.post('/auth/register', {
      name,
      username,
      email,
      password,
    });
    const newUser = res.data.user ?? res.data;
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    if (USE_MOCK) {
      setUser(null);
      return;
    }

    try {
      await api.post('/auth/logout');
    } finally {
      // Clear user state regardless of whether the logout call succeeded
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
