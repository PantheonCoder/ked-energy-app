import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { translateAdmin } from '../i18n/adminTranslations';
import AdminSettings from './AdminSettings';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Download,
  Gauge,
  Globe,
  Grid2X2,
  LogOut,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Radio,
  Receipt,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Users,
  Wallet,
  Zap,
  X
} from 'lucide-react';

const navItems = [
  { id: 'grid-monitor', label: 'Grid Monitor', icon: Activity },
  { id: 'users', label: 'User Management / CRM', icon: Users },
  { id: 'financials', label: 'Bill Cycles & Financials', icon: Wallet },
  { id: 'outages', label: 'Outage Logs / Incidents', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics & System Health', icon: BarChart3 }
];

const settingsItem = { id: 'settings', label: 'Settings', icon: Settings };

const customers = [
  { id: 'KED-84920', name: 'Soran Mohammed Ali', city: 'Erbil', phone: '+964 750 442 8910', area: 'Dream City', meter: 'ERB-992384-M', balance: '24,650 IQD', monthKwh: 980, monthlyBillIqd: 78_400, billStatus: 'Pending', accountType: 'Residential', ownershipType: 'Individual', status: 'Active' },
  { id: 'KED-84921', name: 'Shirin Ahmad Karim', city: 'Erbil', phone: '+964 750 442 8911', area: 'Ankawa', meter: 'ERB-992401-M', balance: '0 IQD', monthKwh: 742, monthlyBillIqd: 59_360, billStatus: 'Paid', accountType: 'Residential', ownershipType: 'Individual', status: 'Active' },
  { id: 'KED-84922', name: 'Dara Hassan Omar', city: 'Sulaymaniyah', phone: '+964 770 315 2048', area: 'Bakhtiary', meter: 'SLM-992455-M', balance: '87,200 IQD', monthKwh: 1_140, monthlyBillIqd: 91_200, billStatus: 'Paid', accountType: 'Company', ownershipType: 'Private', status: 'Review' },
  { id: 'KED-84923', name: 'Narin Fadhil Aziz', city: 'Duhok', phone: '+964 750 221 9834', area: 'Raparin', meter: 'DUH-992512-M', balance: '12,400 IQD', monthKwh: 815, monthlyBillIqd: 65_200, billStatus: 'Pending', accountType: 'Farmer', ownershipType: 'Individual', status: 'Active' },
  { id: 'KED-84924', name: 'Haval Salih Mustafa', city: 'Erbil', phone: '+964 750 664 7302', area: 'Koya', meter: 'ERB-992606-M', balance: '142,800 IQD', monthKwh: 1_420, monthlyBillIqd: 113_600, billStatus: 'Overdue', accountType: 'Residential', ownershipType: 'Individual', status: 'Suspended' },
  { id: 'KED-84925', name: 'Kurdistan Telecom Services', city: 'Erbil', phone: '+964 750 800 1000', area: 'Ankawa Industrial', meter: 'ERB-COM-1042', balance: '1,284,000 IQD', monthKwh: 18_420, monthlyBillIqd: 1_473_600, billStatus: 'Paid', accountType: 'Company', ownershipType: 'Private', status: 'Active' },
  { id: 'KED-84926', name: 'Duhok Municipal Services', city: 'Duhok', phone: '+964 750 800 2000', area: 'City Centre', meter: 'DUH-GOV-2081', balance: '0 IQD', monthKwh: 42_600, monthlyBillIqd: 3_408_000, billStatus: 'Paid', accountType: 'Government Department', ownershipType: 'Government', status: 'Active' },
  { id: 'KED-84927', name: 'Bright Future Academy', city: 'Erbil', phone: '+964 750 800 3000', area: 'English Village', meter: 'ERB-SCH-3150', balance: '146,400 IQD', monthKwh: 3_240, monthlyBillIqd: 259_200, billStatus: 'Pending', accountType: 'School', ownershipType: 'Private', status: 'Active' },
  { id: 'KED-84928', name: 'Erbil Central Public School', city: 'Erbil', phone: '+964 750 800 4000', area: 'Iskan', meter: 'ERB-SCH-3271', balance: '0 IQD', monthKwh: 2_860, monthlyBillIqd: 228_800, billStatus: 'Paid', accountType: 'School', ownershipType: 'Public', status: 'Active' },
  { id: 'KED-84929', name: 'Shifa Private Hospital', city: 'Sulaymaniyah', phone: '+964 770 800 5000', area: 'Bakhtiary', meter: 'SLM-HSP-4206', balance: '684,000 IQD', monthKwh: 24_800, monthlyBillIqd: 1_984_000, billStatus: 'Paid', accountType: 'Hospital', ownershipType: 'Private', status: 'Active' },
  { id: 'KED-84930', name: 'Duhok General Hospital', city: 'Duhok', phone: '+964 750 800 6000', area: 'Nizarke', meter: 'DUH-HSP-4389', balance: '0 IQD', monthKwh: 31_200, monthlyBillIqd: 2_496_000, billStatus: 'Paid', accountType: 'Hospital', ownershipType: 'Public', status: 'Active' }
];

const getCustomerDetails = (customer) => {
  const index = Math.max(0, customers.findIndex((item) => item.id === customer.id));
  const paymentMethods = ['FIB', 'FastPay', 'ZainCash', 'Cash'];
  const billingMethod = (offset = 0) => paymentMethods[(index - 1 + offset + paymentMethods.length) % paymentMethods.length];
  const phoneCount = index % 2 === 0 ? 2 : 1;
  const formatBill = (kwh) => `${Math.round(kwh * 80).toLocaleString()} IQD`;
  const usage = index === 0 ? [
    { month: 'October 2026', kwh: 980 },
    { month: 'September 2026', kwh: 1_140 },
    { month: 'August 2026', kwh: 1_420 },
    { month: 'July 2026', kwh: 1_250 }
  ] : [
    { month: 'October 2026', kwh: customer.monthKwh },
    { month: 'September 2026', kwh: Math.round(customer.monthKwh * 1.16) },
    { month: 'August 2026', kwh: Math.round(customer.monthKwh * 1.31) },
    { month: 'July 2026', kwh: Math.round(customer.monthKwh * 1.08) }
  ];
  const payments = index === 0 ? [
    { month: 'October 2026', amount: '78,400 IQD', status: 'Pending' },
    { month: 'September 2026', amount: '84,200 IQD', status: 'Overdue' },
    { month: 'August 2026', amount: '112,000 IQD', status: 'Paid', paidAt: '2026-08-22', method: 'FIB' }
  ] : [
    {
      month: 'October 2026',
      amount: `${customer.monthlyBillIqd.toLocaleString()} IQD`,
      status: customer.billStatus,
      paidAt: customer.billStatus === 'Paid' ? '2026-10-12' : null,
      method: customer.billStatus === 'Paid' ? billingMethod() : null
    },
    { month: 'September 2026', amount: formatBill(Math.round(customer.monthKwh * 1.16)), status: 'Paid', paidAt: `2026-09-${String(18 + (index % 10)).padStart(2, '0')}`, method: billingMethod() },
    { month: 'August 2026', amount: formatBill(Math.round(customer.monthKwh * 1.31)), status: 'Paid', paidAt: `2026-08-${String(20 + (index % 10)).padStart(2, '0')}`, method: billingMethod(1) }
  ];
  payments.push({
    month: 'July 2026',
    amount: formatBill(usage[3].kwh),
    status: 'Paid',
    paidAt: `2026-07-${String(19 + (index % 10)).padStart(2, '0')}`,
    method: ['ZainCash', 'Cash', 'FIB', 'FastPay', 'QiCard'][index % 5]
  });
  return {
    livePowerKw: index === 0 ? '4.85' : (2.6 + index * 0.72).toFixed(2),
    phoneCount,
    phones: [
      { name: index % 2 === 0 ? 'iPhone 15 Pro' : 'Samsung Galaxy S24', location: customer.city, lastSeen: 'Active now' },
      { name: 'iPhone 13', location: customer.city, lastSeen: 'Last active 2 hours ago' }
    ].slice(0, phoneCount),
    payments,
    billingHistory: usage.map((month) => {
      const payment = payments.find((item) => item.month === month.month);
      return {
        ...month,
        amount: payment?.amount || formatBill(month.kwh),
        status: payment?.status || 'Paid',
        paidAt: payment?.paidAt || null,
        method: payment?.method || null
      };
    })
  };
};

const substations = [
  { name: 'Erbil Central', code: 'SS-ERB-01', voltage: '230.4 kV', load: '82%', status: 'Stable' },
  { name: 'Ankawa North', code: 'SS-ERB-04', voltage: '228.9 kV', load: '68%', status: 'Stable' },
  { name: 'Koya East', code: 'SS-KOY-02', voltage: '221.2 kV', load: '94%', status: 'Watch' },
  { name: 'Soran Feeder', code: 'SS-SOR-03', voltage: '232.1 kV', load: '54%', status: 'Stable' },
  { name: 'Shaqlawa South', code: 'SS-SHA-01', voltage: '218.6 kV', load: '91%', status: 'Watch' }
];

const initialOutages = [
  { id: 'INC-2048', area: 'Koya East Feeder', cause: 'Transformer overload', affected: 286, started: '10:42', status: 'Investigating' },
  { id: 'INC-2047', area: 'Shaqlawa South', cause: 'Line protection trip', affected: 94, started: '09:18', status: 'Crew dispatched' },
  { id: 'INC-2045', area: 'Ankawa Industrial', cause: 'Scheduled maintenance', affected: 32, started: '08:00', status: 'Restoring' }
];

const metricSets = {
  'grid-monitor': [
    { label: 'Average voltage', value: '230.4', unit: 'kV', note: 'Within operating range', icon: Gauge, trend: 'up' },
    { label: 'Grid frequency', value: '50.01', unit: 'Hz', note: 'Nominal 50 Hz', icon: Radio, trend: 'steady' },
    { label: 'Regional load', value: '1,284', unit: 'MW', note: '78% of available capacity', icon: Zap, trend: 'up' },
    { label: 'Substations online', value: '24 / 26', unit: '', note: '2 require attention', icon: Building2, trend: 'steady' }
  ],
  users: [
    { label: 'Registered customers', value: '48,291', unit: '', note: 'Across 6 service zones', icon: Users, trend: 'up' },
    { label: 'Active accounts', value: '45,201', unit: '', note: '93.6% of customers', icon: CheckCircle2, trend: 'up' },
    { label: 'Accounts in review', value: '247', unit: '', note: 'Requires follow-up', icon: Clock3, trend: 'steady' },
    { label: 'New this month', value: '1,842', unit: '', note: '12.4% above last month', icon: ArrowUpRight, trend: 'up' }
  ],
  financials: [
    { label: 'Revenue collected', value: '4.82', unit: 'B IQD', note: 'Month to date', icon: Wallet, trend: 'up' },
    { label: 'Collection rate', value: '91.6', unit: '%', note: 'Target: 90%', icon: CheckCircle2, trend: 'up' },
    { label: 'Outstanding bills', value: '2,134', unit: '', note: 'Across all zones', icon: Clock3, trend: 'down' },
    { label: 'Average tariff', value: '108', unit: 'IQD/kWh', note: 'Residential blended rate', icon: SlidersHorizontal, trend: 'steady' }
  ],
  outages: [
    { label: 'Active incidents', value: '3', unit: '', note: 'Across 3 service zones', icon: AlertTriangle, trend: 'down' },
    { label: 'Customers affected', value: '412', unit: '', note: '0.9% of active accounts', icon: Users, trend: 'steady' },
    { label: 'Mean restoration', value: '28', unit: 'min', note: 'Rolling 30-day average', icon: Clock3, trend: 'down' },
    { label: 'Resolved today', value: '17', unit: '', note: 'Median resolution: 21 min', icon: CheckCircle2, trend: 'up' }
  ],
  analytics: [
    { label: 'Platform availability', value: '99.98', unit: '%', note: 'Last 30 days', icon: ShieldCheck, trend: 'up' },
    { label: 'Telemetry endpoints', value: '1,842', unit: '', note: '1,839 reporting normally', icon: Cpu, trend: 'steady' },
    { label: 'Average data delay', value: '0.8', unit: 'sec', note: 'Target below 2 seconds', icon: Radio, trend: 'down' },
    { label: 'Open system alerts', value: '3', unit: '', note: 'No critical platform alerts', icon: Bell, trend: 'steady' }
  ]
};

const titles = {
  'grid-monitor': 'Grid Monitor',
  users: 'User Management / CRM',
  financials: 'Bill Cycles & Financials',
  outages: 'Outage Logs / Incident Management',
  analytics: 'Analytics & System Health'
};

const useAdminTranslator = () => {
  const { lang } = useLanguage();
  return (text) => translateAdmin(text, lang);
};

const billingMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StatusTag = ({ children }) => {
  const tx = useAdminTranslator();
  const palette = {
    Stable: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Watch: 'bg-amber-50 text-amber-700 ring-amber-200',
    Review: 'bg-amber-50 text-amber-700 ring-amber-200',
    Investigating: 'bg-amber-50 text-amber-700 ring-amber-200',
    'Crew dispatched': 'bg-blue-50 text-blue-700 ring-blue-200',
    Restoring: 'bg-blue-50 text-blue-700 ring-blue-200',
    Suspended: 'bg-rose-50 text-rose-700 ring-rose-200'
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${palette[children] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{tx(children)}</span>;
};

const MetricCard = ({ metric }) => {
  const tx = useAdminTranslator();
  const Icon = metric.icon;
  const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#131F37]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">{tx(metric.label)}</div>
        <Icon className="h-4 w-4 shrink-0 text-[#3B82F6]" />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5 text-[#0F172A] dark:text-white">
        <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
        {metric.unit && <span className="text-xs font-semibold text-slate-500">{tx(metric.unit)}</span>}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        {metric.trend !== 'steady' && <TrendIcon className={`h-3.5 w-3.5 ${metric.trend === 'down' ? 'text-emerald-600' : 'text-[#3B82F6]'}`} />}
        <span>{tx(metric.note)}</span>
      </div>
    </section>
  );
};

const Panel = ({ title, detail, action, children, className = '' }) => {
  const tx = useAdminTranslator();
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#131F37] ${className}`}>
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5 dark:border-slate-700">
      <div>
        <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">{tx(title)}</h2>
        {detail && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{tx(detail)}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>;
};

const gridStations = [
  { name: 'Erbil Central Hub', node: 'Telemetry Node #1', load: 184.7, voltage: '400.4 kV', temperature: 42 },
  { name: 'Suleimani North', node: 'Telemetry Node #2', load: 112.8, voltage: '400.1 kV', temperature: 38 },
  { name: 'Duhok Gate', node: 'Telemetry Node #3', load: 211.3, voltage: '399.5 kV', temperature: 62 },
  { name: 'Kirkuk Pipeline', node: 'Telemetry Node #4', load: 95.6, voltage: '400.6 kV', temperature: 34 }
];

const demandValues = [590, 600, 612, 630, 648, 646, 642, 636, 640, 646];
const demandPoints = demandValues.map((value, index) => {
  const x = 14 + (index * 572) / (demandValues.length - 1);
  const y = 156 - ((value - 400) / 500) * 138;
  return `${x},${y}`;
}).join(' ');

const OverrideSwitch = ({ enabled, onChange, label }) => {
  const tx = useAdminTranslator();
  return <button type="button" role="switch" aria-checked={enabled} aria-label={tx(label)} onClick={() => onChange(!enabled)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? 'bg-[#3B82F6]' : 'bg-slate-300'}`}>
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>;
};

const GridMonitor = () => {
  const tx = useAdminTranslator();
  const [activeView, setActiveView] = useState('overview');
  const [balancingEnabled, setBalancingEnabled] = useState(true);
  const [peakShavingEnabled, setPeakShavingEnabled] = useState(false);
  const totalLoad = gridStations.reduce((total, station) => total + station.load, 39.7);

  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 xl:flex-nowrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111827]">{tx('Grid Monitor')}</h1>
          <p className="mt-1 max-w-sm text-xs text-slate-600">{tx('Real-time load tracking, voltage, frequency stability analysis, and automated field actuation.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md bg-[#1D1E22] p-1 text-[11px] font-semibold text-white shadow-sm">
            <button type="button" onClick={() => setActiveView('overview')} className={`flex items-center gap-2 rounded px-3 py-2 ${activeView === 'overview' ? 'bg-[#303137] text-blue-400' : 'text-slate-400 hover:text-white'}`}><Activity className="h-3.5 w-3.5" /> {tx('Grid Overview')}</button>
            <button type="button" onClick={() => setActiveView('map')} className={`flex items-center gap-2 rounded px-3 py-2 ${activeView === 'map' ? 'bg-[#303137] text-blue-400' : 'text-slate-400 hover:text-white'}`}><MapPin className="h-3.5 w-3.5" /> {tx('Network Map')}</button>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700"><Zap className="h-3.5 w-3.5" /> {tx('Grid Balanced · Live Update')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { label: 'Voltage Levels', value: '400.290', unit: 'kV', note: <><span>{tx('Factor')}: <strong>0.91 COS φ</strong></span><span>{tx('Harmonics')}: <strong>1.20% THD</strong></span></>, icon: Gauge },
          { label: 'Frequency Stability', value: '50.014', unit: 'Hz', note: <>RoCoF: <strong>-0.0045 Hz/s</strong><span>{tx('Sync Status:')} <strong className="text-amber-600">{tx('Drifting')}</strong></span></>, icon: Activity },
          { label: 'Load Distribution', value: totalLoad.toFixed(1), unit: 'MW', note: <><span>{tx('Capacity')}: <strong>75.8% {tx('Limit')}</strong></span><span>{tx('Peak Shaving:')} <strong>{tx(peakShavingEnabled ? 'Enabled' : 'Disabled')}</strong></span></>, icon: Zap, highlight: true }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <section key={metric.label} className={`rounded-xl border bg-white p-4 shadow-sm ${metric.highlight ? 'border-[#3B82F6] ring-1 ring-blue-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500"><span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-[#3B82F6]" />{tx(metric.label)}</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
              <div className="mt-3 flex items-baseline gap-2 font-mono text-[#101827]"><span className="text-2xl font-bold tracking-tight">{metric.value}</span><span className="text-[11px] font-semibold text-slate-500">{metric.unit}</span></div>
              <div className="mt-2 flex justify-between gap-2 border-t border-slate-100 pt-2 text-[9px] text-slate-500">{metric.note}</div>
            </section>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.9fr)_minmax(240px,0.95fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="flex items-center gap-2 text-sm font-bold text-[#111827]"><Zap className="h-4 w-4 text-[#3B82F6]" />{tx('Grid Demand Allocation & Shedding Drill')}</h2><p className="mt-1 text-[10px] text-slate-500">{tx('Interactive live-updating telemetry feed and operations panel.')}</p></div>
            <span className="h-5 w-20 rounded-sm bg-[#1D1E22]" />
          </div>
          <div className="space-y-5 p-4 sm:p-5">
            {activeView === 'overview' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-600"><Activity className="h-3 w-3 text-[#3B82F6]" />{tx('Live Timeline Trend')}</h3>
                  <div className="flex gap-3 text-[9px] font-semibold uppercase tracking-wide text-slate-500"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#4567FF]" />{tx('Observed Value')}</span><span>{tx('━ Target Line')}</span></div>
                </div>
                <div className="relative pl-8">
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-5 text-[9px] text-slate-500"><span>900</span><span>700</span><span>550</span><span>400</span></div>
                  <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="h-44 w-full overflow-visible" role="img" aria-label="Grid demand trend increasing to 644 megawatts">
                    <defs><linearGradient id="demand-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4567FF" stopOpacity=".3" /><stop offset="100%" stopColor="#4567FF" stopOpacity=".02" /></linearGradient></defs>
                    {[18, 64, 110, 156].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#D9DEE7" strokeDasharray="3 4" />)}
                    <polygon points={`14,178 ${demandPoints} 586,178`} fill="url(#demand-fill)" />
                    <polyline points={demandPoints} fill="none" stroke="#4567FF" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="mt-1 flex justify-between text-[9px] text-slate-500"><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span></div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                <div className="grid w-full max-w-md grid-cols-2 gap-5">
                  {gridStations.map((station, index) => <div key={station.name} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white p-3 shadow-sm"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><div><div className="text-[10px] font-bold text-slate-800">{tx(station.name)}</div><div className="font-mono text-[9px] text-slate-500">{tx(`NODE 0${index + 1}`)} · {station.voltage}</div></div></div>)}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#111827]"><SlidersHorizontal className="h-3.5 w-3.5 text-[#3B82F6]" />{tx('Tactical Manual Overrides')}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div><div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{tx('Regional Balancing Optimizer')}</div><p className="mt-1 text-[10px] leading-relaxed text-slate-600">{tx('Redistributes grid load evenly across Erbil, Suleimani, and Duhok substations to reduce hotspot temperatures.')}</p></div>
                  <OverrideSwitch enabled={balancingEnabled} onChange={setBalancingEnabled} label="Regional balancing optimizer" />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div><div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{tx('Heavy Industry Peak Shaving')}</div><p className="mt-1 text-[10px] leading-relaxed text-slate-600">{tx('Instructs heavy smelting & concrete plants to reduce consumption during peak hours.')}</p></div>
                  <OverrideSwitch enabled={peakShavingEnabled} onChange={setPeakShavingEnabled} label="Heavy industry peak shaving" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wide text-[#111827]"><Cpu className="h-3.5 w-3.5 text-[#3B82F6]" />{tx('Regional Substation Matrix')}</h2>
          <div className="space-y-2.5 pt-3">
            {gridStations.map((station) => {
              const loadPercent = Math.min(Math.round((station.load / 240) * 100), 100);
              const isHighLoad = loadPercent > 75;
              return (
                <article key={station.name} className="rounded-xl border border-slate-200 bg-[#F1F2F4] p-3">
                  <div className="flex items-start justify-between gap-2"><div><h3 className="text-[10px] font-bold text-slate-800">{tx(station.name)}</h3><p className="font-mono text-[9px] text-slate-500">{tx(station.node)}</p></div><span className="rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-700">{tx('Optimal')}</span></div>
                  <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[9px] text-slate-600"><span><strong className="text-slate-800">{station.load.toFixed(1)} MW</strong> ({station.voltage})</span><span>{station.temperature}°C</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${isHighLoad ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${loadPercent}%` }} /></div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

const CustomerDetailsModal = ({ customer, phones, onClose, onToggleStatus, onLogoutPhone }) => {
  const { lang } = useLanguage();
  const tx = useAdminTranslator();
  const details = getCustomerDetails(customer);
  const activePhones = phones || details.phones;
  const phoneCount = activePhones.length;
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#131F37]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-slate-700 dark:bg-[#131F37]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="customer-detail-title" className="text-base font-bold text-[#0F172A] dark:text-white">{customer.name}</h2>
              <StatusTag>{customer.status}</StatusTag>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{tx(customer.accountType)}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tx(customer.ownershipType)}</span>
              <span className="rounded-sm bg-blue-50 px-2 py-1 text-[9px] font-bold tracking-wide text-blue-700">{tx('DEMO DETAILS')}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{customer.id} · {customer.meter}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => onToggleStatus(customer.id, customer.status === 'Suspended' ? 'Active' : 'Suspended')} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-bold ${customer.status === 'Suspended' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>
              {customer.status === 'Suspended' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{tx(customer.status === 'Suspended' ? 'Activate account' : 'Suspend account')}</span>
            </button>
            <button type="button" onClick={onClose} aria-label={tx('Close customer details')} title={tx('Close')} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-3.5 dark:border-slate-700"><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400"><Zap className="h-3.5 w-3.5 text-[#3B82F6]" /> {tx('Month-to-date energy')}</div><div className="mt-2 font-mono text-xl font-bold text-[#0F172A] dark:text-white">{customer.monthKwh.toLocaleString()} <span className="text-xs font-semibold text-slate-500">kWh</span></div></div>
            <div className="rounded-md border border-slate-200 p-3.5 dark:border-slate-700"><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400"><Activity className="h-3.5 w-3.5 text-[#3B82F6]" /> {tx('Live power draw')}</div><div className="mt-2 font-mono text-xl font-bold text-[#0F172A] dark:text-white">{details.livePowerKw} <span className="text-xs font-semibold text-slate-500">kW</span></div></div>
            <div className="rounded-md border border-slate-200 p-3.5 dark:border-slate-700"><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400"><Smartphone className="h-3.5 w-3.5 text-[#3B82F6]" /> {tx('Phones signed in')}</div><div className="mt-2 font-mono text-xl font-bold text-[#0F172A] dark:text-white">{phoneCount} <span className="text-xs font-semibold text-slate-500">{tx(phoneCount === 1 ? 'phone' : 'phones')}</span></div></div>
          </section>

          <section className="min-w-0">
              <div className="mb-3 flex items-center gap-2"><Receipt className="h-4 w-4 text-[#3B82F6]" /><h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{tx('Monthly bills')}</h3></div>
              <button
                type="button"
                onClick={() => setShowBillingHistory((visible) => !visible)}
                aria-expanded={showBillingHistory}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
              >
                <Receipt className="h-3.5 w-3.5" />
                {showBillingHistory ? tx('Hide monthly bill archive') : `${tx('View monthly bills')} (${details.billingHistory.length} ${tx('months')})`}
              </button>
              <p className="mt-2 text-[10px] text-slate-400">{tx('Payment dates and methods shown here are sample data for this demo account.')}</p>
              {showBillingHistory && (
                <div className="mt-3 overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">{tx('Billing month')}</th>
                        <th className="px-3 py-2.5 font-semibold">{tx('Usage')}</th>
                        <th className="px-3 py-2.5 font-semibold">{tx('Bill amount')}</th>
                        <th className="px-3 py-2.5 font-semibold">{tx('Status')}</th>
                        <th className="px-3 py-2.5 font-semibold">{tx('Paid on')}</th>
                        <th className="px-3 py-2.5 font-semibold">{tx('Payment method')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {details.billingHistory.map((bill) => (
                        <tr key={bill.month} className="text-slate-600 dark:text-slate-300">
                          <td className="px-3 py-3 font-medium text-[#0F172A] dark:text-white">{tx(bill.month.split(' ')[0])} {bill.month.split(' ')[1]}</td>
                          <td className="px-3 py-3 font-mono">{bill.kwh.toLocaleString()} kWh</td>
                          <td className="px-3 py-3 font-mono">{bill.amount}</td>
                          <td className="px-3 py-3"><StatusTag>{bill.status}</StatusTag></td>
                          <td className="px-3 py-3">{bill.paidAt ? new Intl.DateTimeFormat(lang === 'ckb' ? 'ckb' : 'en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${bill.paidAt}T00:00:00Z`)) : '—'}</td>
                          <td className="px-3 py-3">{bill.method || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>

          <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <div>
              <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#3B82F6]" /><h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{tx('Signed-in phones')}</h3><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{phoneCount}</span></div>
              <div className="divide-y divide-slate-100 rounded-md border border-slate-200 px-3 dark:divide-slate-700 dark:border-slate-700">{activePhones.length > 0 ? activePhones.map((phone) => <div key={phone.name} className="flex items-center gap-3 py-3"><div className="rounded-md bg-blue-50 p-2 text-[#3B82F6] dark:bg-blue-500/10"><Smartphone className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold text-[#0F172A] dark:text-white">{phone.name}</div><div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{phone.location} · {tx(phone.lastSeen)}</div></div><button type="button" onClick={() => onLogoutPhone(customer.id, phone.name)} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-200 px-2 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"><LogOut className="h-3 w-3" />{tx('Log out')}</button></div>) : <p className="py-4 text-xs text-slate-500 dark:text-slate-400">{tx('No signed-in phones remain.')}</p>}</div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{tx('Demo session control only. Actual device sessions are not tracked or remotely revoked by the backend.')}</p>
            </div>
          </section>

          <section className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-4 text-xs dark:border-slate-700">
            <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"><Phone className="h-3.5 w-3.5 text-[#3B82F6]" />{customer.phone}</span>
            <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 text-[#3B82F6]" />{customer.area}, {customer.city}</span>
          </section>
        </div>
      </section>
    </div>
  );
};

const UserManagement = ({ customers, search, setSearch, statusFilter, setStatusFilter, cityFilter, setCityFilter, selectedCustomer, phones, onSelectCustomer, onToggleStatus, onLogoutPhone }) => {
  const tx = useAdminTranslator();
  const cityOptions = [...new Set(customers.map((customer) => customer.city))].sort();
  const accountTypeOptions = [...new Set(customers.map((customer) => customer.accountType))].sort();
  const ownershipOptions = [...new Set(customers.map((customer) => customer.ownershipType))].sort();
  const [accountTypeFilter, setAccountTypeFilter] = useState('All account types');
  const [ownershipFilter, setOwnershipFilter] = useState('All ownership types');
  const filtered = useMemo(() => customers.filter((customer) => {
    const query = search.toLowerCase();
    const matchesSearch = `${customer.id} ${customer.name} ${customer.area} ${customer.city} ${customer.meter} ${customer.accountType} ${customer.ownershipType}`.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All statuses' || customer.status === statusFilter;
    const matchesCity = cityFilter === 'All cities' || customer.city === cityFilter;
    const matchesAccountType = accountTypeFilter === 'All account types' || customer.accountType === accountTypeFilter;
    const matchesOwnership = ownershipFilter === 'All ownership types' || customer.ownershipType === ownershipFilter;
    return matchesSearch && matchesStatus && matchesCity && matchesAccountType && matchesOwnership;
  }), [customers, search, statusFilter, cityFilter, accountTypeFilter, ownershipFilter]);
  const summaryTypes = ['Residential', 'Company', 'Government Department', 'School', 'Hospital', 'Farmer'];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricSets.users.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {summaryTypes.map((type) => {
          const count = customers.filter((customer) => customer.accountType === type).length;
          return <button key={type} type="button" onClick={() => setAccountTypeFilter(accountTypeFilter === type ? 'All account types' : type)} aria-pressed={accountTypeFilter === type} className={`rounded-lg border p-3 text-left transition ${accountTypeFilter === type ? 'border-[#4567FF] bg-blue-50 ring-1 ring-[#4567FF] dark:bg-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-[#131F37]'}`}>
            <span className="block truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">{tx(type)}</span>
            <span className="mt-1 block text-lg font-bold text-[#0F172A] dark:text-white">{count}</span>
          </button>;
        })}
      </div>
      <Panel title="Customer & organization accounts" detail="Find residential, business, public-service, school, and hospital accounts by city and ownership">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-700 sm:px-5">
          <label className="relative block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tx('Search by account, organization, city, or meter ID')} className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-[#0F172A] outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-white" /></label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <select aria-label={tx('Filter customers by account type')} value={accountTypeFilter} onChange={(event) => setAccountTypeFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200"><option value="All account types">{tx('All account types')}</option>{accountTypeOptions.map((type) => <option key={type} value={type}>{tx(type)}</option>)}</select>
            <select aria-label={tx('Filter customers by ownership')} value={ownershipFilter} onChange={(event) => setOwnershipFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200"><option value="All ownership types">{tx('All ownership types')}</option>{ownershipOptions.map((type) => <option key={type} value={type}>{tx(type)}</option>)}</select>
            <select aria-label={tx('Filter customers by city')} value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200"><option value="All cities">{tx('All cities')}</option>{cityOptions.map((city) => <option key={city}>{tx(city)}</option>)}</select>
            <select aria-label={tx('Filter customers by account status')} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200"><option value="All statuses">{tx('All statuses')}</option><option value="Active">{tx('Active')}</option><option value="Review">{tx('Review')}</option><option value="Suspended">{tx('Suspended')}</option></select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-5 py-3 font-semibold">{tx('Account')}</th><th className="px-4 py-3 font-semibold">{tx('Account type / ownership')}</th><th className="px-4 py-3 font-semibold">{tx('City')}</th><th className="px-4 py-3 font-semibold">{tx('Service area')}</th><th className="px-4 py-3 font-semibold">{tx('Meter ID')}</th><th className="px-4 py-3 font-semibold">{tx('Balance')}</th><th className="px-4 py-3 font-semibold">{tx('Status')}</th><th className="px-5 py-3 font-semibold">{tx('Access')}</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{filtered.map((customer) => <tr key={customer.id} tabIndex={0} onClick={() => onSelectCustomer(customer)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelectCustomer(customer); } }} className="cursor-pointer text-slate-600 transition hover:bg-blue-50/70 focus:bg-blue-50/70 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-800/70 dark:focus:bg-slate-800/70"><td className="px-5 py-3"><button type="button" onClick={() => onSelectCustomer(customer)} className="text-left"><span className="block font-semibold text-[#0F172A] hover:text-[#3B82F6] dark:text-white">{customer.name}</span><span className="mt-0.5 block font-mono text-[10px] text-slate-400">{customer.id}</span><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#3B82F6]">{tx('View profile')} <ChevronRight className="h-3 w-3" /></span></button></td><td className="px-4 py-3"><span className="block font-semibold text-[#0F172A] dark:text-white">{tx(customer.accountType)}</span><span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tx(customer.ownershipType)}</span></td><td className="px-4 py-3">{tx(customer.city)}</td><td className="px-4 py-3">{tx(customer.area)}</td><td className="px-4 py-3 font-mono">{customer.meter}</td><td className="px-4 py-3 font-mono">{customer.balance}</td><td className="px-4 py-3"><StatusTag>{customer.status}</StatusTag></td><td className="px-5 py-3"><button type="button" onClick={(event) => { event.stopPropagation(); onToggleStatus(customer.id, customer.status === 'Suspended' ? 'Active' : 'Suspended'); }} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-bold ${customer.status === 'Suspended' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10'}`}>{customer.status === 'Suspended' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}{tx(customer.status === 'Suspended' ? 'Activate' : 'Suspend')}</button></td></tr>)}
              {filtered.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan="8">{tx('No customer accounts match these filters.')}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400"><span>{tx('Showing')} {filtered.length} {tx('demo accounts')}</span><div className="flex items-center gap-2"><button className="rounded border border-slate-200 px-2 py-1 dark:border-slate-700">{tx('Previous')}</button><button className="rounded border border-slate-200 px-2 py-1 text-[#3B82F6] dark:border-slate-700">{tx('Next')}</button></div></div>
      </Panel>
      {selectedCustomer && <CustomerDetailsModal customer={selectedCustomer} phones={phones[selectedCustomer.id]} onClose={() => onSelectCustomer(null)} onToggleStatus={onToggleStatus} onLogoutPhone={onLogoutPhone} />}
    </div>
  );
};

const Financials = ({ tariffRate, setTariffRate, tariffSaved, setTariffSaved }) => {
  const tx = useAdminTranslator();
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');
  const monthIndex = Number(selectedMonth) - 1;
  const yearOffset = Number(selectedYear) - 2026;
  const periodLabel = `${tx(billingMonths[monthIndex])} ${selectedYear}`;
  const periodFactor = 1 + (monthIndex - 9) * 0.018 + yearOffset * 0.035;
  const metrics = metricSets.financials.map((metric) => {
    if (metric.label === 'Revenue collected') {
      return { ...metric, value: (4.82 * periodFactor).toFixed(2), note: periodLabel };
    }
    if (metric.label === 'Collection rate') {
      return { ...metric, value: (91.6 + (monthIndex - 9) * 0.35 + yearOffset * 0.8).toFixed(1), note: periodLabel };
    }
    if (metric.label === 'Outstanding bills') {
      return { ...metric, value: Math.max(0, Math.round(2_134 - (monthIndex - 9) * 43 - yearOffset * 125)).toLocaleString(), note: periodLabel };
    }
    return { ...metric, value: Math.round(108 + (monthIndex - 9) * 1.2 + yearOffset * 4).toString(), note: periodLabel };
  });

  return (
  <div className="space-y-5">
    <Panel
      title="Billing period"
      detail="Choose a month and year to view billing performance"
      action={
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="financial-month">{tx('Month')}</label>
          <select id="financial-month" aria-label={tx('Filter billing metrics by month')} value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200">
            {billingMonths.map((month, index) => <option key={month} value={index + 1}>{tx(month)}</option>)}
          </select>
          <label className="sr-only" htmlFor="financial-year">{tx('Year')}</label>
          <select id="financial-year" aria-label={tx('Filter billing metrics by year')} value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#3B82F6] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200">
            {['2024', '2025', '2026'].map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      }
    >
      <p className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">{tx('Showing sample revenue, collection rate, outstanding bills, and average tariff for')} {periodLabel}.</p>
    </Panel>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
    <div className="grid grid-cols-1 gap-4">
      <Panel title="Residential tariff controls" detail="Adjust the active base rate for the selected billing tier">
        <div className="space-y-4 p-4 sm:p-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{tx('Billing tier')}<select onChange={() => setTariffSaved(false)} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-[#0F172A] dark:border-slate-700 dark:bg-[#0F172A] dark:text-white"><option>{tx('Residential')} · 401–800 kWh</option><option>{tx('Residential')} · 1–400 kWh</option><option>{tx('Residential')} · 801–1,200 kWh</option><option>{tx('Residential')} · 1,201–1,600 kWh</option></select></label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{tx('Rate (IQD / kWh)')}<input type="number" min="1" value={tariffRate} onChange={(event) => { setTariffRate(event.target.value); setTariffSaved(false); }} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm font-bold text-[#0F172A] dark:border-slate-700 dark:bg-[#0F172A] dark:text-white" /></label>
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2.5 text-xs dark:bg-slate-800"><span className="text-slate-600 dark:text-slate-300">{tx('Current published rate')}</span><strong className="font-mono text-[#0F172A] dark:text-white">108 IQD/kWh</strong></div>
          <button onClick={() => setTariffSaved(true)} className="w-full rounded-md bg-[#3B82F6] px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-600">{tx(tariffSaved ? 'Tariff control saved' : 'Apply tariff update')}</button>
          <p className="text-[10px] leading-relaxed text-slate-400">{tx('Demo control only. Production tariff changes require an authorized approval workflow.')}</p>
        </div>
      </Panel>
    </div>
  </div>
  );
};

const Outages = ({ incidents, setIncidents }) => {
  const tx = useAdminTranslator();
  return <div className="space-y-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricSets.outages.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
    <Panel title="Active outage incidents" detail="Dispatch status and affected service areas" action={<button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Download className="h-3.5 w-3.5" /> {tx('Export log')}</button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-5 py-3 font-semibold">{tx('Incident')}</th><th className="px-4 py-3 font-semibold">{tx('Service area')}</th><th className="px-4 py-3 font-semibold">{tx('Cause')}</th><th className="px-4 py-3 font-semibold">{tx('Affected')}</th><th className="px-4 py-3 font-semibold">{tx('Started')}</th><th className="px-5 py-3 font-semibold">{tx('Status / action')}</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{incidents.map((incident) => <tr key={incident.id} className="text-slate-600 dark:text-slate-300"><td className="px-5 py-3 font-mono font-semibold text-[#0F172A] dark:text-white">{incident.id}</td><td className="px-4 py-3 font-semibold text-[#0F172A] dark:text-white">{tx(incident.area)}</td><td className="px-4 py-3">{tx(incident.cause)}</td><td className="px-4 py-3">{incident.affected} {tx('meters')}</td><td className="px-4 py-3 font-mono">{incident.started}</td><td className="px-5 py-3"><div className="flex items-center gap-2"><StatusTag>{incident.status}</StatusTag><button onClick={() => setIncidents((current) => current.map((item) => item.id === incident.id ? { ...item, status: 'Crew dispatched' } : item))} className="font-semibold text-[#3B82F6] hover:underline">{tx('Update')}</button></div></td></tr>)}</tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500"><MapPin className="h-3.5 w-3.5 text-[#3B82F6]" /> {tx('Incident locations are reflected on the regional operations map.')}</div>
    </Panel>
  </div>;
};

const SystemHealth = () => {
  const tx = useAdminTranslator();
  const [selectedCity, setSelectedCity] = useState('');
  const cityMetrics = selectedCity
    ? metricSets.analytics.map((metric) => ({
      ...metric,
      note: 'Regional system-wide demo metric; city-specific monitoring is not connected.'
    }))
    : metricSets.analytics;
  return <div className="space-y-5">
    <Panel
      title="Analytics by city"
      detail="Choose a city to view its system analytics"
      action={
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#3B82F6]" />
          <span>{tx('Filter by city')}</span>
          <select
            aria-label={tx('Filter by city')}
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className="max-w-[130px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-[#0F172A] dark:border-slate-700 dark:bg-[#0F172A] dark:text-white"
          >
            <option value="">{tx('All cities')}</option>
            {['Duhok', 'Erbil', 'Halabja', 'Sulaymaniyah'].map((city) => <option key={city} value={city}>{tx(city)}</option>)}
          </select>
        </label>
      }
    >
      <div className="space-y-3 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cityMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
        {selectedCity && <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{tx('These are the existing regional demo metrics, not measurements for the selected city. City-specific availability, endpoint counts, delay, and alerts require city-tagged monitoring data.')}</p>}
      </div>
    </Panel>
  </div>;
};

const AdminMessagesModal = ({ conversations, error: inboxError, onClose, onConversationsChanged }) => {
  const tx = useAdminTranslator();
  const [selectedUserId, setSelectedUserId] = useState(conversations[0]?.userId || '');
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const selectedConversation = conversations.find(conversation => conversation.userId === selectedUserId);
  const unreadInboxCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

  useEffect(() => {
    if (!selectedUserId && conversations.length) setSelectedUserId(conversations[0].userId);
  }, [conversations, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return undefined;
    }
    let active = true;
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/support/conversations/${encodeURIComponent(selectedUserId)}?viewer=admin`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load this conversation');
        if (active) {
          setMessages(data.messages);
          setError('');
          onConversationsChanged();
        }
      } catch (loadError) {
        console.error('Unable to load user conversation:', loadError);
        if (active) setError(loadError.message || 'Unable to load this conversation');
      } finally {
        if (active) setLoading(false);
      }
    };
    setLoading(true);
    loadMessages();
    const poll = setInterval(loadMessages, 4000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, [selectedUserId, onConversationsChanged]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async (event) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !selectedUserId || sending) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch(`/api/support/conversations/${encodeURIComponent(selectedUserId)}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to send reply');
      setMessages(current => [...current, data.message]);
      setReply('');
      onConversationsChanged();
    } catch (sendError) {
      console.error('Unable to send support reply:', sendError);
      setError(sendError.message || 'Unable to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-messages-title" className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#131F37]">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-[#101A2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><MessageCircle className="h-4 w-4" /></div>
            <div>
              <h2 id="admin-messages-title" className="text-sm font-bold text-[#0F172A] dark:text-white">{tx('Customer service desk')}</h2>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{tx('Customer requests and support conversations')} · {conversations.length} {tx(conversations.length === 1 ? 'customer' : 'customers')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={tx('Close user messages')} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </header>
        {inboxError && <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{inboxError}</p>}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside aria-label={tx('Customer conversations')} className="max-h-40 overflow-y-auto border-b border-slate-200 bg-slate-50/70 md:max-h-none md:border-b-0 md:border-r dark:border-slate-700 dark:bg-[#101A2D]">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:border-slate-700 dark:bg-[#101A2D]">{tx('Inbox')} <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{unreadInboxCount}</span></div>
            {conversations.length ? conversations.map(conversation => (
              <button key={conversation.userId} type="button" onClick={() => { setSelectedUserId(conversation.userId); setShowCustomerProfile(false); }} className={`w-full border-b border-slate-100 px-3 py-3 text-left transition dark:border-slate-700 ${selectedUserId === conversation.userId ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-white dark:hover:bg-slate-800/70'}`}>
                <span className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">{conversation.userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs font-bold text-[#0F172A] dark:text-white"><span className="truncate">{conversation.userName}</span>{conversation.unreadCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] text-white">{conversation.unreadCount}</span>}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">{conversation.userCode}</span>
                    <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"><MapPin className="h-3 w-3 shrink-0 text-[#3B82F6]" /><span className="truncate">{tx(conversation.city || 'City not provided')}{conversation.neighborhood ? ` · ${tx(conversation.neighborhood)}` : ''}</span></span>
                    <span className="mt-1.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">{conversation.latestMessage?.text || tx('No messages yet · select to start a conversation')}</span>
                  </span>
                </span>
              </button>
            )) : <p className="p-4 text-xs text-slate-500">{tx('No user messages yet.')}</p>}
          </aside>
          <div className="flex min-h-0 flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <button type="button" onClick={() => setShowCustomerProfile((current) => !current)} aria-expanded={showCustomerProfile} className="flex min-w-0 items-center gap-2.5 rounded-md text-left hover:opacity-80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">{selectedConversation.userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                    <span className="min-w-0"><span className="block truncate text-xs font-bold text-[#0F172A] dark:text-white">{selectedConversation.userName}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{selectedConversation.userCode} · {tx('View customer profile')}</span></span>
                  </button>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><MapPin className="h-3.5 w-3.5" />{tx(selectedConversation.city || 'City not provided')}</span>
                </div>
                {showCustomerProfile && <section aria-label={tx('Customer profile')} className="grid grid-cols-1 gap-x-4 gap-y-3 border-b border-blue-100 bg-blue-50/60 px-4 py-3 text-[10px] dark:border-blue-500/20 dark:bg-blue-500/5 sm:grid-cols-2 lg:grid-cols-3">
                  {[[tx('Customer ID'), selectedConversation.userCode], [tx('City'), selectedConversation.city], [tx('Neighborhood'), selectedConversation.neighborhood], [tx('Phone'), selectedConversation.phone], [tx('Email'), selectedConversation.email], [tx('Meter ID'), selectedConversation.meterNumber]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="min-w-0"><span className="block font-semibold uppercase tracking-wide text-slate-400">{label}</span><span className="mt-0.5 block truncate font-semibold text-slate-700 dark:text-slate-200">{tx(value)}</span></div>)}
                </section>}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loading && messages.length === 0 && <p className="text-xs text-slate-500">{tx('Loading messages…')}</p>}
                  {!loading && messages.length === 0 && <div className="flex h-full min-h-48 items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><MessageCircle className="h-5 w-5" /></div>
                      <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">{tx('No messages yet')}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tx('This customer has not sent a support request yet. You can start a conversation by sending a message below.')}</p>
                    </div>
                  </div>}
                  {messages.map(message => {
                    const isAdmin = message.sender === 'admin';
                    return (
                      <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 ${isAdmin ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}`}>
                          <p className="whitespace-pre-wrap break-words text-xs">{message.text}</p>
                          <time className={`mt-1 block text-[9px] ${isAdmin ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString()}</time>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                {error && <p role="alert" className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
                <form onSubmit={sendReply} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
                  <textarea aria-label={tx('Text reply')} rows="2" maxLength="2000" value={reply} onChange={(event) => setReply(event.target.value)} placeholder={tx('Write a text reply…')} className="min-w-0 flex-1 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                  <button type="submit" disabled={!reply.trim() || sending} className="inline-flex items-center gap-1.5 self-end rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-3.5 w-3.5" />{tx('Reply')}</button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-slate-500">User messages will appear here. Replies are sent as text only.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const AdminDashboard = ({ pathname, navigate }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const tx = useAdminTranslator();
  const { lang, setLang } = useLanguage();
  const [customerAccounts, setCustomerAccounts] = useState(customers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [cityFilter, setCityFilter] = useState('All cities');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showAdminMessages, setShowAdminMessages] = useState(false);
  const [supportConversations, setSupportConversations] = useState([]);
  const [supportInboxError, setSupportInboxError] = useState('');
  const [phoneSessions, setPhoneSessions] = useState(() => Object.fromEntries(customers.map((customer) => [customer.id, getCustomerDetails(customer).phones])));
  const [tariffRate, setTariffRate] = useState('108');
  const [tariffSaved, setTariffSaved] = useState(false);
  const [incidents, setIncidents] = useState(initialOutages);
  const activeSection = pathname.split('/')[2] || 'grid-monitor';
  const currentItem = navItems.find((item) => item.id === activeSection) || (activeSection === 'settings' ? settingsItem : navItems[0]);
  const ActiveIcon = currentItem.icon;
  const dateLabel = new Intl.DateTimeFormat(lang === 'ckb' ? 'ckb' : 'en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
  const selectedCustomer = customerAccounts.find((customer) => customer.id === selectedCustomerId);
  const unreadSupportCount = supportConversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

  const refreshSupportConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/support/conversations');
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load user messages');
      setSupportConversations(data.conversations);
      setSupportInboxError('');
    } catch (error) {
      console.error('Unable to load user message inbox:', error);
      setSupportInboxError(error.message || 'Unable to load user messages');
    }
  }, []);

  useEffect(() => {
    refreshSupportConversations();
    const poll = setInterval(refreshSupportConversations, 5000);
    return () => clearInterval(poll);
  }, [refreshSupportConversations]);
  const updateCustomerStatus = (customerId, status) => {
    setCustomerAccounts((current) => current.map((customer) => customer.id === customerId ? { ...customer, status } : customer));
  };

  const logoutPhone = (customerId, phoneName) => {
    setPhoneSessions((current) => ({
      ...current,
      [customerId]: (current[customerId] || []).filter((phone) => phone.name !== phoneName)
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/', true);
  };

  return (
    <div className="min-h-screen bg-[#F1F2F4] text-[#0F172A] dark:bg-[#0F172A] dark:text-white">
      <div className="flex min-h-screen">
        <aside className="flex w-14 shrink-0 flex-col bg-[#1F2024] text-white sm:w-16 md:w-[180px]">
          <div className="flex h-20 items-center gap-2 border-b border-white/10 px-2 md:px-3">
            <div className="hidden min-w-0 md:block"><div className="text-sm font-extrabold tracking-wide text-[#4567FF]">CORE ADMIN</div><div className="mt-1 text-[8px] font-semibold tracking-[0.08em] text-slate-400">LUMINESCENT POWER</div></div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#3B82F6] md:hidden"><Zap className="h-5 w-5 text-white" /></div>
          </div>
          <div className="px-1.5 pt-5 md:px-0"><nav className="space-y-0.5">{navItems.map((item) => {
            const Icon = item.icon;
            const active = currentItem.id === item.id;
            const label = { users: 'User Management', financials: 'Bill Cycles', outages: 'Outage Logs', analytics: 'Analytics' }[item.id] || item.label;
            return <button key={item.id} onClick={() => navigate(`/admin/${item.id}`)} title={tx(item.label)} className={`flex w-full items-center gap-2.5 px-3 py-3 text-left text-[11px] font-medium transition ${active ? 'bg-[#4567FF] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} /><span className="hidden leading-tight md:block">{tx(label)}</span></button>;
          })}</nav></div>
          <div className="mt-auto border-t border-white/10">
            <button type="button" onClick={() => navigate('/admin/settings')} title={tx('Settings')} aria-current={currentItem.id === 'settings' ? 'page' : undefined} className={`flex w-full items-center gap-2.5 px-3 py-3 text-left text-[11px] font-medium transition ${currentItem.id === 'settings' ? 'bg-[#4567FF] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Settings className={`h-4 w-4 ${currentItem.id === 'settings' ? 'text-white' : 'text-slate-400'}`} /><span className="hidden md:block">{tx('Settings')}</span></button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[52px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-5 dark:border-slate-700 dark:bg-[#131F37]">
            <div className="flex min-w-0 items-center gap-3"><span className="truncate text-xs font-bold text-[#111827] dark:text-white">{tx(activeSection === 'grid-monitor' ? 'Platform Overview' : currentItem.label)}</span><span className="hidden items-center gap-1.5 rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 md:inline-flex dark:bg-slate-800 dark:text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> HQ-STABLE-NODE-01</span></div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <label className="hidden h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-400 lg:flex dark:border-slate-700 dark:bg-slate-800"><Search className="h-3.5 w-3.5" /><input aria-label={tx('Search grid telemetry, logs, or users')} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tx('Search grid telemetry, logs, or users')} className="w-44 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" /></label>
              <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-slate-500 xl:flex dark:text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{dateLabel}</span>
              <button type="button" onClick={() => setLang(lang === 'ckb' ? 'en' : 'ckb')} title={tx(lang === 'ckb' ? 'Switch to English' : 'Switch to Kurdish')} aria-label={tx(lang === 'ckb' ? 'Switch to English' : 'Switch to Kurdish')} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"><Globe className="h-3.5 w-3.5" /><span>{lang === 'ckb' ? 'KU' : 'EU'}</span></button>
              <button type="button" onClick={toggleTheme} title={tx(isDark ? 'Switch to light mode' : 'Switch to dark mode')} aria-label={tx(isDark ? 'Switch to light mode' : 'Switch to dark mode')} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              <button type="button" onClick={() => setShowAdminMessages(true)} title={tx('User messages')} aria-label={`${tx('User messages')}${unreadSupportCount ? `, ${unreadSupportCount} ${tx('unread')}` : ''}`} className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <Bell className="h-4 w-4" />
                {unreadSupportCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{unreadSupportCount > 9 ? '9+' : unreadSupportCount}</span>}
              </button>
              <div className="hidden text-right md:block"><div className="text-[10px] font-bold text-[#111827] dark:text-white">{user?.fullName || tx('KED Administrator')}</div><div className="text-[8px] font-bold uppercase tracking-wide text-[#4567FF]">{tx('Core Admin')}</div></div>
              <button onClick={handleLogout} title={tx('Sign out')} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" /><span className="sr-only">{tx('Sign out')}</span></button>
            </div>
          </header>

          <main className={`flex-1 ${currentItem.id === 'grid-monitor' ? 'bg-[#F1F2F4] p-4 sm:px-6 sm:py-6 lg:px-8' : 'p-4 sm:p-6 lg:p-8'}`}>
            {currentItem.id !== 'grid-monitor' && <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><ActiveIcon className="h-5 w-5 text-[#3B82F6]" /><h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white">{tx(titles[currentItem.id])}</h1></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tx('Kurdistan Regional Grid · Central operations overview')}</p></div><div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-[#131F37] dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {tx('GRID STATUS: NORMAL')}</div></div>}
            {currentItem.id === 'grid-monitor' && <GridMonitor />}
            {currentItem.id === 'users' && <UserManagement customers={customerAccounts} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} cityFilter={cityFilter} setCityFilter={setCityFilter} selectedCustomer={selectedCustomer} phones={phoneSessions} onSelectCustomer={(customer) => setSelectedCustomerId(customer?.id || null)} onToggleStatus={updateCustomerStatus} onLogoutPhone={logoutPhone} />}
            {currentItem.id === 'financials' && <Financials tariffRate={tariffRate} setTariffRate={setTariffRate} tariffSaved={tariffSaved} setTariffSaved={setTariffSaved} />}
            {currentItem.id === 'outages' && <Outages incidents={incidents} setIncidents={setIncidents} />}
            {currentItem.id === 'settings' && <AdminSettings />}
            {currentItem.id === 'analytics' && <SystemHealth />}
            {currentItem.id !== 'grid-monitor' && <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400 dark:border-slate-700"><span>{tx('© 2026 KED · Ministry of Electricity, Kurdistan Region')}</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" /> {tx('Secure operations console')}</span></footer>}
          </main>
        </div>
      </div>
      {showAdminMessages && <AdminMessagesModal conversations={supportConversations} error={supportInboxError} onClose={() => setShowAdminMessages(false)} onConversationsChanged={refreshSupportConversations} />}
    </div>
  );
};
