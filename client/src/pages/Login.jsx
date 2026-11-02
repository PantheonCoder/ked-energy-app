import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Zap, 
  ShieldCheck, 
  Eye,
  EyeOff,
  User, 
  Hash, 
  MapPin, 
  ArrowRight, 
  Loader2,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

export const Login = ({ onNavigate = () => {} }) => {
  const { login, loginDemo, register, loading } = useAuth();
  const { lang, langCode, setLang, t, isRtl } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('KED-84920');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Register extra fields
  const [fullName, setFullName] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [userCode, setUserCode] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Erbil (Hewlêr)');
  const [neighborhood, setNeighborhood] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!userCode || !meterNumber || !fullName || !password) {
        setError('Please fill all mandatory fields');
        return;
      }
      const res = await register({
        userCode,
        meterNumber,
        fullName,
        password,
        phone,
        city,
        neighborhood
      });
      if (!res.success) setError(res.message);
    } else {
      if (!identifier || !password) {
        setError('Please enter User Code/Meter and Password');
        return;
      }
      const res = await login(identifier, password);
      if (res.success) {
        onNavigate(res.role === 'admin' ? '/admin/grid-monitor' : '/');
      } else {
        setError(res.message);
      }
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    const res = await loginDemo();
    if (res.success) {
      onNavigate(res.role === 'admin' ? '/admin/grid-monitor' : '/');
    } else {
      setError(res.message || 'Unable to start a demo session');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200">
      
      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Top Controls Bar: Language Switcher & Theme Changer */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ckb' : lang === 'ckb' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300 transition shadow-sm"
          title="Switch Language (EU / KU / AB)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{langCode}</span>
        </button>

        {/* Theme Changer Toggle Icon */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="p-1.5 rounded-xl border transition shadow-sm bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40"
          title={isDark ? "Switch to Daylight Theme" : "Switch to Dark Theme"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#3B82F6] transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#3B82F6] transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-xl shadow-blue-500/20 mb-2">
            <div className="w-full h-full bg-white dark:bg-[#0F172A] rounded-[14px] flex items-center justify-center">
              <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-900 dark:text-white">
            {t.appName}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t.auth.subtitle}
          </p>
        </div>


        {/* Auth Glass Card Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0F172A]">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                !isRegister 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/30' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                isRegister 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/30' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Register Meter
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/40 dark:text-blue-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Register Specific Fields */}
            {isRegister && (
              <>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Full Citizen Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Soran Mohammed Ali"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">New User Code</label>
                    <input
                      type="text"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="KED-10293"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Meter Serial</label>
                    <input
                      type="text"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      placeholder="ERB-481920-M"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">City / Governorate</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Erbil (Hewlêr)">Erbil (Hewlêr)</option>
                    <option value="Sulaymaniyah (Slêmanî)">Sulaymaniyah (Slêmanî)</option>
                    <option value="Duhok">Duhok</option>
                  </select>
                </div>
              </>
            )}

            {/* Standard Login Fields */}
            {!isRegister && (
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">{t.auth.userCodeLabel}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t.auth.userCodePlaceholder}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs sm:text-sm font-mono focus:outline-none"
                  />
                  <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-3" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  Admin ID: admin123
                </p>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">{t.auth.passwordLabel}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? t.auth.registerBtn : t.auth.loginBtn}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

          </form>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-50 dark:hover:bg-blue-500/10 transition disabled:opacity-50"
          >
            Demo Login
          </button>

        </div>

      </div>

    </div>
  );
};
