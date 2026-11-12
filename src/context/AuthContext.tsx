import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

export const SUPER_ADMIN_EMAILS = [
  'sorensam84@gmail.com',
  'sorensam@gmail.com',
  'admin@samuelsoren.org'
];

export const EDITOR_EMAILS = [
  'editor@samuelsoren.org'
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string; simulatedCode?: string }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isEditor: boolean;
  adminEmails: string[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  loginWithPassword: async () => ({ success: false, error: 'Not implemented' }),
  sendPasswordReset: async () => ({ success: false, message: 'Not implemented' }),
  logout: async () => {},
  isSuperAdmin: false,
  isEditor: false,
  adminEmails: SUPER_ADMIN_EMAILS
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to resolve role and display name from email
  const resolveUserData = (email: string, uid?: string): User => {
    const emailLower = email.trim().toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(emailLower);
    const isEd = EDITOR_EMAILS.includes(emailLower);
    const role: 'superadmin' | 'editor' = isSuper ? 'superadmin' : (isEd ? 'editor' : 'superadmin');

    const name = emailLower.includes('soren') 
      ? 'Pastor Samuel Soren' 
      : (emailLower.includes('editor') ? 'Editorial Team' : 'Ministry Staff Admin');

    return {
      uid: uid || `usr_${emailLower.replace(/[^a-z0-9]/g, '_')}`,
      email: emailLower,
      name,
      role
    };
  };

  useEffect(() => {
    // 1. Check local storage cache
    const savedToken = localStorage.getItem('samuel_soren_admin_token');
    const savedUser = localStorage.getItem('samuel_soren_admin_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Ensure sorensam84@gmail.com is assigned superadmin privilege
        if (parsed.email && SUPER_ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
          parsed.role = 'superadmin';
        }
        setToken(savedToken);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('samuel_soren_admin_token');
        localStorage.removeItem('samuel_soren_admin_user');
      }
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        try {
          const idToken = await fbUser.getIdToken();
          const resolved = resolveUserData(fbUser.email, fbUser.uid);
          setToken(idToken);
          setUser(resolved);
          localStorage.setItem('samuel_soren_admin_token', idToken);
          localStorage.setItem('samuel_soren_admin_user', JSON.stringify(resolved));
        } catch (err) {
          console.warn('Failed to retrieve Firebase ID token:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Ensure sorensam84@gmail.com always gets superadmin role
    if (newUser.email && SUPER_ADMIN_EMAILS.includes(newUser.email.toLowerCase())) {
      newUser.role = 'superadmin';
    }
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('samuel_soren_admin_token', newToken);
    localStorage.setItem('samuel_soren_admin_user', JSON.stringify(newUser));
  };

  // Password-protected login flow using Firebase Auth (with fallback to server auth)
  const loginWithPassword = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const emailLower = email.trim().toLowerCase();
    
    // First, try Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();
      const resolved = resolveUserData(fbUser.email || emailLower, fbUser.uid);

      login(idToken, resolved);
      return { success: true, user: resolved };
    } catch (firebaseErr: any) {
      console.warn('Firebase signInWithEmailAndPassword note:', firebaseErr.code || firebaseErr.message);

      // Fallback / sync with local backend database
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password })
        });
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          login(data.token, data.user);
          return { success: true, user: data.user };
        }
        return { success: false, error: data.error || firebaseErr.message || 'Invalid email or password.' };
      } catch (backendErr: any) {
        return { success: false, error: firebaseErr.message || 'Login failed. Please check your credentials.' };
      }
    }
  };

  // Secure Forgot Password workflow using sendPasswordResetEmail from Firebase Auth SDK
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string; simulatedCode?: string }> => {
    const emailLower = email.trim().toLowerCase();
    let firebaseSuccess = false;
    let firebaseMessage = '';

    // 1. Attempt sendPasswordResetEmail via Firebase Auth SDK
    try {
      await sendPasswordResetEmail(auth, emailLower, {
        url: window.location.origin + '/admin',
        handleCodeInApp: false
      });
      firebaseSuccess = true;
      firebaseMessage = `Firebase password reset email has been dispatched to ${emailLower}. Please check your inbox and follow the secure link.`;
    } catch (fbErr: any) {
      console.warn('Firebase sendPasswordResetEmail notice:', fbErr.code, fbErr.message);
      firebaseMessage = fbErr.message || 'Firebase email service notice';
    }

    // 2. Also register with the server's password reset generator to provide fallback verification code
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: firebaseSuccess 
            ? `Official password reset email dispatched via Firebase Auth to ${emailLower}. Backup verification code also available below.` 
            : `Password reset verification initiated for ${emailLower}.`,
          simulatedCode: data.resetCode
        };
      }
    } catch (err) {
      console.error('Server reset backup error:', err);
    }

    if (firebaseSuccess) {
      return { success: true, message: firebaseMessage };
    }

    return {
      success: false,
      message: `Unable to dispatch reset email for ${emailLower}. Please verify that the email is an authorized administrator.`
    };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('samuel_soren_admin_token');
    localStorage.removeItem('samuel_soren_admin_user');
  };

  const isSuperAdmin = !!user && (user.role === 'superadmin' || SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()));
  const isEditor = !!user && user.role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithPassword,
        sendPasswordReset,
        logout,
        isSuperAdmin,
        isEditor,
        adminEmails: SUPER_ADMIN_EMAILS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
