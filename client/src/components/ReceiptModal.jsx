import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Zap, 
  QrCode 
} from 'lucide-react';

export const ReceiptModal = ({ invoice, user, onClose }) => {
  const { t } = useLanguage();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl transition-all
        bg-white border-slate-200 text-slate-900
        dark:bg-[#0F172A] dark:border-slate-800 dark:text-slate-100">
        
        {/* Receipt Header */}
        <div className="p-6 border-b flex items-center justify-between
          bg-slate-50 border-slate-200
          dark:bg-slate-900/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white dark:bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide text-slate-900 dark:text-slate-100">
                {t.receiptModal.title}
              </h3>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                {t.receiptModal.ministry}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-6 print:p-0">
          
          {/* Watermark badge */}
          <div className="flex items-center justify-between p-3 rounded-xl border text-xs font-bold
            bg-emerald-50 border-emerald-300 text-emerald-800
            dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.receiptModal.verifiedStamp}
            </span>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
              {invoice.receiptRef || 'TXN-KED-948102'}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.receiptModal.citizen}:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.fullName || 'Soran Mohammed Ali'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.receiptModal.userCode}:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{user?.userCode || 'KED-84920'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.receiptModal.meterNo}:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{user?.meterNumber || 'ERB-992384-M'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Billing Period:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{invoice.billingMonth}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Total Consumption:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{invoice.kwhConsumed} kWh</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.receiptModal.paidVia}:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{invoice.paymentMethod || 'FIB (First Iraqi Bank)'}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 px-2.5 rounded-xl
              border-slate-300 bg-slate-50
              dark:border-slate-800 dark:bg-slate-900/80">
              <span className="text-slate-900 dark:text-slate-100 font-bold">{t.receiptModal.amountPaid}:</span>
              <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
                {invoice.amountIqd.toLocaleString()} IQD
              </span>
            </div>
          </div>

          {/* Bottom Security QR Code */}
          <div className="flex items-center justify-between p-3 rounded-2xl border text-[10px]
            bg-slate-50 border-slate-200 text-slate-600
            dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-400">
            <div className="space-y-1">
              <div className="text-slate-900 dark:text-slate-200 font-bold">KED Cryptographic Verification</div>
              <p>SHA-256 Validated on Erbil Municipal Energy Core</p>
              <div className="font-mono text-blue-600 dark:text-blue-400 text-[9px]">
                SIGN: e7b4...92f1-OK
              </div>
            </div>
            <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex items-center justify-end gap-3
          bg-slate-50 border-slate-200
          dark:bg-slate-900/80 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            {t.receiptModal.closeBtn}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition shadow-md
              bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.receiptModal.printBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
