import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAlerts } from '../context/AlertsContext';
import { 
  Zap, 
  BarChart3, 
  Receipt, 
  Bell, 
  User 
} from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, unpaidCount = 0 }) => {
  const { t } = useLanguage();
  const { unreadCount: clientUnread } = useAlerts();

  const tabs = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: Zap,
      badge: null
    },
    {
      id: 'analytics',
      label: t.nav.analytics,
      icon: BarChart3,
      badge: null
    },
    {
      id: 'invoices',
      label: t.nav.invoices,
      icon: Receipt,
      badge: unpaidCount > 0 ? unpaidCount : null,
      badgeColor: 'bg-[#3B82F6] text-white shadow-[#3B82F6]/40'
    },
    {
      id: 'alerts',
      label: t.nav.alerts,
      icon: Bell,
      badge: clientUnread > 0 ? clientUnread : null,
      badgeColor: 'bg-[#3B82F6] text-white shadow-[#3B82F6]/40'
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: User,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto border-t border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl px-2 py-2 shadow-2xl transition-colors">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${
                isActive ? 'bg-blue-500/15 scale-110 shadow-sm shadow-blue-500/20' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className={`absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-md ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[62px] ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
