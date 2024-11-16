import React, { useState } from 'react';
import { FormElement, FormStyle } from '../store/formStore';
import { Check } from 'lucide-react';

interface FormPreviewProps {
  title: string;
  description?: string;
  elements: FormElement[];
  style: FormStyle;
  onSubmit: (responses: Record<string, any>) => void;
}

export const FormPreview = ({ title, description, elements, style, onSubmit }: FormPreviewProps) => {
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

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          fontFamily: style.fontFamily,
        }}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">{title}</h1>
            {description && (
              <p className="text-gray-600 text-lg">{description}</p>
            )}
          </div>

          {elements.map((element) => {
            if (element.type === 'heading') {
              return (
                <h2
                  key={element.id}
                  style={{
                    fontSize: element.style?.fontSize,
                    textAlign: element.style?.textAlign || 'left',
                  }}
                  className="font-bold"
                >
                  {element.label}
                </h2>
              );
            }

            if (element.type === 'paragraph') {
              return (
                <p
                  key={element.id}
                  style={{
                    fontSize: element.style?.fontSize,
                    textAlign: element.style?.textAlign || 'left',
                  }}
                >
                  {element.label}
                </p>
              );
            }

            if (element.type === 'image') {
              return (
                <img
                  key={element.id}
                  src={element.style?.imageUrl}
                  alt={element.label}
                  style={{ width: element.style?.width || '100%' }}
                  className="rounded-lg"
                />
              );
            }

            if (element.type === 'divider') {
              return <hr key={element.id} className="my-6 border-gray-200" />;
            }

            return (
              <div key={element.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {element.label}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {element.type === 'textarea' ? (
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[element.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ borderRadius: style.borderRadius }}
                    rows={4}
                  />
                ) : element.type === 'select' ? (
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[element.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ borderRadius: style.borderRadius }}
                  >
                    <option value="">Select an option</option>
                    {element.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[element.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ borderRadius: style.borderRadius }}
                  />
                )}

                {errors[element.id] && (
                  <p className="text-sm text-red-500 mt-1">{errors[element.id]}</p>
                )}
              </div>
            );
          })}

          <div className="pt-6">
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
    </div>
  );
};