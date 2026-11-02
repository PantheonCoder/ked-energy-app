import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  ArrowRight
} from 'lucide-react';

export const PaymentModal = ({ invoice, onClose, onPaymentSuccess }) => {
  const { t, isRtl } = useLanguage();
  const [selectedGateway, setSelectedGateway] = useState('FIB');
  const [phoneWallet, setPhoneWallet] = useState('+964 750 ');
  const [pin, setPin] = useState('');
  const [cardNumber, setCardNumber] = useState('5241 •••• •••• 9104');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  if (!invoice) return null;

  const gateways = [
    {
      id: 'FIB',
      name: 'First Iraqi Bank (FIB)',
      badge: 'Zero Fee',
      icon: QrCode,
      description: t.paymentModal.fibDesc
    },
    {
      id: 'FastPay',
      name: 'FastPay Wallet',
      badge: 'Popular',
      icon: Smartphone,
      description: t.paymentModal.fastPayDesc
    },
    {
      id: 'ZainCash',
      name: 'Zain Cash',
      badge: 'Instant',
      icon: Smartphone,
      description: t.paymentModal.zainCashDesc
    },
    {
      id: 'NassWallet',
      name: 'NassWallet',
      badge: 'Kurdistan',
      icon: Smartphone,
      description: t.paymentModal.nassWalletDesc
    },
    {
      id: 'QiCard',
      name: 'Qi Card / Master Card',
      badge: 'National',
      icon: CreditCard,
      description: t.paymentModal.qiCardDesc
    }
  ];

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: selectedGateway,
          paymentDetails: { phoneWallet, pin }
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentResult(data);
        setCompleted(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(data.invoice);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl transition-all
        bg-white border-slate-200 text-slate-900
        dark:bg-[#0F172A] dark:border-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b
          bg-slate-50 border-slate-200
          dark:bg-slate-900/80 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              {t.paymentModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {invoice.billingMonth} — {invoice.invoiceNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!completed ? (
          <div className="p-6 space-y-6">
            
            {/* Amount Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl border
              bg-blue-50/70 border-blue-200
              dark:bg-blue-950/20 dark:border-blue-500/30">
              <div>
                <span className="text-xs text-slate-600 dark:text-slate-400 block">{t.paymentModal.amountToPay}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                    {invoice.amountIqd.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">IQD</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                <span>Consumption:</span>
                <div className="text-slate-900 dark:text-slate-100 font-bold font-mono text-sm">
                  {invoice.kwhConsumed} kWh
                </div>
              </div>
            </div>

            {/* Gateway Selection Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2.5">
                {t.paymentModal.selectGateway}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gateways.map((gw) => {
                  const Icon = gw.icon;
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <button
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm dark:border-blue-500 dark:bg-blue-500/15 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold
                          bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {gw.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold truncate w-full">{gw.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gateway Specific Input UI */}
            <div className="p-4 rounded-2xl border space-y-4
              bg-slate-50 border-slate-200
              dark:bg-slate-900/60 dark:border-slate-800">
              {selectedGateway === 'FIB' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  {/* Dynamic QR Code */}
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
                    <div className="w-28 h-28 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="w-full h-full border-2 border-dashed border-blue-400/80 rounded flex items-center justify-center p-1">
                        <QrCode className="w-16 h-16 text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{t.paymentModal.fibDesc}</p>
                    <div className="p-2 rounded-lg font-mono text-[11px] flex items-center justify-between border
                      bg-white border-slate-200 text-blue-700
                      dark:bg-slate-900 dark:border-slate-800 dark:text-blue-400">
                      <span>KED FIB Portal ID:</span>
                      <span className="font-bold">FIB-KRG-8829</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Or click the button below to complete direct simulator clearance.
                    </p>
                  </div>
                </div>
              )}

              {(selectedGateway === 'FastPay' || selectedGateway === 'ZainCash' || selectedGateway === 'NassWallet') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                      Wallet Mobile Number (+964)
                    </label>
                    <input
                      type="text"
                      value={phoneWallet}
                      onChange={(e) => setPhoneWallet(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition
                        bg-white border-slate-300 text-slate-900 focus:border-blue-500
                        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                      Security PIN / OTP
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition
                        bg-white border-slate-300 text-slate-900 focus:border-blue-500
                        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {selectedGateway === 'QiCard' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                      Qi Card / Mastercard Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition
                        bg-white border-slate-300 text-slate-900 focus:border-blue-500
                        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition
                          bg-white border-slate-300 text-slate-900 focus:border-blue-500
                          dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="•••"
                        className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition
                          bg-white border-slate-300 text-slate-900 focus:border-blue-500
                          dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:opacity-95 transition shadow-lg disabled:opacity-50
                  bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.paymentModal.processing}</span>
                  </>
                ) : (
                  <>
                    <span>{t.paymentModal.confirmPayment}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* Payment Success View */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t.paymentModal.success}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transaction settled via <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedGateway}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl border text-left font-mono text-xs space-y-2
              bg-slate-50 border-slate-200 text-slate-700
              dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Reference:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{paymentResult?.payment?.txnRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{invoice.amountIqd.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Officially Cleared</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm transition shadow-lg
                bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
            >
              Done & Return to Billing
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
