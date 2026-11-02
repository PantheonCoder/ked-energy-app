import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportChatModal } from '../components/SupportChatModal';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Check, 
  Fingerprint, 
  Lock, 
  MapPin, 
  Save, 
  CheckCircle2,
  Headphones
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateSettings } = useAuth();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  // Security states
  const [biometric, setBiometric] = useState(user?.biometricEnabled ?? true);
  const [newPassword, setNewPassword] = useState('');

  // Status notice
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveSecurity = async () => {
    const res = await updateSettings({
      biometricEnabled: biometric,
      newPassword: newPassword || undefined
    });
    if (res.success) {
      setSavedMessage('Security preferences & credentials updated!');
      setErrorMessage('');
      setNewPassword('');
      setTimeout(() => setSavedMessage(''), 4000);
    } else {
      setErrorMessage(res.message || 'Unable to update security settings');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            {t.settings.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.settings.sub}
          </p>
        </div>

        {/* Tech Support Button */}
        <button
          onClick={() => setSupportChatOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md shrink-0
            bg-[#3B82F6] hover:bg-blue-600
            text-white shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 group"
          title={t.support.openChat}
        >
          <div className="relative">
            <Headphones className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-[#0F172A] animate-pulse" />
          </div>
          <span className="hidden sm:inline">{t.support.chatBtn}</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3B82F6]" />
          <span>{savedMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.settings.profileTab}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.settings.securityTab}</span>
        </button>
      </div>

      {/* SubTab 1: Citizen Profile Details (Official Read-Only & Verified) */}
      {activeSubTab === 'profile' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131F37] space-y-6">
          
          {/* Card Header with Verified Badge */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span>Verified Citizen Identity & Meter Registry</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Ministry of Electricity registration record — read-only citizen profile.
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold self-start sm:self-auto">
              <Lock className="w-3.5 h-3.5" />
              <span>Official Record Locked</span>
            </div>
          </div>

          {/* Ministry Integrity Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                Authority Restricted: Tamper-Proof Citizen Data
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To maintain data integrity and prevent misleading or unverified utility records, citizen profile credentials (Full Legal Name, Mobile Phone, Smart Meter Serial, and Registered Property Address) cannot be modified online. Any modifications or transfers of ownership require in-person verification at an authorized KED Directorate service center with your original National ID.
              </p>
            </div>
          </div>

          {/* Read-Only Citizen Identity Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            
            {/* Full Name */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Citizen Name
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#3B82F6]" /> Verified ID 🔒
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.fullName || 'Demo KED Customer'}
              </div>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Registered Mobile Phone
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Registered
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                {user?.phone || '+964 750 000 0000'}
              </div>
            </div>

            {/* City / Governorate */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Governorate / City
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.city || 'Erbil (Hewlêr / أربيل)'}
              </div>
            </div>

            {/* Neighborhood */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Neighborhood / Quarter
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.neighborhood || 'Demo District'}
              </div>
            </div>

            {/* Street */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Street / Avenue
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.street || 'Sample Service Road'}
              </div>
            </div>

            {/* House / Villa No */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                House / Property Number
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.houseNumber || 'Demo House 1'}
              </div>
            </div>

          </div>

          {/* Smart Meter Hardware & Registration Specs */}
          <div className="p-4 rounded-2xl border grid grid-cols-1 gap-3 bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">
                Citizen User Code
              </span>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {user?.userCode || 'KED-84920'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">
                {t.settings.meterNumber}
              </span>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {user?.meterNumber || 'ERB-992384-M'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">
                {t.settings.meterType}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {user?.meterType || 'EDMI Mk10 3-Phase 60A'}
              </span>
            </div>
          </div>

          {/* Official Registry Footer Notice */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
              <span>Ministry of Electricity — Authenticated Citizen Registry</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>KED Directorate Support Hotline:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">122 / support@ked.krg.gov</span>
            </div>
          </div>

        </div>
      )}

      {/* Security settings */}
      {activeSubTab === 'security' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131F37] space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
              <span>{t.settings.securityTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.settings.securityDesc}
            </p>
          </div>

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{t.settings.biometricTitle}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">{t.settings.biometricDesc}</p>
            </div>
            <button
              type="button"
              dir="ltr"
              onClick={() => setBiometric(!biometric)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                biometric ? 'bg-[#3B82F6]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={biometric}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                  biometric ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Change Password */}
          <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{t.settings.changePassword}</span>
            </h4>
            <div className="max-w-md">
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">{t.settings.newPassword}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter 6+ characters"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition
                  bg-white border-slate-300 text-slate-900 focus:border-blue-500
                  dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSecurity}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-md
                bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
            >
              <Save className="w-4 h-4" />
              <span>{t.settings.updateSecurity}</span>
            </button>
          </div>
        </div>
      )}

      {/* Support Chat Modal */}
      <SupportChatModal
        isOpen={supportChatOpen}
        onClose={() => setSupportChatOpen(false)}
        user={user}
      />

    </div>
  );
};
