import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cozycacoon_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('cozycacoon_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cozycacoon_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cozycacoon_user');
    }
    
    if (token) {
      localStorage.setItem('cozycacoon_token', token);
    } else {
      localStorage.removeItem('cozycacoon_token');
    }
  }, [user, token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
