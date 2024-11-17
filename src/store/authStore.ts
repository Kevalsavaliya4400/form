import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user && !user.emailVerified) {
          await firebaseSignOut(auth);
          set({ user: null, loading: false, initialized: true });
          return;
        }
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
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password'
        : error.message;
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
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Sign out the user until they verify their email
      await firebaseSignOut(auth);
      set({ user: null });
      
      toast.success('Account created! Please check your email to verify your account');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : error.message;
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