import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, AlertCircle, HeartPulse, Sparkles, Check } from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  intendedActionNotice?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  intendedActionNotice
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { loginWithGoogle, loginWithEmail, signupWithEmail, demoLogin } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setLocalError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        await signupWithEmail(email, password, name);
        showToast('Namaste! Account Created', `Welcome to CarePulse Hospital, ${name}!`);
      } else {
        await loginWithEmail(email, password);
        showToast('Signed In', 'Welcome back to CarePulse Hospital Patient Portal.');
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google', 'Authentication successful.');
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLocalError(err.message || 'Google sign in failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'patient' | 'admin') => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await demoLogin(role);
      showToast(
        role === 'admin' ? 'Chief Admin Verified' : 'Patient Access Granted',
        role === 'admin' ? `Signed in as ${AUTHORIZED_ADMIN_EMAIL}` : 'Signed in as Priya Sharma (Patient Demo)'
      );
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-800">
        
        {/* Tricolor accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

        {/* Header Graphic */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
              <HeartPulse className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">CarePulse Hospital India</h2>
              <p className="text-xs text-emerald-200 font-medium">Digital Healthcare & Patient Portal</p>
            </div>
          </div>

          {intendedActionNotice && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-xs text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{intendedActionNotice}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => { setMode('signin'); setLocalError(null); }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'signin' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setLocalError(null); }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {localError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-xs hover:border-slate-300 disabled:opacity-60 mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@carepulse.hospital"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-800/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : mode === 'signin' ? 'Sign In to Portal' : 'Register Patient Account'}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Evaluation Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Patient Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 text-xs font-semibold transition-colors"
                title={`Sign in as ${AUTHORIZED_ADMIN_EMAIL}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Demo</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Admin console is strictly authorized for <strong>{AUTHORIZED_ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
