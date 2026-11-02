import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { translateAdmin } from '../i18n/adminTranslations';
import {
  Bell,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Moon,
  Network,
  ShieldCheck,
  Sun,
  Settings,
  SlidersHorizontal
} from 'lucide-react';

const settingsSections = [
  { id: 'general', label: 'General System', icon: Settings },
  { id: 'security', label: 'Security & Access', icon: ShieldCheck },
  { id: 'alerts', label: 'Alert Channels', icon: Bell },
  { id: 'grid', label: 'Grid Infrastructure', icon: Globe },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'cloud', label: 'Cloud Clusters', icon: Cloud }
];

const AdminSettings = () => {
  const { isDark, setTheme } = useTheme();
  const { lang } = useLanguage();
  const tx = (text) => translateAdmin(text, lang);
  const [activeSection, setActiveSection] = useState('general');
  const [autoSync, setAutoSync] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [outageAlerts, setOutageAlerts] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const activeSetting = settingsSections.find((section) => section.id === activeSection) || settingsSections[0];
  const ActiveIcon = activeSetting.icon;

  const sectionButtonClass = (isActive) => `flex w-full shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 text-left transition dark:border-slate-700 sm:min-h-[64px] ${
    isActive
      ? 'bg-blue-50 text-[#0F172A] shadow-[inset_3px_0_0_#4567FF] dark:bg-blue-500/10 dark:text-white'
      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-[#131F37] dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

  const panelClass = 'rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#131F37]';
  const inputClass = 'mt-1.5 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-[#0F172A] outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A] dark:text-white';
  const labelClass = 'block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400';

  const toggleButton = (checked, onChange, label) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={tx(label)}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );

  const renderSection = () => {
    if (activeSection === 'general') {
      return <>
        <section className={panelClass}>
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><Settings className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Platform Identity')}</h3></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>{tx('Platform name')}<input className={inputClass} defaultValue="Luminescent Power Core" /></label>
            <label className={labelClass}>{tx('UI environment')}<select className={inputClass} defaultValue="Minimalist Light Audit"><option>Minimalist Light Audit</option><option>Operator Console</option><option>High Contrast</option></select></label>
            <label className={labelClass}>{tx('Global seed')}<input className={inputClass} defaultValue="CORE-X-0092-ALPHA" /></label>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <div className="flex items-center gap-2"><Moon className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('System Display Theme Preference')}</h3></div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{tx('Select your default SCADA operator display mode. Your preference will be saved to this browser and applied across sessions.')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { dark: false, label: 'Light Operator Mode', description: 'High-contrast clean layout optimized for daylight operations and high-glare dispatch control rooms.', icon: Sun },
              { dark: true, label: 'Dark SCADA Mode', description: 'Low-emission interface designed for prolonged night monitoring, reduced eye strain, and power conservation.', icon: Moon }
            ].map(({ dark, label, description, icon: Icon }) => {
              const selected = isDark === dark;
              return <button key={label} type="button" aria-pressed={selected} onClick={() => setTheme(dark ? 'dark' : 'light')} className={`rounded-lg border p-4 text-left transition ${selected ? 'border-[#4567FF] bg-blue-50/70 ring-1 ring-[#4567FF] dark:bg-blue-500/10' : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-500'}`}>
                <div className="flex items-center justify-between"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${selected ? 'bg-[#4567FF] text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}><Icon className="h-4 w-4" /></span>{selected && <span className="rounded bg-[#4567FF] px-2 py-1 text-[9px] font-bold text-white">{tx('Active')}</span>}</div>
                <h4 className="mt-3 text-xs font-bold">{tx(label)}</h4><p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{tx(description)}</p>
              </button>;
            })}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] dark:border-slate-700 dark:bg-slate-800"><span className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{tx('LEDGER SYNC: ACTIVE')}</span><span className="font-semibold text-[#4567FF]">{tx('Theme preference saved automatically')}</span></div>
        </section>

        <section className={`${panelClass} flex items-center justify-between gap-4 p-5`}>
          <div><h3 className="text-xs font-bold">{tx('Auto-Sync Telemetry')}</h3><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tx('Continuously update dashboard metrics from regional node streams.')}</p></div>
          {toggleButton(autoSync, setAutoSync, 'Auto-Sync Telemetry')}
        </section>
      </>;
    }

    if (activeSection === 'security') {
      return <section className={panelClass}>
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><ShieldCheck className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Security & Access')}</h3></div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-700"><div><h4 className="text-xs font-bold">{tx('Multi-factor authentication')}</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tx('Require an additional verification step for administrator sign-in.')}</p></div>{toggleButton(true, () => {}, 'Multi-factor authentication')}</div>
          <label className={labelClass}>{tx('Administrator session timeout')}<select className={inputClass} defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>60 minutes</option></select></label>
          <div className="rounded-md bg-emerald-50 p-3 text-[11px] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">{tx('Administrator access is protected by the active account authentication policy.')}</div>
        </div>
      </section>;
    }

    if (activeSection === 'alerts') {
      return <section className={panelClass}>
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><Bell className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Alert Channels')}</h3></div>
        <div className="space-y-3 p-5">
          {[['Security alerts', securityAlerts, setSecurityAlerts], ['Grid outage alerts', outageAlerts, setOutageAlerts]].map(([label, checked, onChange]) => <div key={label} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-700"><div><h4 className="text-xs font-bold">{tx(label)}</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tx('Send notifications to the admin alert center.')}</p></div>{toggleButton(checked, onChange, label)}</div>)}
          <label className={labelClass}>{tx('Notification email')}<input type="email" className={inputClass} placeholder="admin@example.com" /></label>
        </div>
      </section>;
    }

    if (activeSection === 'grid') {
      return <section className={panelClass}>
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><Network className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Grid Infrastructure')}</h3></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {[['Erbil Regional Hub', 'Connected · 12 nodes'], ['Sulaymaniyah Grid', 'Connected · 8 nodes'], ['Duhok Grid', 'Connected · 6 nodes'], ['Halabja Grid', 'Connected · 4 nodes']].map(([name, status]) => <div key={name} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-4 dark:border-slate-700"><div><h4 className="text-xs font-bold">{tx(name)}</h4><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{tx(status)}</p></div><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /></div>)}
        </div>
      </section>;
    }

    if (activeSection === 'data') {
      return <section className={panelClass}>
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><Database className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Data Management')}</h3></div>
        <div className="space-y-4 p-5">
          <label className={labelClass}>{tx('Audit log retention')}<select className={inputClass} defaultValue="365 days"><option>90 days</option><option>180 days</option><option>365 days</option></select></label>
          <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-700"><div><h4 className="text-xs font-bold">{tx('Administrative audit logging')}</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tx('Record administrator actions for operational review.')}</p></div>{toggleButton(auditLogging, setAuditLogging, 'Administrative audit logging')}</div>
        </div>
      </section>;
    }

    return <section className={panelClass}>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><Cloud className="h-4 w-4 text-[#4567FF]" /><h3 className="text-sm font-bold">{tx('Cloud Clusters')}</h3></div>
      <div className="space-y-3 p-5">
        {[['Primary region', 'Kurdistan · Active'], ['Replica cluster', 'Regional failover · Ready'], ['Backup status', 'Last snapshot · Today']].map(([name, status]) => <div key={name} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-4 dark:border-slate-700"><div><h4 className="text-xs font-bold">{tx(name)}</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tx(status)}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{tx('Healthy')}</span></div>)}
      </div>
    </section>;
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label={tx('Admin settings sections')} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#131F37]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1">
          {settingsSections.map(({ id, label, icon: Icon }) => {
            const selected = activeSection === id;
            return <button key={id} type="button" aria-current={selected ? 'page' : undefined} onClick={() => setActiveSection(id)} className={sectionButtonClass(selected)}>
              <Icon className={`h-4 w-4 shrink-0 ${selected ? 'text-[#4567FF]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="min-w-0"><span className="block text-xs font-bold">{tx(label)}</span><span className="mt-0.5 hidden truncate text-[10px] text-slate-400 sm:block">{tx(`${label} settings and configuration`)}</span></span>
            </button>;
          })}
        </div>
        <div className="hidden border-t border-slate-200 bg-[#1F2024] p-4 text-white dark:border-slate-700 lg:block">
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">{tx('System integrity audit')}</div>
          <div className="mt-3 flex justify-between text-[10px]"><span className="text-slate-300">{tx('Primary auth')}</span><span className="font-semibold text-blue-300">CORE_X_ADMIN</span></div>
          <div className="mt-2 flex justify-between text-[10px]"><span className="text-slate-300">{tx('Last integrity sync')}</span><span className="font-semibold text-emerald-400">{tx('Completed')}</span></div>
          <div className="mt-2 flex justify-between text-[10px]"><span className="text-slate-300">{tx('Build revision')}</span><span className="font-semibold">8.4.2.0-STABLE</span></div>
        </div>
      </nav>
      <div className="min-w-0 space-y-4">
        <div className="flex items-center gap-2"><ActiveIcon className="h-5 w-5 text-[#4567FF]" /><div><h2 className="text-base font-bold text-[#0F172A] dark:text-white">{tx(activeSetting.label)}</h2><p className="text-[11px] text-slate-500 dark:text-slate-400">{tx(`${activeSetting.label} settings and configuration`)}</p></div></div>
        {renderSection()}
        {activeSection === 'general' && <div className="flex items-center gap-2 text-[10px] text-slate-400"><SlidersHorizontal className="h-3.5 w-3.5" />{tx('Changes to local display preferences apply immediately.')}</div>}
      </div>
    </div>
  );
};

export default AdminSettings;
