import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Activity, 
  BarChart3, 
  Receipt, 
  Settings, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, unpaidCount = 1 }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: Activity,
      badge: null
    },
    {
      id: 'analytics',
      label: t.nav.analytics,
      icon: BarChart3,
      badge: 'AI'
    },
    {
      id: 'invoices',
      label: t.nav.invoices,
      icon: Receipt,
      badge: unpaidCount > 0 ? `${unpaidCount}` : null,
      badgeColor: 'bg-[#3B82F6]/20 text-white border border-[#3B82F6]/40'
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
      
      {/* Navigation Links */}
      <div className="bg-[#131F37] rounded-2xl p-3 border border-slate-800 shadow-sm">
        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#3B82F6] text-[#FFFFFF] shadow-sm shadow-[#3B82F6]/30'
                    : 'text-slate-300 hover:text-[#FFFFFF] hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#FFFFFF]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-[#FFFFFF]' 
                      : (item.badgeColor || 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Meter Hardware Identity Card */}
      {user && (
        <div className="hidden lg:block bg-[#131F37] text-[#FFFFFF] rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-[11px] font-bold tracking-wider text-[#3B82F6] uppercase">
              Registered Smart Meter
            </span>
          </div>

          <div className="font-mono text-sm font-bold text-[#FFFFFF] tracking-wide mb-1">
            {user.meterNumber}
          </div>

          <div className="text-[11px] text-slate-400 mb-3 truncate">
            {user.meterType || "EDMI Mk10 3-Phase 60A"}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Connection:</span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
              Encrypted Mesh 4G
            </span>
          </div>
        </div>
      )}

    </aside>
  );
};
