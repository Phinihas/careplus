import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from '../firebase';
import { UserProfile, UserRole } from '../types';
import { getUserProfile, saveUserProfile } from '../services/dbService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  demoLogin: (targetRole: 'patient' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin access is strictly reserved for phinihasgandi@gmail.com
export const AUTHORIZED_ADMIN_EMAIL = 'phinihasgandi@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userEmailLower = (currentUser.email || '').trim().toLowerCase();
          const isMasterAdmin = userEmailLower === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

          // Fetch or initialize profile
          let userProfile = await getUserProfile(currentUser.uid);

          if (!userProfile) {
            userProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Patient'),
              photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              role: isMasterAdmin ? 'admin' : 'patient',
              createdAt: Date.now(),
              phone: '+91 98450 12345',
              bloodGroup: 'B+',
              emergencyContact: '+91 98450 98765'
            };
            await saveUserProfile(userProfile);
          } else {
            // Strictly enforce: only phinihasgandi@gmail.com gets admin role
            const shouldBeAdmin = isMasterAdmin;
            if (shouldBeAdmin && userProfile.role !== 'admin') {
              userProfile.role = 'admin';
              await saveUserProfile(userProfile);
            } else if (!shouldBeAdmin && userProfile.role === 'admin') {
              userProfile.role = 'patient';
              await saveUserProfile(userProfile);
            }
          }
          setProfile(userProfile);
        } catch (e) {
          console.error('Error in profile handling:', e);
          const isMasterAdmin = (currentUser.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Patient',
            photoURL: currentUser.photoURL || undefined,
            role: isMasterAdmin ? 'admin' : 'patient',
            createdAt: Date.now()
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please allow popups or use email sign in.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message || 'Failed to sign in with Google');
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      setAuthError(error.message || 'Invalid email or password');
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setAuthError(null);
      const cleanEmail = email.trim();
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const isMasterAdmin = cleanEmail.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
      
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: cleanEmail,
        displayName: name || cleanEmail.split('@')[0],
        role: isMasterAdmin ? 'admin' : 'patient',
        createdAt: Date.now(),
        phone: '+91 98450 12345',
        bloodGroup: 'B+',
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`
      };
      await saveUserProfile(newProfile);
      setProfile(newProfile);
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthError(error.message || 'Failed to register account');
      throw error;
    }
  };

  // Demo sign-in for quick evaluation
  const demoLogin = async (targetRole: 'patient' | 'admin') => {
    setAuthError(null);
    const demoEmail = targetRole === 'admin' ? AUTHORIZED_ADMIN_EMAIL : 'priya.sharma@carepulse.demo';
    const demoPass = 'HospitalCare2026!';
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          const isMasterAdmin = demoEmail.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
          const newProfile: UserProfile = {
            uid: res.user.uid,
            email: demoEmail,
            displayName: isMasterAdmin ? 'Dr. Phinihas Gandi (Chief Medical Director)' : 'Priya Sharma (Patient)',
            role: isMasterAdmin ? 'admin' : 'patient',
            createdAt: Date.now(),
            phone: isMasterAdmin ? '+91 (080) 4122-9000' : '+91 98450 87654',
            bloodGroup: isMasterAdmin ? 'O+' : 'B+',
            photoURL: isMasterAdmin 
              ? 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
          };
          await saveUserProfile(newProfile);
          setProfile(newProfile);
        } catch (innerErr: any) {
          console.warn('Demo account setup note:', innerErr);
        }
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...details };
    await saveUserProfile(updated);
    setProfile(updated);
  };

  // Strictly verify admin access: user must be authenticated AND have email phinihasgandi@gmail.com
  const userEmailLower = (user?.email || '').trim().toLowerCase();
  const isAdmin = userEmailLower === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  const activeRole: UserRole = isAdmin ? 'admin' : 'patient';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role: activeRole,
      isAdmin,
      loading,
      authError,
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      demoLogin,
      logout,
      clearError: () => setAuthError(null),
      updateProfileDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
