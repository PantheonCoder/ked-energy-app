import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAlerts } from '../context/AlertsContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Zap, 
  Bell, 
  LogOut, 
  Globe, 
  Activity,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { t, lang, langCode, setLang } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { unreadCount: clientUnread } = useAlerts();
  const [apiUnreadAlerts, setApiUnreadAlerts] = useState(2);

  const unreadAlerts = apiUnreadAlerts + clientUnread;

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setApiUnreadAlerts(d.data.unreadCount);
        }
      })
      .catch(() => {});
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md transition-colors duration-200">
      <div className="w-full px-3.5 h-14 flex items-center justify-between gap-2">
        
        {/* Brand & Emblem */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#3B82F6] p-0.5 shadow-md shadow-[#3B82F6]/25 shrink-0">
            <div className="w-full h-full bg-[#0F172A] rounded-[8px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#3B82F6] animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#3B82F6] rounded-full border-2 border-white dark:border-[#0F172A] flex items-center justify-center">
              <span className="w-0.5 h-0.5 bg-white rounded-full"></span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-[#FFFFFF]">
              KED
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6]">
              KRG
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ckb' : lang === 'ckb' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#131F37] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#3B82F6]/50 transition shadow-sm"
            title="Switch Language (EU / KU / AB)"
          >
            <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[10px] font-mono">{langCode}</span>
          </button>

          {/* Theme Changer Toggle Icon */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-1.5 rounded-xl border transition shadow-sm bg-slate-100 hover:bg-slate-200 dark:bg-[#131F37] dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] hover:border-[#3B82F6]/40"
            title={isDark ? "Switch to Daylight Theme" : "Switch to Dark Theme"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#3B82F6] transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#3B82F6] transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white hover:bg-white/10 transition border border-transparent hover:border-slate-700"
              title={t.nav.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
