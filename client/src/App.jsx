import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AlertsProvider } from './context/AlertsContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Invoices } from './pages/Invoices';
import { Alerts } from './pages/Alerts';
import { SettingsPage } from './pages/Settings';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { Zap } from 'lucide-react';

const MainLayout = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unpaidCount, setUnpaidCount] = useState(2);
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const navigate = (path, replace = false) => {
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    setPathname(path);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin' && !pathname.startsWith('/admin')) {
      window.history.replaceState({}, '', '/admin/grid-monitor');
      setPathname('/admin/grid-monitor');
    } else if (user.role !== 'admin' && pathname.startsWith('/admin')) {
      window.history.replaceState({}, '', '/');
      setPathname('/');
    }
  }, [user, pathname]);

  if (!user) {
    return <Login onNavigate={navigate} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard pathname={pathname} navigate={navigate} />;
  }

  return (
    <div className={`min-h-screen flex justify-center transition-colors duration-200 ${
      isDark ? 'bg-[#070B14]' : 'bg-slate-100'
    }`}>
      
      {/* Mobile App Viewport Container */}
      <div className={`w-full max-w-md min-h-screen flex flex-col transition-colors duration-200 relative shadow-2xl sm:border-x ${
        isDark 
          ? 'bg-[#0F172A] text-[#FFFFFF] sm:border-slate-800/80 shadow-black/80' 
          : 'bg-[#FFFFFF] text-[#0F172A] sm:border-slate-200 shadow-slate-300/40'
      }`}>
        
        {/* Mobile Top App Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Mobile Screen Body (with pb-24 for bottom navigation) */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-24">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'invoices' && <Invoices onRefreshCount={setUnpaidCount} />}
          {activeTab === 'alerts' && <Alerts />}
          {activeTab === 'settings' && <SettingsPage />}

          {/* Compact Mobile Footer Metadata */}
          <div className="pt-8 pb-4 text-center text-[10px] text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1 opacity-70">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#3B82F6]" />
              <span>© 2026 KED • KRG Ministry of Electricity</span>
            </div>
            <span className="font-mono text-[9px]">Erbil Regional Server #04</span>
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unpaidCount={unpaidCount} 
        />

      </div>

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AlertsProvider>
            <MainLayout />
          </AlertsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

