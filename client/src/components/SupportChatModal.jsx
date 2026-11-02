import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Headphones,
  CheckCheck
} from 'lucide-react';

export const SupportChatModal = ({ isOpen, onClose, user }) => {
  const { t, isRtl } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [spamWarning, setSpamWarning] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !user?.id) return undefined;
    let active = true;
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/support/conversations/${encodeURIComponent(user.id)}?viewer=user`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load support messages');
        if (active) {
          setMessages(data.messages);
          setError('');
        }
      } catch (loadError) {
        console.error('Unable to load support messages:', loadError);
        if (active) setError(loadError.message || 'Unable to load support messages');
      } finally {
        if (active) setLoadingMessages(false);
      }
    };
    setLoadingMessages(true);
    loadMessages();
    const poll = setInterval(loadMessages, 4000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages]);

  // Handle cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          setSpamWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (cooldown > 0 || sending) {
      setSpamWarning(true);
      return;
    }

    setSending(true);
    setError('');
    try {
      const response = await fetch(`/api/support/conversations/${encodeURIComponent(user.id)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to send support message');
      setMessages(current => [...current, data.message]);
      setInputText('');
      setSpamWarning(false);
      setCooldown(5);
    } catch (sendError) {
      console.error('Unable to send support message:', sendError);
      setError(sendError.message || 'Unable to send support message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className={`relative w-full max-w-md h-[92vh] max-h-[680px] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-all ${
        'bg-white border-slate-200 text-slate-900 dark:bg-[#0F172A] dark:border-slate-800 dark:text-slate-100'
      }`}>
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white dark:border-[#0F172A] animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {t.support.modalTitle}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  KRG
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                <span>{t.support.onlineStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={t.support.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Citizen Meter Context Banner */}
        <div className="px-4 py-2 border-b bg-blue-50/60 dark:bg-blue-950/20 border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">{user?.fullName || 'Citizen User'}</span>
            <span className="font-mono text-slate-400">({user?.userCode || 'KED-84920'})</span>
          </div>
          <div className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {user?.meterNumber || 'ERB-992384-M'}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {!loadingMessages && messages.length === 0 && (
            <p className="rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">No messages yet. Send a text message to contact support.</p>
          )}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-[10px] text-slate-400 font-mono px-1 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-blue-400 inline" />}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {error && <p role="alert" className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

        {/* Anti-Spam Warning Alert Banner */}
        {spamWarning && (
          <div className="px-4 py-2 bg-blue-500/15 border-t border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#3B82F6]" />
            <span>{t.support.antiSpamWarning.replace('{seconds}', cooldown)}</span>
          </div>
        )}

        {/* Chat Input & Anti-Spam Send Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-slate-50 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={2000}
              disabled={sending}
              placeholder={cooldown > 0 ? `Wait ${cooldown}s (Anti-Spam)...` : t.support.inputPlaceholder}
              className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-xs focus:outline-none transition ${
                cooldown > 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || cooldown > 0 || sending}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                !inputText.trim() || cooldown > 0 || sending
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                  : 'bg-[#3B82F6] hover:bg-blue-600 text-white shadow-blue-500/25 active:scale-95'
              }`}
            >
              {cooldown > 0 ? (
                <span className="font-mono text-[11px] text-white font-bold">{cooldown}s</span>
              ) : (
                <>
                  <Send className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{t.support.sendBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom security micro-notice */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{t.support.ministryBadge}</span>
            </span>
            <span className="font-mono text-[9px]">Anti-Spam: 5s delay</span>
          </div>
        </form>

      </div>
    </div>
  );
};
