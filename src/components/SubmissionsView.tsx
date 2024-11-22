import React, { useState, useEffect } from 'react';
import { useFormStore, FormElement, FormSubmission } from '../store/formStore';
import { SpamDetector, SpamAnalysis } from '../utils/spamDetector';
import { SubmissionRow } from './submissions/SubmissionRow';
import { SubmissionTag } from './submissions/SubmissionTag';
import { EditSubmissionModal } from './submissions/EditSubmissionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Filter, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface SubmissionsViewProps {
  formId: string;
  elements: FormElement[];
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({ formId, elements }) => {
  const { submissions, fetchSubmissions, updateSubmission, deleteSubmission, loading } = useFormStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [spamAnalyses, setSpamAnalyses] = useState<Record<string, SpamAnalysis>>({});
  const [spamFilter, setSpamFilter] = useState<'all' | 'spam' | 'valid'>('all');
  const spamDetector = SpamDetector.getInstance();

  useEffect(() => {
    fetchSubmissions(formId);
  }, [formId, fetchSubmissions]);

  useEffect(() => {
    const analyzeSubmissions = async () => {
      const analyses: Record<string, SpamAnalysis> = {};
      for (const submission of submissions) {
        analyses[submission.id] = await spamDetector.analyzeSubmission(submission.responses);
      }
      setSpamAnalyses(analyses);
    };

    if (submissions.length > 0) {
      analyzeSubmissions();
    }
  }, [submissions, spamDetector]);

  const handleEdit = (submission: FormSubmission) => {
    setEditingSubmission(submission);
  };

  const handleSaveEdit = async (editedResponses: Record<string, any>) => {
    if (!editingSubmission) return;

    try {
      await updateSubmission(formId, editingSubmission.id, editedResponses);
      setEditingSubmission(null);
      toast.success('Submission updated successfully');
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      await deleteSubmission(formId, submissionId);
      toast.success('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const filteredSubmissions = submissions
    .filter(submission => {
      const searchMatch = Object.values(submission.responses).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const filterMatch = Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        const response = String(submission.responses[field]).toLowerCase();
        return response.includes(value.toLowerCase());
      });

      const spamMatch = spamFilter === 'all' 
        ? true 
        : spamFilter === 'spam' 
          ? spamAnalyses[submission.id]?.isSpam 
          : !spamAnalyses[submission.id]?.isSpam;

      return searchMatch && filterMatch && spamMatch;
    })
    .sort((a, b) => {
      let aValue = sortField === 'submittedAt' ? a.submittedAt : a.responses[sortField];
      let bValue = sortField === 'submittedAt' ? b.submittedAt : b.responses[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredSubmissions.length / pageSize);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const downloadCSV = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }

    try {
      const headers = ['Submission ID', 'Submitted At', ...elements.map(e => e.label)];
      const csvContent = [
        headers.join(','),
        ...filteredSubmissions.map(sub => [
          sub.id,
          format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
          ...elements.map(element => {
            const value = sub.responses[element.id] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          })
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${formId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Submissions exported successfully');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Failed to export submissions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Submissions</h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-500">
                {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'response' : 'responses'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSpamFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    spamFilter === 'all'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSpamFilter('valid')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    spamFilter === 'valid'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  Valid
                </button>
                <button
                  onClick={() => setSpamFilter('spam')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    spamFilter === 'spam'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  Spam
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                showFilters || Object.values(filters).some(Boolean)
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.values(filters).some(Boolean) && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={downloadCSV}
              disabled={submissions.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg pl-10 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {elements.map((element) => (
                <div key={element.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {element.label}
                  </label>
                  <input
                    type="text"
                    value={filters[element.id] || ''}
                    onChange={(e) => setFilters({ ...filters, [element.id]: e.target.value })}
                    placeholder={`Filter by ${element.label.toLowerCase()}`}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Filter className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
          <p className="mt-1 text-sm text-gray-500">Share your form to start collecting responses</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matching submissions</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {elements.map((element) => (
                    <th
                      key={element.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {element.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((submission) => (
                  <SubmissionRow
                    key={submission.id}
                    submission={submission}
                    elements={elements}
                    spamAnalysis={spamAnalyses[submission.id] || { isSpam: false, confidence: 0, reasons: [] }}
                    onView={() => setSelectedSubmission(submission)}
                    onEdit={() => handleEdit(submission)}
                    onDelete={() => handleDelete(submission.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredSubmissions.length)} to{' '}
                  {Math.min(currentPage * pageSize, filteredSubmissions.length)} of {filteredSubmissions.length} results
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  {[10, 20, 30, 50, 100].map(size => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Submitted At</p>
                  <p className="font-medium">
                    {format(new Date(selectedSubmission.submittedAt), 'PPpp')}
                  </p>
                </div>

                <div className="space-y-4">
                  {elements.map(element => (
                    <div key={element.id}>
                      <p className="text-sm text-gray-500">{element.label}</p>
                      <p className="font-medium">
                        {selectedSubmission.responses[element.id] || '-'}
                      </p>
                    </div>
                  ))}
                </div>

                {spamAnalyses[selectedSubmission.id] && (
                  <div className="mt-4">
                    <SubmissionTag
                      type={spamAnalyses[selectedSubmission.id].isSpam ? 'spam' : 'valid'}
                      confidence={spamAnalyses[selectedSubmission.id].confidence}
                      reasons={spamAnalyses[selectedSubmission.id].reasons}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editingSubmission && (
        <EditSubmissionModal
          elements={elements}
          editedResponses={editingSubmission.responses}
          setEditedResponses={(responses) => handleSaveEdit(responses)}
          onClose={() => setEditingSubmission(null)}
          onSave={() => handleSaveEdit(editingSubmission.responses)}
        />
      )}
    </div>
  );
};