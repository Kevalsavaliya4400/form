import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Form } from '../store/formStore';
import { FormPreview } from './FormPreview';
import { useFormStore } from '../store/formStore';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const FormView = () => {
  const { formId } = useParams<{ formId: string }>();
  const { submitFormResponse } = useFormStore();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      try {
        const formDoc = await getDoc(doc(db, 'forms', formId));
        
        if (!formDoc.exists()) {
          setError('Form not found');
          setLoading(false);
          return;
        }

        const formData = formDoc.data() as Form;
        
        if (!formData.published) {
          setError('This form is not available');
          setLoading(false);
          return;
        }

        // Get submission count
        const submissionsSnapshot = await getDocs(collection(db, `forms/${formId}/submissions`));
        const submissions = submissionsSnapshot.docs;

        setForm({
          ...formData,
          id: formDoc.id,
          submissions: submissions
        });
      } catch (err) {
        console.error('Error loading form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const handleSubmit = async (responses: Record<string, any>) => {
    if (!formId) return;
    
    try {
      await submitFormResponse(formId, responses);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Failed to submit form');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Form Not Found'}
          </h2>
          <p className="text-gray-600">
            The form you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            {form.settings?.submitMessage || 'Your response has been submitted successfully.'}
          </p>
          {form.settings?.redirectUrl ? (
            window.location.href = form.settings.redirectUrl
          ) : (
            <button
              onClick={() => {
                setSubmitted(false);
                window.location.reload();
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Submit Another Response
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <FormPreview
        title={form.title}
        description={form.description}
        elements={form.elements}
        style={form.style}
        onSubmit={handleSubmit}
      />
    </div>
  );
};