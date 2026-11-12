import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PublicAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAccount: () => void;
  onNavigateToAdmin: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const PublicAuthModal: React.FC<PublicAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAccount,
  onNavigateToAdmin,
  defaultMode = 'signin'
}) => {
  const { loginWithPassword, signUpWithPassword, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(email.trim(), password, false);
      if (result.success) {
        setSuccessMsg('Signed in successfully! Welcome back.');
        setTimeout(() => {
          onClose();
          onOpenAccount();
        }, 600);
      } else {
        setError(result.error || 'Email or password is incorrect.');
      }
    } catch {
      setError('Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithPassword(email.trim(), password, name.trim());
      if (result.success) {
        setSuccessMsg('Account created successfully! Welcome to the ministry family.');
        setTimeout(() => {
          onClose();
          onOpenAccount();
        }, 700);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(false);
      if (result.success) {
        setSuccessMsg('Signed in with Google successfully!');
        setTimeout(() => {
          onClose();
          onOpenAccount();
        }, 600);
      } else {
        setError(result.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#30203D] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-300 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-[#C83338] mb-1 font-bold text-xs uppercase tracking-widest">
            <span>Pastor Samuel Soren Ministries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            {mode === 'signin' ? 'Member Sign In' : 'Join the Community'}
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            {mode === 'signin'
              ? 'Access your giving receipts, ministry notes, and bookstore orders.'
              : 'Create a free member account to stay connected with Pastor Samuel Soren.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex mt-4 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                mode === 'signin'
                  ? 'bg-white text-[#30203D] shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                mode === 'signup'
                  ? 'bg-white text-[#30203D] shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-600 text-green-800 text-xs rounded-r flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sister / Brother Name"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#C83338] focus:border-transparent outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#C83338] focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#C83338] focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#C83338] focus:border-transparent outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#C83338] hover:bg-[#b0282d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-neutral-400 uppercase font-medium">Or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-md shadow-2xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            ) : (
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
            )}
            <span>Continue with Google</span>
          </button>

          {/* Admin Switch Link */}
          <div className="mt-5 pt-3 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              Are you pastoral staff or an administrator?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdmin();
                }}
                className="text-[#C83338] font-bold hover:underline"
              >
                Go to Admin Portal &rarr;
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
