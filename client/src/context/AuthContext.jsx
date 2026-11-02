import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ked_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ked_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('ked_user', JSON.stringify(user));
      localStorage.setItem('ked_token', token);
    } else {
      localStorage.removeItem('ked_user');
      localStorage.removeItem('ked_token');
    }
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) return;
    fetch('/api/auth/me')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load account profile');
        if (data.user.id === user.id) {
          const { password, ...profile } = data.user;
          setUser(profile);
        }
      })
      .catch((error) => console.error('Unable to refresh account profile:', error));
  }, []);

  const loginDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true, role: data.user.role || 'user' };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server communication error' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true, role: data.user.role || 'user' };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  const updateSettings = async (settingsData) => {
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Unable to update settings' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Unable to contact the server to update settings' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginDemo,
      register,
      updateProfile,
      updateSettings,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
