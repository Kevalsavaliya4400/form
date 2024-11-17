import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  getDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db, serverTimestamp } from '../lib/firebase';
import toast from 'react-hot-toast';

export interface FormElement {
  id: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'phone' | 'file' | 'rating' | 'heading' | 'paragraph' | 'image' | 'divider';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    acceptedFiles?: string[];
  };
  style?: {
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
    width?: string;
    height?: string;
    imageUrl?: string;
    columns?: number;
  };
}

export interface FormSubmission {
  id: string;
  formId: string;
  responses: Record<string, any>;
  submittedAt: Date;
  submittedBy?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
  style: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    borderRadius: string;
    fontFamily: string;
  };
  userId: string;
  published: boolean;
  submissions: FormSubmission[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  shareUrl?: string;
  embedCode?: string;
  settings?: {
    collectEmail: boolean;
    submitMessage: string;
    redirectUrl?: string;
    notifyOnSubmission: boolean;
  };
}

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  submissions: FormSubmission[];
  loading: boolean;
  error: string | null;
  fetchForms: (userId: string) => Promise<void>;
  fetchForm: (formId: string) => Promise<Form | null>;
  fetchSubmissions: (formId: string) => Promise<void>;
  saveForm: (form: Partial<Form>) => Promise<string>;
  updateForm: (formId: string, updates: Partial<Form>) => Promise<void>;
  deleteForm: (formId: string) => Promise<void>;
  publishForm: (formId: string) => Promise<void>;
  unpublishForm: (formId: string) => Promise<void>;
  submitFormResponse: (formId: string, responses: Record<string, any>, email?: string) => Promise<void>;
  setCurrentForm: (form: Form | null) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  currentForm: null,
  submissions: [],
  loading: false,
  error: null,

  fetchForms: async (userId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(db, 'forms'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const forms = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        publishedAt: doc.data().publishedAt?.toDate(),
      } as Form));
      set({ forms, loading: false });
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to load forms');
    }
  },

  fetchForm: async (formId) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(db, 'forms', formId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const formData = docSnap.data();
        const form = { 
          ...formData, 
          id: docSnap.id,
          createdAt: formData.createdAt?.toDate(),
          updatedAt: formData.updatedAt?.toDate(),
          publishedAt: formData.publishedAt?.toDate(),
        } as Form;
        set({ currentForm: form, loading: false });
        return form;
      }
      set({ loading: false });
      return null;
    } catch (error: any) {
      console.error('Error fetching form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to load form');
      return null;
    }
  },

  fetchSubmissions: async (formId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(db, `forms/${formId}/submissions`),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        submittedAt: doc.data().submittedAt?.toDate(),
      })) as FormSubmission[];
      set({ submissions, loading: false });
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to load submissions');
    }
  },

  saveForm: async (formData) => {
    try {
      set({ loading: true, error: null });
      const form = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        published: false,
        submissions: [],
      };
      
      const docRef = await addDoc(collection(db, 'forms'), form);
      const newForm = { ...form, id: docRef.id } as Form;
      set(state => ({ 
        forms: [newForm, ...state.forms],
        loading: false 
      }));
      
      toast.success('Form created successfully');
      return docRef.id;
    } catch (error: any) {
      console.error('Error saving form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to create form');
      throw error;
    }
  },

  updateForm: async (formId, updates) => {
    try {
      set({ loading: true, error: null });
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      set(state => ({
        forms: state.forms.map(form =>
          form.id === formId ? { ...form, ...updates, updatedAt: new Date() } : form
        ),
        loading: false
      }));
      
      toast.success('Form updated successfully');
    } catch (error: any) {
      console.error('Error updating form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to update form');
      throw error;
    }
  },

  deleteForm: async (formId) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'forms', formId));
      
      set(state => ({ 
        forms: state.forms.filter(form => form.id !== formId),
        loading: false 
      }));
      
      toast.success('Form deleted successfully');
    } catch (error: any) {
      console.error('Error deleting form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to delete form');
      throw error;
    }
  },

  publishForm: async (formId) => {
    try {
      set({ loading: true, error: null });
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        published: true,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      set(state => ({
        forms: state.forms.map(form =>
          form.id === formId ? { 
            ...form, 
            published: true, 
            publishedAt: new Date(),
            updatedAt: new Date()
          } : form
        ),
        loading: false
      }));
      
      toast.success('Form published successfully');
    } catch (error: any) {
      console.error('Error publishing form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to publish form');
      throw error;
    }
  },

  unpublishForm: async (formId) => {
    try {
      set({ loading: true, error: null });
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        published: false,
        updatedAt: serverTimestamp(),
      });
      
      set(state => ({
        forms: state.forms.map(form =>
          form.id === formId ? { 
            ...form, 
            published: false,
            updatedAt: new Date()
          } : form
        ),
        loading: false
      }));
      
      toast.success('Form unpublished successfully');
    } catch (error: any) {
      console.error('Error unpublishing form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to unpublish form');
      throw error;
    }
  },

  submitFormResponse: async (formId, responses, email?) => {
    try {
      set({ loading: true, error: null });
      const submission = {
        formId,
        responses,
        submittedAt: serverTimestamp(),
        submittedBy: email,
      };
      
      await addDoc(collection(db, `forms/${formId}/submissions`), submission);
      set({ loading: false });
      
      toast.success('Form submitted successfully');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to submit form');
      throw error;
    }
  },

  setCurrentForm: (form) => set({ currentForm: form }),
}));