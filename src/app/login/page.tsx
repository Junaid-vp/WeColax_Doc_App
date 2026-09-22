'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ChevronRight, KeyRound, Loader2, User, Mail, Fingerprint } from 'lucide-react';
import { verifyPasswordAction, verifyOtpAction, hasPasskeysAction } from '@/app/actions/auth';
import { getAuthenticationOptionsAction, verifyAuthenticationAction } from '@/app/actions/webauthn';
import { startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'CEO' | 'CTO' | 'COO' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const router = useRouter();

  const getEmailForRole = (r: string | null) => {
    switch (r) {
      case 'CEO': return 'ceo@wecolax.com';
      case 'CTO': return 'cto@wecolax.com';
      case 'COO': return 'coo@wecolax.com';
      default: return '';
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const prefix = emailInput.substring(0, 3).toUpperCase();
    if (prefix === 'CEO' || prefix === 'CTO' || prefix === 'COO') {
      const email = getEmailForRole(prefix);
      setLoading(true);
      const passkeysEnabled = await hasPasskeysAction(email);
      setHasPasskeys(passkeysEnabled);
      setShowPasswordFallback(!passkeysEnabled);
      setLoading(false);

      setRole(prefix as 'CEO' | 'CTO' | 'COO');
      setStep(2);
    } else {
      setError('Invalid email or role not recognized.');
    }
  };

  const handlePasskeySubmit = async () => {
    if (!role) return;
    setLoading(true);
    setError('');
    try {
      const email = getEmailForRole(role);
      const options = await getAuthenticationOptionsAction(email);
      let authResponse;
      try {
        authResponse = await startAuthentication(options);
      } catch (err: any) {
        setError('Authentication cancelled or failed.');
        setLoading(false);
        return;
      }
      
      const res = await verifyAuthenticationAction(authResponse, email);
      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError('An error occurred during authentication.');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setLoading(true);
    setError('');

    const email = getEmailForRole(role);
    const res = await verifyPasswordAction(email, password);
    
    if (res.success) {
      setStep(3);
    } else {
      setError(res.error || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError('');

    const email = getEmailForRole(role);
    const res = await verifyOtpAction(email, otp);
    
    if (res.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(res.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden relative selection:bg-purple-200">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Animated Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md p-8 relative z-10"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-2xl bg-white/70 border border-slate-200 p-8 rounded-3xl shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400" />

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">WeColax Vault</h1>
            <p className="text-sm text-slate-500">Secure Internal Portal Access</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <p className="text-center text-slate-600 text-sm mb-4">Enter your executive email</p>
                
                <div>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-purple-600" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98] shadow-md shadow-purple-600/20"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="text-center p-3 rounded-xl bg-slate-100 border border-slate-200 mb-4">
                  <p className="text-sm text-slate-600">
                    Logging in as <strong className="text-slate-900">{role}</strong>
                  </p>
                </div>

                {hasPasskeys && !showPasswordFallback ? (
                  <div className="space-y-4">
                    <button
                      onClick={handlePasskeySubmit}
                      disabled={loading}
                      className="w-full bg-purple-600 text-white font-semibold rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98] shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none group"
                    >
                      {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                        <>
                          <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <span>Sign in with Passkey</span>
                        </>
                      )}
                    </button>
                    
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPasswordFallback(true)}
                      className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors py-2"
                    >
                      Use Password instead
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-purple-600" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                        {error}
                      </motion.p>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-purple-600/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          Verify Identity <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setHasPasskeys(false);
                    setShowPasswordFallback(false);
                  }}
                  className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors py-2 mt-2"
                >
                  &larr; Switch Role
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-200 mb-4">
                  <p className="text-sm text-purple-700">
                    A secure one-time password has been sent to the central inbox.
                  </p>
                </div>

                <div>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-purple-600" />
                    <input
                      type="text"
                      required
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all tracking-widest text-center text-lg font-mono shadow-sm"
                      maxLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                    {error}
                  </motion.p>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98] shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Session'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors py-2 mt-2"
                >
                  &larr; Back to Password
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
        
        <div className="mt-8 flex justify-center items-center gap-2 opacity-70">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Secured by Cloudflare Turnstile & AES-256</span>
        </div>
      </motion.div>
    </div>
  );
}
