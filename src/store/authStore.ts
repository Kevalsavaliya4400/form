import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
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
}

// Configure email verification settings
const actionCodeSettings: ActionCodeSettings = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: true
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
      
      // Send verification email with custom settings
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
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
      await sendEmailVerification(user, actionCodeSettings);
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