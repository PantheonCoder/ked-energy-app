import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAlerts } from '../context/AlertsContext';
import { 
  BarChart3, 
  Sparkles, 
  Award, 
  Sliders,
  Zap, 
  TrendingDown, 
  ShieldCheck, 
  Gauge,
  AlertTriangle,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export const Analytics = () => {
  const { t, isRtl } = useLanguage();
  const { pushAlert } = useAlerts();
  const [data, setData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulator state


  // kWh Usage Limit state
  // currentKwh simulates live reading (same as dashboard liveKw fallback = 4.85)
  const [kwhLimit, setKwhLimit] = useState(4.0); // default 4 kWh limit
  const [currentKwh, setCurrentKwh] = useState(4.85); // simulated real-time reading
  const warningFiredRef = useRef(false);

  // Poll live meter data to get the current kW usage
  useEffect(() => {
    const fetchTelemetry = () => {
      fetch('/api/meter/realtime')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) setCurrentKwh(d.data.liveKw ?? 4.85);
        })
        .catch(() => {});
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  // Watch: if usage exceeds limit → send warning to Alerts section (once, until resolved)
  useEffect(() => {
    const isOverLimit = currentKwh > kwhLimit;
    if (isOverLimit && !warningFiredRef.current) {
      warningFiredRef.current = true;
      pushAlert({
        id: 'kwh-limit-warning',
        title: 'High Electricity Usage — Limit Exceeded',
        message: `Your current electricity usage is ${currentKwh.toFixed(2)} kW, which exceeds your set limit of ${kwhLimit.toFixed(1)} kWh. Please reduce electricity consumption in your home to stay within your usage budget.`,
        severity: 'warning',
        type: 'usage-limit',
      });
    } else if (!isOverLimit) {
      warningFiredRef.current = false;
    }
  }, [currentKwh, kwhLimit, pushAlert]);

  // Also re-fire warning whenever user changes the limit and is still over
  useEffect(() => {
    warningFiredRef.current = false;
  }, [kwhLimit]);

  const kwhLimitPercent = Math.min(100, Math.round((currentKwh / Math.max(kwhLimit, 0.1)) * 100));
  const isOverLimit = currentKwh > kwhLimit;

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/peak-offpeak').then(r => r.json()).catch(() => ({})),
      fetch('/api/analytics/efficiency-score').then(r => r.json()).catch(() => ({}))
    ]).then(([d1, d2]) => {
      if (d1.success) setData(d1.data);
      if (d2.success) setScoreData(d2.data);
    }).finally(() => setLoading(false));
  }, []);




  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3B82F6]" />
          {t.analytics.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.analytics.sub}
        </p>
      </div>

      {/* ─── kWh Usage Limit Control ─── */}
      <div className={`glass-card rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition-all ${
        isOverLimit
          ? 'bg-rose-50 border-rose-300 shadow-lg shadow-rose-500/10 dark:bg-rose-950/20 dark:border-rose-500/40'
          : 'bg-white border-slate-200 shadow-sm dark:bg-[#131F37] dark:border-slate-800 hover:dark:border-blue-500/30'
      }`}>

        {/* Glow accent */}
        <div className={`absolute top-0 right-0 w-72 h-28 rounded-full blur-3xl pointer-events-none ${
          isOverLimit ? 'bg-rose-500/15' : 'bg-blue-500/10'
        }`} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              isOverLimit 
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/20'
            }`}>
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                kWh Usage Limit Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set your maximum electricity consumption limit. An alert will be sent if exceeded.
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${
            isOverLimit
              ? 'bg-blue-500/20 text-white border-blue-400 dark:bg-blue-500/20 dark:text-white dark:border-blue-400 animate-pulse'
              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-white dark:border-blue-500/30'
          }`}>
            {isOverLimit ? (
              <><AlertTriangle className="w-3.5 h-3.5" /> Over Limit — Alert Sent</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Within Limit</>  
            )}
          </div>
        </div>

        {/* Progress Bar + Labels */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className={`font-mono font-bold ${
                isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {currentKwh.toFixed(2)} kW
              </span>
              <span className="text-slate-400 font-normal">current usage</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Limit: {kwhLimit.toFixed(1)} kWh</span>
            </div>
          </div>

          {/* Visual bar */}
          <div className="relative h-5 w-full rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 relative shadow-sm ${
                isOverLimit
                  ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-orange-400'
                  : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, kwhLimitPercent)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
            {/* Limit marker line at 100% = limit */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10 pointer-events-none"
              style={{ left: '100%' }}
              title="Your set limit"
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-0.5">
            <span>0 kWh</span>
            <span className={isOverLimit ? 'text-rose-500 dark:text-rose-400 font-bold' : 'text-blue-500 dark:text-blue-400 font-bold'}>
              {kwhLimitPercent}% of your limit {isOverLimit ? '⚠ EXCEEDED' : ''}
            </span>
            <span>Limit: {kwhLimit.toFixed(1)} kWh</span>
          </div>
        </div>

        {/* Slider to set kWh limit */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              Set Your Usage Limit
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{kwhLimit.toFixed(1)} kWh</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={kwhLimit}
            onChange={(e) => setKwhLimit(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.5 kWh (Min)</span>
            <span>15 kWh (Max)</span>
          </div>
        </div>

        {/* Over-limit warning banner */}
        {isOverLimit && (
          <div className="mt-4 p-4 rounded-2xl border flex items-start gap-3 animate-fadeIn
            bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Usage Limit Exceeded — Alert Sent to Alerts Section
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                Your home is currently drawing <strong>{currentKwh.toFixed(2)} kW</strong>, which is above your set limit of <strong>{kwhLimit.toFixed(1)} kWh</strong>. A warning has been sent to the Alerts section. Please reduce electricity usage (e.g., turn off AC, water heater, or other appliances).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Container: Peak vs Off-Peak Analytics + Efficiency Score */}
      <div className="space-y-4">
        
        {/* Monthly daily energy usage */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131F37] hover:dark:border-blue-500/30 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                Daily Energy Usage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Estimated daily consumption for {data?.monthlyUsage?.billingMonth || 'the billing month'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {data?.monthlyUsage?.totalKwh?.toLocaleString() ?? '--'} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kWh this month</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-44 flex items-end justify-between gap-0.5 sm:gap-1 pt-6 px-1">
              {(data?.monthlyUsage?.dailyChart || []).map((bar) => {
                const maxKwh = Math.max(...data.monthlyUsage.dailyChart.map((day) => day.kwh), 1);
                const heightPercent = Math.max(8, Math.round((bar.kwh / maxKwh) * 100));
                return (
                  <div key={bar.day} className="flex-1 min-w-0 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-white font-mono whitespace-nowrap shadow-lg">
                      Day {bar.day}: {bar.kwh} kWh
                    </div>

                    <div className="w-full h-36 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-sm sm:rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:brightness-110 transition-all duration-500"
                      ></div>
                    </div>
                    <span className="h-3 text-[9px] font-mono text-slate-500 dark:text-slate-400">
                      {bar.day === 1 || bar.day % 5 === 0 || bar.day === data.monthlyUsage.dailyChart.length ? bar.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Daily average</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {data?.monthlyUsage?.averageDailyKwh ?? '--'} kWh / day
            </span>
          </div>

        </div>

        {/* Home Efficiency Score */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131F37] hover:dark:border-blue-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t.analytics.efficiencyScore}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                {scoreData?.grade || 'Grade A'}
              </span>
            </div>

            {/* Score Radial Visual */}
            <div className="flex items-center gap-6 my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
              <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000 ease-out"
                    strokeDasharray="84, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">84</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-1">/ 100</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.analytics.grade}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.analytics.neighborhoodComparison}
                </p>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                  Area Avg: 68 / 100
                </div>
              </div>
            </div>

            {/* Sub-breakdown Bars */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300">
                  <span>Cooling Setpoint Optimization</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">88%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[88%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300">
                  <span>Off-Peak Tariff Utilization</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">82%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[82%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300">
                  <span>Standby Vampire Drain Control</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">80%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[80%]"></div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Verified by KED Smart Feeder</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Top 15% in Erbil</span>
          </div>

        </div>

      </div>

    </div>
  );
};
