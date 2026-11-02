import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ked_theme');
    if (saved) return saved;
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('ked_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (document.body) {
        document.body.style.backgroundColor = '#0F172A';
        document.body.style.color = '#FFFFFF';
      }
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (document.body) {
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.color = '#0F172A';
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: true
    };
  }
  return ctx;
};

