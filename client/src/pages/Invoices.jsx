import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { 
  Receipt, 
  Coins, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  ShieldAlert,
  Timer,
  CalendarClock
} from 'lucide-react';

export const Invoices = ({ onRefreshCount }) => {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState(null);
  const [activeInvoiceForReceipt, setActiveInvoiceForReceipt] = useState(null);

  // 30-Day Monthly Billing Cycle Calculation
  const today = new Date();
  const currentDayOfMonth = today.getDate(); // e.g. 12
  const totalCycleDays = 30; // standard 30-day billing cycle
  const dueDay = 25; // 25th of the month settlement deadline
  
  // State to simulate/preview the 5-day warning (or automatically when <= 5 days remain)
  const [simulate5Days, setSimulate5Days] = useState(false);

  // Active days calculations
  const effectiveDay = simulate5Days ? 25 : currentDayOfMonth;
  const daysLeftToPay = Math.max(0, dueDay - effectiveDay);
  const daysLeftInCycle = Math.max(0, totalCycleDays - effectiveDay);
  const cyclePercent = Math.min(100, Math.max(0, Math.round((effectiveDay / totalCycleDays) * 100)));

  // Triggers automatically when 5 or fewer days remain until head of the month (or simulated)
  const isNearHeadOfMonth = daysLeftInCycle <= 5 || simulate5Days;

  const fetchInvoices = () => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setInvoices(d.data.invoices);
          setTotalOutstanding(d.data.totalOutstandingIqd);
          if (onRefreshCount) onRefreshCount(d.data.unpaidCount);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePaymentSuccess = (updatedInvoice) => {
    fetchInvoices();
    setActiveInvoiceForPay(null);
    setActiveInvoiceForReceipt(updatedInvoice);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-white dark:border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
            {t.invoices.statusPaid}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30">
            <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
            {t.invoices.statusPending}
          </span>
        );
      case 'warning_level_2':
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-500/20 dark:text-white dark:border-blue-400/50 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-[#3B82F6]" />
            {t.invoices.statusWarning}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t.invoices.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.invoices.sub}
        </p>
      </div>

      {/* 30-Day Monthly Pay Day Cycle Progress Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition-all
        bg-white border-slate-200 shadow-sm
        dark:bg-[#131F37] dark:border-slate-800 hover:dark:border-blue-500/30">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header row: Title + Days Left Countdown Pill */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 shrink-0 border border-blue-500/20">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t.invoices.cycleTitle || '30-Day Monthly Billing Cycle'}
                </h3>
                <span className="text-[10px] font-mono text-blue-500 dark:text-blue-400 font-semibold">
                  October 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-xl shrink-0">
              <Timer className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                  {daysLeftToPay}
                </span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  d left
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Official KED settlement period runs until the 25th before end-of-month meter rollover.
          </p>
        </div>

        {/* Progress Bar & Markers */}
        <div className="space-y-2">
          {/* Progress bar labels */}
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                Day {effectiveDay}
              </span>
              <span className="text-slate-400 font-normal">of 30 Days</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {cyclePercent}% elapsed
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.invoices.cycleDueTarget || 'Pay Day: 25 Oct'}</span>
            </div>
          </div>

          {/* Visual Progress Bar Track */}
          <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 transition-all duration-1000 relative shadow-sm"
              style={{ width: `${cyclePercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>

            {/* Pay Day Marker Line at day 25 (83.3%) */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none" 
              style={{ left: `${(dueDay / totalCycleDays) * 100}%` }}
              title="Official Due Date: Day 25"
            ></div>
          </div>

          {/* Cycle Milestones */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 font-mono">
            <span>Day 1 (Start)</span>
            <span className="hidden sm:inline text-slate-500">Day 15 (Mid-Cycle)</span>
            <span className="text-blue-500 dark:text-blue-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Day 25 (Due Date)
            </span>
            <span>Day 30 (Rollover)</span>
          </div>
        </div>

        {/* Head of the Month Alert Message (Activates when <= 5 days left to 30-day mark) */}
        {isNearHeadOfMonth && (
          <div className="mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn transition-all
            bg-blue-500/10 border-blue-500/30 text-slate-900 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    {t.invoices.headOfMonthTitle || "Head of the Month is Near (Payment Reminder)"}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                    {daysLeftInCycle} Days Remaining
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {t.invoices.headOfMonthMsg || "Head of the month is near! Please get ready to settle last month's electricity bills before the 30-day rollover to avoid penalties or meter shutoff."}
                </p>
              </div>
            </div>

            {invoices.some(i => i.status !== 'paid') && (
              <button
                onClick={() => setActiveInvoiceForPay(invoices.find(i => i.status !== 'paid'))}
                className="px-4 py-2 rounded-xl font-bold text-xs transition shadow-md whitespace-nowrap shrink-0 self-start sm:self-auto
                  bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
              >
                Pay Last Month's Bill
              </button>
            )}
          </div>
        )}

      </div>

      {/* Summary KPI Cards */}
      <div className="space-y-3">
        {/* Outstanding Balance Hero Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden border
          bg-white border-slate-200 shadow-sm
          dark:bg-[#131F37] dark:border-slate-800 hover:dark:border-rose-500/30 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/20">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.invoices.outstandingBalance}</span>
            </div>
            {totalOutstanding > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase
                bg-blue-50 text-blue-700 border border-blue-200
                dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/40">
                Action Required
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalOutstanding.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">IQD</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Includes unpaid bills and municipal charges.
          </p>
        </div>

        {/* 2-column secondary cards: Unpaid Count & Next Due Date */}
        <div className="grid grid-cols-2 gap-3">
          {/* Unpaid Count */}
          <div className="glass-card rounded-2xl p-3.5 border
            bg-white border-slate-200 shadow-sm
            dark:bg-[#131F37] dark:border-slate-800 transition">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.invoices.unpaidBillsCount}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {invoices.filter(i => i.status !== 'paid').length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Bills</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              1 Overdue, 1 Pending
            </p>
          </div>

          {/* Next Due Date */}
          <div className="glass-card rounded-2xl p-3.5 border
            bg-white border-slate-200 shadow-sm
            dark:bg-[#131F37] dark:border-slate-800 transition">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-500/20">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.invoices.nextDueDate}</span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">
              25 Oct 2026
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              October cycle
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert Callout */}
      {invoices.some(i => i.status === 'warning_level_2') && (
        <div className="p-4 rounded-2xl flex flex-col gap-3 border
          bg-blue-50 border-blue-200 shadow-sm
          dark:bg-blue-950/30 dark:border-blue-500/40">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Warning Level 2: Disconnection Protocol
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                September invoice INV-2026-09-8492 is overdue. Settle balance to prevent automated meter relay shutoff.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveInvoiceForPay(invoices.find(i => i.status === 'warning_level_2'))}
            className="w-full py-2 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 text-center"
          >
            Settle Overdue Bill Now
          </button>
        </div>
      )}

      {/* Invoices List Mobile Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Billing Statements ({invoices.length})
          </h3>
        </div>

        {invoices.map((inv) => (
          <div 
            key={inv.id} 
            className="glass-card rounded-2xl p-4 border transition-all space-y-3.5
              bg-white border-slate-200 shadow-sm
              dark:bg-[#131F37] dark:border-slate-800 hover:border-blue-500/40"
          >
            {/* Top Row: Month, Due Date & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {inv.billingMonth}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Due: {inv.dueDate}</span>
                </div>
              </div>
              <div>
                {getStatusBadge(inv.status)}
              </div>
            </div>

            {/* Middle Row: Invoice ID, kWh & Amount */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {inv.invoiceNumber}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">
                  ⚡ {inv.kwhConsumed} kWh
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400 block">
                  {inv.amountIqd.toLocaleString()} IQD
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Base: {inv.baseTariffIqd.toLocaleString()} | Fee: {inv.municipalFeeIqd.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bottom Row: Action Button */}
            <div>
              {inv.status === 'paid' ? (
                <button
                  onClick={() => setActiveInvoiceForReceipt(inv)}
                  className="w-full py-2.5 px-4 rounded-xl border text-xs font-semibold transition shadow-sm flex items-center justify-center gap-2
                    bg-slate-100 border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-400
                    dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-blue-300 dark:hover:border-blue-500/40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.invoices.viewReceipt}</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveInvoiceForPay(inv)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2
                    bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-[0.99]"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.invoices.payNow} ({inv.amountIqd.toLocaleString()} IQD)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Payment Checkout Modal */}
      {activeInvoiceForPay && (
        <PaymentModal
          invoice={activeInvoiceForPay}
          onClose={() => setActiveInvoiceForPay(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Official Receipt Modal */}
      {activeInvoiceForReceipt && (
        <ReceiptModal
          invoice={activeInvoiceForReceipt}
          user={user}
          onClose={() => setActiveInvoiceForReceipt(null)}
        />
      )}

    </div>
  );
};
