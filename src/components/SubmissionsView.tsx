import React, { useState, useEffect } from 'react';
import { useFormStore, FormSubmission, FormElement } from '../store/formStore';
import { Download, Search, ChevronDown, ChevronUp, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface SubmissionsViewProps {
  formId: string;
  elements: FormElement[];
}

export const SubmissionsView = ({ formId, elements }: SubmissionsViewProps) => {
  const { submissions, fetchSubmissions, loading } = useFormStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSubmissions(formId);
  }, [formId]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredSubmissions = submissions
    .filter(submission => {
      // Apply search term
      const searchMatch = Object.values(submission.responses).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply filters
      const filterMatch = Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        const response = String(submission.responses[field]).toLowerCase();
        return response.includes(value.toLowerCase());
      });

      return searchMatch && filterMatch;
    })
    .sort((a, b) => {
      let aValue = sortField === 'submittedAt' ? a.submittedAt : a.responses[sortField];
      let bValue = sortField === 'submittedAt' ? b.submittedAt : b.responses[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

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
            <p className="text-sm text-gray-500 mt-1">
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'response' : 'responses'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 gap-4 overflow-hidden"
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
                      className="w-full px-3 py-2 border rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {elements.map((element) => (
                  <th
                    key={element.id}
                    onClick={() => handleSort(element.id)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{element.label}</span>
                      {sortField === element.id && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th
                  onClick={() => handleSort('submittedAt')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Submitted At</span>
                    {sortField === 'submittedAt' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  {elements.map((element) => (
                    <td key={element.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.responses[element.id] || '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.submittedAt), 'MMM d, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};