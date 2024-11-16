import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { FormElement as FormElementType, FormStyle } from '../store/formStore';

interface Props {
  element: FormElementType;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormElementType>) => void;
  style: FormStyle;
}

export const FormElement = ({ element, onRemove, onUpdate, style }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: element.id });

  const elementStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    fontFamily: style.fontFamily,
  };

  const renderInput = () => {
    switch (element.type) {
      case 'heading':
        return (
          <div
            style={{
              fontSize: element.style?.fontSize,
              textAlign: element.style?.textAlign || 'left',
            }}
            className="font-bold"
          >
            {element.label}
          </div>
        );
      case 'paragraph':
        return (
          <p
            style={{
              fontSize: element.style?.fontSize,
              textAlign: element.style?.textAlign || 'left',
            }}
          >
            {element.label}
          </p>
        );
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={element.type}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder={element.placeholder || `Enter ${element.label}`}
            style={{ borderRadius: style.borderRadius }}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="w-full px-3 py-2 border rounded-lg"
            placeholder={element.placeholder || `Enter ${element.label}`}
            style={{ borderRadius: style.borderRadius }}
          />
        );
      case 'select':
        return (
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            style={{ borderRadius: style.borderRadius }}
          >
            <option value="">Select an option</option>
            {element.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'image':
        return (
          <img
            src={element.style?.imageUrl}
            alt={element.label}
            style={{ width: element.style?.width || '100%' }}
            className="rounded-lg"
          />
        );
      case 'divider':
        return <hr className="my-4" />;
      default:
        return null;
    }
  };

  const renderSettings = () => {
    if (!isEditing) return null;

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={element.label}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className="w-full px-2 py-1 border rounded"
            />
          </div>

          {(element.type === 'heading' || element.type === 'paragraph') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={parseInt(element.style?.fontSize || '16')}
                  onChange={(e) => onUpdate(element.id, {
                    style: { ...element.style, fontSize: `${e.target.value}px` }
                  })}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Align
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(element.id, {
                      style: { ...element.style, textAlign: 'left' }
                    })}
                    className={`p-2 rounded ${element.style?.textAlign === 'left' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => onUpdate(element.id, {
                      style: { ...element.style, textAlign: 'center' }
                    })}
                    className={`p-2 rounded ${element.style?.textAlign === 'center' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => onUpdate(element.id, {
                      style: { ...element.style, textAlign: 'right' }
                    })}
                    className={`p-2 rounded ${element.style?.textAlign === 'right' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {element.type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={element.style?.imageUrl || ''}
                onChange={(e) => onUpdate(element.id, {
                  style: { ...element.style, imageUrl: e.target.value }
                })}
                className="w-full px-2 py-1 border rounded"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {(element.type === 'text' || element.type === 'email' || element.type === 'number' || element.type === 'textarea') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={element.placeholder || ''}
                onChange={(e) => onUpdate(element.id, { placeholder: e.target.value })}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          )}

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={element.required}
                onChange={(e) => onUpdate(element.id, { required: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Required field</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={elementStyle}
      className="group relative bg-white border rounded-lg p-4 mb-4 hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical size={20} className="text-gray-400" />
          </button>
          {!['heading', 'paragraph', 'image', 'divider'].includes(element.type) && (
            <label className="font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={() => onRemove(element.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
      {renderInput()}
      {renderSettings()}
    </div>
  );
};