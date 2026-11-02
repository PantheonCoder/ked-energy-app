import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAlerts } from '../context/AlertsContext';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  CheckCheck,
  Calendar,
  X,
  Gauge
} from 'lucide-react';

export const Alerts = () => {
  const { t } = useLanguage();
  const { clientAlerts, markClientAlertRead, markAllClientAlertsRead, dismissAlert } = useAlerts();
  const [apiAlerts, setApiAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(d => {
        if (d.success) setApiAlerts(d.data.alerts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Mark API alert as read
  const handleMarkRead = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) setApiAlerts(data.alerts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    // Mark API alerts as read
    try {
      const res = await fetch('/api/alerts/mark-all-read', { method: 'PATCH' });
      const data = await res.json();
      if (data.success) setApiAlerts(data.alerts);
    } catch (e) {
      console.error(e);
    }
    // Also mark client-side alerts
    markAllClientAlertsRead();
  };

  // Merge client alerts (first) + API alerts
  const allAlerts = [
    ...clientAlerts.map(a => ({ ...a, _isClient: true })),
    ...apiAlerts.map(a => ({ ...a, _isClient: false }))
  ];

  const filteredAlerts = allAlerts.filter(a => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });


  const getAlertIcon = (severity, isClient) => {
    if (isClient) return <Gauge className="w-5 h-5 text-[#3B82F6]" />;
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#3B82F6]" />;
      default:
        return <Info className="w-5 h-5 text-[#3B82F6]" />;
    }
  };

  const getAlertCardClasses = (severity, isRead) => {
    if (isRead) {
      return 'bg-slate-50 dark:bg-[#131F37]/60 border-slate-200 dark:border-slate-800/80 opacity-60';
    }
    switch (severity) {
      case 'critical':
        return 'bg-blue-50/50 dark:bg-[#131F37] border-blue-300 dark:border-blue-500/40 shadow-sm';
      case 'warning':
        return 'bg-blue-50/50 dark:bg-[#131F37] border-blue-300 dark:border-blue-500/40 shadow-sm';
      default:
        return 'bg-blue-50/40 dark:bg-[#131F37] border-blue-200 dark:border-blue-500/30 shadow-sm';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            {t.alerts.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.alerts.sub}
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition self-start sm:self-auto
            bg-white dark:bg-[#131F37] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500/40 shadow-sm"
        >
          <CheckCheck className="w-4 h-4 text-blue-500" />
          <span>{t.alerts.markAllRead}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        {['all', 'critical', 'warning', 'info'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition ${
              filter === f
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {f === 'all' ? 'All Alerts' : f}
          </button>
        ))}
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131F37]">
            {t.alerts.noAlerts}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${getAlertCardClasses(alert.severity, alert.isRead)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 mt-0.5">
                    {getAlertIcon(alert.severity, alert._isClient)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {alert.title}
                      </h4>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      {alert._isClient && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 uppercase">
                          Usage Alert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        {alert.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!alert.isRead && (
                    <button
                      onClick={() => alert._isClient ? markClientAlertRead(alert.id) : handleMarkRead(alert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {alert._isClient && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
