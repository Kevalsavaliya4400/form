import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
      (user) => {
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password'
        : error.message;
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully');
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