import React from 'react';
import { FormElement } from '../store/formStore';
import { Type, Hash, Mail, AlignLeft, List, Image, Heading2, Text, Minus } from 'lucide-react';

interface ToolboxProps {
  onAddElement: (element: Omit<FormElement, 'id'>) => void;
}

export const Toolbox = ({ onAddElement }: ToolboxProps) => {
  const elements: Omit<FormElement, 'id'>[] = [
    { type: 'heading', label: 'Heading', required: false, style: { fontSize: '24px', textAlign: 'left' } },
    { type: 'paragraph', label: 'Paragraph', required: false, style: { fontSize: '16px', textAlign: 'left' } },
    { type: 'text', label: 'Text Input', required: false },
    { type: 'number', label: 'Number Input', required: false },
    { type: 'email', label: 'Email Input', required: false },
    { type: 'textarea', label: 'Text Area', required: false },
    { type: 'select', label: 'Dropdown', required: false, options: ['Option 1', 'Option 2', 'Option 3'] },
    { type: 'image', label: 'Image', required: false, style: { imageUrl: '', width: '100%' } },
    { type: 'divider', label: 'Divider', required: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return <Heading2 size={20} />;
      case 'paragraph':
        return <Text size={20} />;
      case 'text':
        return <Type size={20} />;
      case 'number':
        return <Hash size={20} />;
      case 'email':
        return <Mail size={20} />;
      case 'textarea':
        return <AlignLeft size={20} />;
      case 'select':
        return <List size={20} />;
      case 'image':
        return <Image size={20} />;
      case 'divider':
        return <Minus size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
      <div className="space-y-2">
        {elements.map((element) => (
          <button
            key={element.type}
            onClick={() => onAddElement(element)}
            className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500">{getIcon(element.type)}</span>
            <span>{element.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};