import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Zap, 
  Coins, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';

export const Dashboard = () => {
  const { t } = useLanguage();
  const [telemetry, setTelemetry] = useState(null);

  // Poll live telemetry every 2.5 seconds
  useEffect(() => {
    const fetchTelemetry = () => {
      fetch('/api/meter/realtime')
        .then(r => r.json())
        .then(d => {
          if (d.success) setTelemetry(d.data);
        })
        .catch(console.error);
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  const liveKw = telemetry ? telemetry.liveKw : 4.85;
  // Calculate percentage of dial (0 to 10 kW range)
  const dialPercent = Math.min(100, Math.round((liveKw / 10) * 100));

  // Tiered tariff tiers (fallback defaults from official KRG tariff)
  const tariffTiers = telemetry?.tariffTiers || [
    { range: '1–400 kWh',   rateIqd: 72,  isCurrentTier: false },
    { range: '401–800 kWh', rateIqd: 108, isCurrentTier: true  },
    { range: '801–1200 kWh',rateIqd: 175, isCurrentTier: false },
    { range: '1201–1600 kWh',rateIqd: 265,isCurrentTier: false },
    { range: '1600+ kWh',   rateIqd: 350, isCurrentTier: false },
  ];
  const currentRateIqd = telemetry?.currentRateIqd || tariffTiers.find(t => t.isCurrentTier)?.rateIqd || 72;

  return (
    <div className="space-y-6">
      
      {/* Top Regional Notice Banner */}
      <div className="glass-card rounded-2xl p-4 border border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/15 flex items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-500/20">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
              Kurdistan Regional Grid Advisory
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {t.dashboard.gridNotice}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap shadow-inner">
          <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Live 4G Mesh</span>
        </div>
      </div>

      {/* Main Container: Live Gauge + Cost Cards */}
      <div className="space-y-4">
        
        {/* Live kW Interactive Dial */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t.dashboard.liveTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t.dashboard.liveFluctuation}
              </p>
            </div>
            
            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400">
              {currentRateIqd} IQD/kWh
            </div>
          </div>

          {/* Central Circular / Radial Meter Gauge */}
          <div className="relative flex flex-col items-center justify-center my-4 py-2">
            {/* SVG Arc Gauge */}
            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="8"
                strokeDasharray="301.59"
                strokeDashoffset="75.4"
                strokeLinecap="round"
              />
              {/* Foreground Animated Glow Arc */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="url(#electricBlueGradient)"
                strokeWidth="8"
                strokeDasharray="301.59"
                strokeDashoffset={301.59 - (dialPercent / 100) * 226}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="electricBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="70%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Power Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter">
                {liveKw.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mt-0.5">
                {t.dashboard.kwUnit} Active
              </span>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-900/90 dark:border-slate-800">
                Max Capacity: 13.2 kW (60A)
              </span>
            </div>
          </div>

          {/* Telemetry Sub-grid (Voltage, Current, Frequency, PF) */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.dashboard.voltage}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {telemetry?.voltage || 224.6} V
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.dashboard.current}</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                {telemetry?.currentAmps || 22.8} A
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.dashboard.frequency}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {telemetry?.frequency || 50.0} Hz
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.dashboard.powerFactor}</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                {telemetry?.powerFactor || 0.98}
              </span>
            </div>
          </div>

        </div>

        {/* Cost & Tariff Cards */}
        <div className="space-y-4">
          
          {/* Today's Accrued Cost */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-950/80 dark:border-blue-800/40 uppercase">
                Daily Tracker
              </span>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">{t.dashboard.todayCost}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {telemetry?.dailyCostIqd ? telemetry.dailyCostIqd.toLocaleString() : '5,840'}
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">IQD</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Calculated dynamically using Kurdistan dual peak/off-peak rate meters.
            </p>
          </div>

          {/* Month Accrued Projection */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-950/80 dark:border-blue-800/40 uppercase">
                October 2026
              </span>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">{t.dashboard.monthCost}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {telemetry?.monthlyCostIqd ? telemetry.monthlyCostIqd.toLocaleString() : '78,400'}
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">IQD</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Efficiency Grade:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Grade A (Eco 84/100)</span>
            </div>
          </div>

          {/* KRG Tiered Residential Tariff Table */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>KRG Official Residential Tariff (نرخی کارەبای مالان)</span>
            </div>

            {/* Tier table header */}
            <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              <span>Consumption (kWh)</span>
              <span className="text-center">Rate (IQD/kWh)</span>
              <span className="text-right">Status</span>
            </div>

            {/* Tier rows */}
            <div className="space-y-1.5">
              {tariffTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 items-center px-3 py-2.5 rounded-xl border transition-all ${
                    tier.isCurrentTier
                      ? 'bg-blue-50 border-blue-300 shadow-sm dark:bg-blue-500/15 dark:border-blue-500/40'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800'
                  }`}
                >
                  <span className={`font-mono font-semibold ${
                    tier.isCurrentTier ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-400'
                  }`}>
                    {tier.range}
                  </span>
                  <span className={`text-center font-black font-mono text-base ${
                    tier.isCurrentTier ? 'text-blue-700 dark:text-white' : 'text-slate-900 dark:text-slate-300'
                  }`}>
                    {tier.rateIqd}
                  </span>
                  <div className="flex justify-end">
                    {tier.isCurrentTier ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 animate-pulse">
                        ● Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly kWh consumed so far indicator */}
            {telemetry?.monthKwhSoFar && (
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <span>This month so far:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{telemetry.monthKwhSoFar} kWh</span>
              </div>
            )}

            {/* Separator + Commercial heading */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                Other Categories (نرخی جۆرەکانی دیکە)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[{label:'Commercial (بازرگانی)',rate:185},{label:'Large Industry',rate:125},{label:'Industry (پیشەسازی)',rate:160},{label:'Government (میری)',rate:160},{label:'Agriculture (کشتوکاڵی)',rate:60}].map((c,i)=>(
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-[10px] truncate">{c.label}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-[11px] shrink-0 ml-1">{c.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

