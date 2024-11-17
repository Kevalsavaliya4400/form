import React, { useState } from 'react';
import { FormElement, FormStyle } from '../store/formStore';
import { Check } from 'lucide-react';

interface FormPreviewProps {
  title: string;
  description?: string;
  elements: FormElement[];
  style: FormStyle;
  onSubmit: (responses: Record<string, any>) => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const FormPreview = ({ 
  title, 
  description, 
  elements, 
  style, 
  onSubmit,
  showHeader = false,
  showFooter = false 
}: FormPreviewProps) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    elements.forEach(element => {
      if (element.required && !responses[element.id]) {
        newErrors[element.id] = 'This field is required';
      }
      if (element.type === 'email' && responses[element.id] && 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses[element.id])) {
        newErrors[element.id] = 'Please enter a valid email address';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(responses);
    }
  };

  const renderHeader = () => {
    if (!showHeader) return null;
    return (
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-gray-600">{description}</p>}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (!showFooter) return null;
    return (
      <div className="bg-white border-t px-6 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-500">Powered by FormBuilder</p>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Terms & Privacy</a>
        </div>
      </div>
    );
  };

  const renderElement = (element: FormElement) => {
    switch (element.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
        return (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={element.type}
              value={responses[element.id] || ''}
              onChange={(e) => {
                setResponses({ ...responses, [element.id]: e.target.value });
                if (errors[element.id]) {
                  const newErrors = { ...errors };
                  delete newErrors[element.id];
                  setErrors(newErrors);
                }
              }}
              placeholder={element.placeholder}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors[element.id] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ borderRadius: style.borderRadius }}
            />
            {errors[element.id] && (
              <p className="mt-1 text-sm text-red-500">{errors[element.id]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={responses[element.id] || ''}
              onChange={(e) => {
                setResponses({ ...responses, [element.id]: e.target.value });
                if (errors[element.id]) {
                  const newErrors = { ...errors };
                  delete newErrors[element.id];
                  setErrors(newErrors);
                }
              }}
              placeholder={element.placeholder}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors[element.id] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ borderRadius: style.borderRadius }}
              rows={4}
            />
            {errors[element.id] && (
              <p className="mt-1 text-sm text-red-500">{errors[element.id]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={responses[element.id] || ''}
              onChange={(e) => {
                setResponses({ ...responses, [element.id]: e.target.value });
                if (errors[element.id]) {
                  const newErrors = { ...errors };
                  delete newErrors[element.id];
                  setErrors(newErrors);
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors[element.id] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ borderRadius: style.borderRadius }}
            >
              <option value="">Select an option</option>
              {element.options?.map((option, index) => (
                <option key={`${element.id}-option-${index}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[element.id] && (
              <p className="mt-1 text-sm text-red-500">{errors[element.id]}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`grid grid-cols-${element.style?.columns || 1} gap-2`}>
              {element.options?.map((option, index) => (
                <label key={`${element.id}-option-${index}`} className="flex items-center">
                  <input
                    type="radio"
                    name={element.id}
                    value={option}
                    checked={responses[element.id] === option}
                    onChange={(e) => setResponses({ ...responses, [element.id]: e.target.value })}
                    className="mr-2"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors[element.id] && (
              <p className="mt-1 text-sm text-red-500">{errors[element.id]}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`grid grid-cols-${element.style?.columns || 1} gap-2`}>
              {element.options?.map((option, index) => (
                <label key={`${element.id}-option-${index}`} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={responses[element.id]?.includes(option)}
                    onChange={(e) => {
                      const currentValues = responses[element.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      setResponses({ ...responses, [element.id]: newValues });
                    }}
                    className="mr-2"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors[element.id] && (
              <p className="mt-1 text-sm text-red-500">{errors[element.id]}</p>
            )}
          </div>
        );

      case 'heading':
        return (
          <h2
            key={element.id}
            style={{
              fontSize: element.style?.fontSize || '1.5rem',
              textAlign: (element.style?.textAlign as any) || 'left',
            }}
            className="font-bold mb-4"
          >
            {element.label}
          </h2>
        );

      case 'paragraph':
        return (
          <p
            key={element.id}
            style={{
              fontSize: element.style?.fontSize || '1rem',
              textAlign: (element.style?.textAlign as any) || 'left',
            }}
            className="mb-4 text-gray-600"
          >
            {element.label}
          </p>
        );

      case 'divider':
        return <hr key={element.id} className="my-6 border-gray-200" />;

      default:
        return null;
    }
  };

  return (
    <>
      {renderHeader()}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          fontFamily: style.fontFamily,
        }}
      >
        <form onSubmit={handleSubmit} className="p-8">
          {!showHeader && (
            <>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              {description && <p className="text-gray-600 mb-6">{description}</p>}
            </>
          )}

          {elements.map((element) => renderElement(element))}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: style.buttonColor,
                borderRadius: style.borderRadius,
              }}
            >
              <Check className="h-5 w-5 mr-2" />
              Submit Form
            </button>
          </div>
        </form>
      </div>
      {renderFooter()}
    </>
  );
};