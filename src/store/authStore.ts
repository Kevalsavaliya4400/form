import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  User,
  ActionCodeSettings
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface UserData {
  email: string;
  fullName: string;
  companyName: string;
  industry: string;
  interests: string[];
  additionalInfo?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: UserData) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
}

// Configure action code settings for email actions
const actionCodeSettings: ActionCodeSettings = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.formbuilder.ios'
  },
  android: {
    packageName: 'com.formbuilder.android',
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: 'formbuilder.page.link'
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        set({ user, loading: false, initialized: true });
      },
      (error) => {
        console.error('Auth state change error:', error);
        set({ error: error.message, loading: false, initialized: true });
      }
    );
    return unsubscribe;
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        set({ error: 'Please verify your email before signing in', user: null });
        toast.error('Please verify your email before signing in');
        throw new Error('Email not verified');
      }

      set({ user: userCredential.user });
      toast.success('Signed in successfully');
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
      }
      
      set({ error: errorMessage, user: null });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Send verification email with custom settings and continuous retries
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          break;
        } catch (error) {
          console.error(`Failed to send verification email (attempt ${retries + 1}):`, error);
          retries++;
          if (retries === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }
      
      // Sign out the user until they verify their email
      await firebaseSignOut(auth);
      set({ user: null });
      
      toast.success('Account created! Please check your email to verify your account. Check your spam folder if you don\'t see it.');
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
      }
      
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resendVerificationEmail: async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('No user found. Please try signing up again.');
      return;
    }

    try {
      set({ loading: true, error: null });
      
      // Implement retry logic for sending verification email
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await sendEmailVerification(user, actionCodeSettings);
          break;
        } catch (error) {
          console.error(`Failed to send verification email (attempt ${retries + 1}):`, error);
          retries++;
          if (retries === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      toast.success('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      const errorMessage = 'Failed to send verification email. Please try again later.';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      // Implement retry logic for password reset email
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await sendPasswordResetEmail(auth, email, actionCodeSettings);
          break;
        } catch (error) {
          console.error(`Failed to send reset email (attempt ${retries + 1}):`, error);
          retries++;
          if (retries === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      toast.success('Password reset email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Password reset is not enabled. Please contact support.';
          break;
      }
      
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async (actionCode: string) => {
    try {
      set({ loading: true, error: null });
      await applyActionCode(auth, actionCode);
      toast.success('Email verified successfully! You can now sign in.');
    } catch (error: any) {
      let errorMessage = 'Failed to verify email';
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          errorMessage = 'The verification link is invalid or has expired';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
      }
      
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ user: null });
      toast.success('Signed out successfully');
    } catch (error: any) {
      set({ error: error.message });
      toast.error('Failed to sign out');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));