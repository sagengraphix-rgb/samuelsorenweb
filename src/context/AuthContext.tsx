import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole } from '../types';

export const SUPER_ADMIN_EMAILS = [
  'sorensam84@gmail.com',
  'sorensam@gmail.com',
  'sagengraphix@gmail.com',
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
  loginWithPassword: (email: string, password: string, forAdmin?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUpWithPassword: (email: string, password: string, name?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: (forAdmin?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string; simulatedCode?: string }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  isPublicUser: boolean;
  adminEmails: string[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  loginWithPassword: async () => ({ success: false, error: 'Not implemented' }),
  signUpWithPassword: async () => ({ success: false, error: 'Not implemented' }),
  loginWithGoogle: async () => ({ success: false, error: 'Not implemented' }),
  sendPasswordReset: async () => ({ success: false, message: 'Not implemented' }),
  logout: async () => {},
  isSuperAdmin: false,
  isEditor: false,
  isAdmin: false,
  isPublicUser: false,
  adminEmails: SUPER_ADMIN_EMAILS
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to determine role from email or Firestore profile
  const resolveUserData = (email: string, uid?: string, displayName?: string, photoURL?: string): User => {
    const emailLower = email.trim().toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(emailLower);
    const isEd = EDITOR_EMAILS.includes(emailLower);
    const role: UserRole = isSuper ? 'superadmin' : (isEd ? 'editor' : 'public');

    let name = displayName || '';
    if (!name) {
      if (emailLower.includes('soren')) {
        name = 'Pastor Samuel Soren';
      } else if (emailLower.includes('editor')) {
        name = 'Editorial Team';
      } else if (isSuper) {
        name = 'Ministry Administrator';
      } else {
        name = emailLower.split('@')[0];
      }
    }

    return {
      uid: uid || `usr_${emailLower.replace(/[^a-z0-9]/g, '_')}`,
      email: emailLower,
      name,
      role,
      photoURL
    };
  };

  useEffect(() => {
    // 1. Check local storage cache
    const savedToken = localStorage.getItem('samuel_soren_user_token');
    const savedUser = localStorage.getItem('samuel_soren_user_data');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email && SUPER_ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
          parsed.role = 'superadmin';
        }
        setToken(savedToken);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('samuel_soren_user_token');
        localStorage.removeItem('samuel_soren_user_data');
      }
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        try {
          const idToken = await fbUser.getIdToken();
          const resolved = resolveUserData(
            fbUser.email,
            fbUser.uid,
            fbUser.displayName || undefined,
            fbUser.photoURL || undefined
          );

          // Check if there is an explicit user profile document in Firestore
          try {
            const userDocSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              if (data.role) resolved.role = data.role as UserRole;
              if (data.name) resolved.name = data.name;
            }
          } catch {
            // Firestore rules or offline
          }

          setToken(idToken);
          setUser(resolved);
          localStorage.setItem('samuel_soren_user_token', idToken);
          localStorage.setItem('samuel_soren_user_data', JSON.stringify(resolved));
        } catch (err) {
          console.warn('Firebase ID token retrieval error:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    if (newUser.email && SUPER_ADMIN_EMAILS.includes(newUser.email.toLowerCase())) {
      newUser.role = 'superadmin';
    }
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('samuel_soren_user_token', newToken);
    localStorage.setItem('samuel_soren_user_data', JSON.stringify(newUser));
  };

  // Login with Email & Password (with strict separate error messaging for public vs admin)
  const loginWithPassword = async (
    email: string,
    password: string,
    forAdmin = false
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    const emailLower = email.trim().toLowerCase();

    // If logging in through Admin portal, strictly guard administrative roles
    if (forAdmin) {
      const isSuper = SUPER_ADMIN_EMAILS.includes(emailLower);
      const isEd = EDITOR_EMAILS.includes(emailLower);
      if (!isSuper && !isEd) {
        return {
          success: false,
          error: 'Access denied: This portal is restricted to authorized ministry administrators. Please use Public Sign-In.'
        };
      }
    }

    // Attempt Firebase Authentication
    try {
      const credential = await signInWithEmailAndPassword(auth, emailLower, password);
      const fbUser = credential.user;
      const idToken = await fbUser.getIdToken();
      const resolved = resolveUserData(
        fbUser.email || emailLower,
        fbUser.uid,
        fbUser.displayName || undefined,
        fbUser.photoURL || undefined
      );

      // Verify admin role if this was through admin portal
      if (forAdmin && resolved.role !== 'superadmin' && resolved.role !== 'editor') {
        await signOut(auth);
        return {
          success: false,
          error: 'Access denied: This portal is restricted to authorized ministry administrators. Please use Public Sign-In.'
        };
      }

      login(idToken, resolved);
      return { success: true, user: resolved };
    } catch (fbErr: any) {
      console.warn('Firebase signInWithEmailAndPassword code:', fbErr.code);

      // Explicit error mapping as requested by user
      if (
        fbErr.code === 'auth/invalid-credential' ||
        fbErr.code === 'auth/user-not-found' ||
        fbErr.code === 'auth/wrong-password' ||
        fbErr.code === 'auth/invalid-email'
      ) {
        // Fallback to backend API check just in case demo/seeded account is tested
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailLower, password, isAdminOnly: forAdmin })
          });
          const data = await res.json();
          if (res.ok && data.token && data.user) {
            login(data.token, data.user);
            return { success: true, user: data.user };
          }
        } catch {
          // ignore backend error
        }

        return { success: false, error: 'Email or password is incorrect.' };
      }

      // If Firebase email/password provider is not yet turned on in console, fallback to backend API
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password, isAdminOnly: forAdmin })
        });
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          login(data.token, data.user);
          return { success: true, user: data.user };
        }
        return {
          success: false,
          error: data.error || 'Email or password is incorrect.'
        };
      } catch {
        return { success: false, error: 'Email or password is incorrect.' };
      }
    }
  };

  // Sign up for Public Users (with exact error messaging)
  const signUpWithPassword = async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    const emailLower = email.trim().toLowerCase();

    try {
      const credential = await createUserWithEmailAndPassword(auth, emailLower, password);
      const fbUser = credential.user;
      const idToken = await fbUser.getIdToken();
      const resolved = resolveUserData(fbUser.email || emailLower, fbUser.uid, name);

      // Save user profile to Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          name: resolved.name,
          email: resolved.email,
          role: resolved.role,
          createdAt: new Date().toISOString()
        });
      } catch {
        // Safe to proceed if Firestore write rules or offline
      }

      login(idToken, resolved);
      return { success: true, user: resolved };
    } catch (fbErr: any) {
      console.warn('Firebase createUserWithEmailAndPassword code:', fbErr.code);

      // Specific error as requested: "User already exists. Please sign in."
      if (fbErr.code === 'auth/email-already-in-use') {
        return { success: false, error: 'User already exists. Please sign in.' };
      }
      if (fbErr.code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (fbErr.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      // Fallback to backend API if Firebase email/password auth provider needs configuration
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password, name })
        });
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          login(data.token, data.user);
          return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Signup failed. Please try again.' };
      } catch {
        return { success: false, error: 'Signup service temporarily unavailable. Please try again.' };
      }
    }
  };

  // Google Single Sign-On (provisioned natively with Firebase)
  const loginWithGoogle = async (forAdmin = false): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const fbUser = credential.user;
      const idToken = await fbUser.getIdToken();
      const resolved = resolveUserData(
        fbUser.email || '',
        fbUser.uid,
        fbUser.displayName || undefined,
        fbUser.photoURL || undefined
      );

      if (forAdmin && resolved.role !== 'superadmin' && resolved.role !== 'editor') {
        await signOut(auth);
        return {
          success: false,
          error: 'Access denied: Google account is not recognized as an authorized ministry administrator.'
        };
      }

      login(idToken, resolved);
      return { success: true, user: resolved };
    } catch (err: any) {
      console.warn('Google sign-in error:', err.code, err.message);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in window was closed before completion.' };
      }
      return { success: false, error: err.message || 'Google sign-in could not be completed.' };
    }
  };

  // Password reset request
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string; simulatedCode?: string }> => {
    const emailLower = email.trim().toLowerCase();
    let firebaseSuccess = false;

    try {
      await sendPasswordResetEmail(auth, emailLower);
      firebaseSuccess = true;
    } catch (fbErr: any) {
      console.warn('Firebase sendPasswordResetEmail notice:', fbErr.code);
    }

    // Also call server helper for verification code fallback
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
            ? `Password reset link sent via Firebase to ${emailLower}. Verification code also generated.`
            : `Password reset verification initiated for ${emailLower}.`,
          simulatedCode: data.resetCode
        };
      }
    } catch (err) {
      console.error('Server reset error:', err);
    }

    if (firebaseSuccess) {
      return { success: true, message: `Password reset email dispatched to ${emailLower}.` };
    }

    return {
      success: false,
      message: `Unable to dispatch reset email for ${emailLower}. Please verify your email.`
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
    localStorage.removeItem('samuel_soren_user_token');
    localStorage.removeItem('samuel_soren_user_data');
  };

  const isSuperAdmin = !!user && (user.role === 'superadmin' || SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()));
  const isEditor = !!user && user.role === 'editor';
  const isAdmin = isSuperAdmin || isEditor;
  const isPublicUser = !!user && user.role === 'public';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithPassword,
        signUpWithPassword,
        loginWithGoogle,
        sendPasswordReset,
        logout,
        isSuperAdmin,
        isEditor,
        isAdmin,
        isPublicUser,
        adminEmails: SUPER_ADMIN_EMAILS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
