import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFormStore } from '../store/formStore';
import {
  PlusCircle,
  Copy,
  ExternalLink,
  BarChart2,
  Settings,
  Trash2,
  Clock,
  CheckCircle,
  Code,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const {
    forms,
    fetchForms,
    publishForm,
    unpublishForm,
    deleteForm,
    loading: formsLoading,
  } = useFormStore();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [submissionCounts, setSubmissionCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const loadData = async () => {
      if (!authLoading && user) {
        try {
          await fetchForms(user.uid);
          // Fetch submission counts for each form
          const counts: Record<string, number> = {};
          for (const form of forms) {
            const submissionsSnapshot = await getDocs(
              collection(db, `forms/${form.id}/submissions`)
            );
            counts[form.id] = submissionsSnapshot.size;
          }
          setSubmissionCounts(counts);
        } catch (error) {
          console.error('Error fetching data:', error);
          if ((error as any).code === 'permission-denied') {
            toast.error('Please sign in to view your forms');
            navigate('/login');
          }
        }
      }
    };

    loadData();
  }, [user, authLoading]);

  const handlePublish = async (formId: string) => {
    try {
      await publishForm(formId);
      toast.success('Form published successfully');
    } catch (error) {
      console.error('Error publishing form:', error);
      toast.error('Failed to publish form');
    }
  };

  const handleUnpublish = async (formId: string) => {
    try {
      await unpublishForm(formId);
      toast.success('Form unpublished successfully');
    } catch (error) {
      console.error('Error unpublishing form:', error);
      toast.error('Failed to unpublish form');
    }
  };

  const handleDelete = async (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteForm(formId);
        toast.success('Form deleted successfully');
      } catch (error) {
        console.error('Error deleting form:', error);
        toast.error('Failed to delete form');
      }
    }
  };

  const copyEmbedCode = (formId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${formId}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const copyShareLink = (formId: string) => {
    const shareLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard');
  };

  if (authLoading || formsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
            <p className="mt-2 text-gray-600">
              Create, manage, and track your forms
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 text-blue-500 mb-4">
              <PlusCircle className="h-full w-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create your first form
            </h3>
            <p className="text-gray-500 mb-8">
              Get started by creating a new form to collect responses
            </p>
            <Link
              to="/builder"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-blue-500 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {form.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {form.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete form"
                      >
                        <Trash2 size={18} />
                      </button>
                      <Link
                        to={`/builder/${form.id}`}
                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit form"
                      >
                        <Settings size={18} />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <BarChart2 className="h-4 w-4 mr-1" />
                      {submissionCounts[form.id] || 0} responses
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {form.published ? (
                      <>
                        <div className="flex items-center text-sm text-green-600 mb-4">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Published
                        </div>
                        <button
                          onClick={() => copyShareLink(form.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Share Link
                        </button>
                        <button
                          onClick={() => copyEmbedCode(form.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Get Embed Code
                        </button>
                        <button
                          onClick={() => handleUnpublish(form.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Unpublish Form
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handlePublish(form.id)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Publish Form
                      </button>
                    )}
                  </div>
                </div>

                {selectedForm === form.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">
                          {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last updated:</span>
                        <span className="text-gray-900">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Responses:</span>
                        <span className="text-gray-900">
                          {submissionCounts[form.id] || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    setSelectedForm(selectedForm === form.id ? null : form.id)
                  }
                  className="w-full px-6 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  {selectedForm === form.id ? 'Show less' : 'Show more details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
