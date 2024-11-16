import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { FormStyle } from '../store/formStore';

interface StyleEditorProps {
  style: FormStyle;
  onChange: (style: FormStyle) => void;
}

export const StyleEditor = ({ style, onChange }: StyleEditorProps) => {
  const fonts = [
    'Inter, system-ui, sans-serif',
    'Arial, sans-serif',
    'Georgia, serif',
    'Verdana, sans-serif',
    'Roboto, sans-serif',
  ];

  const handleChange = (key: keyof FormStyle, value: string) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Style Editor</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <HexColorPicker
            color={style.backgroundColor}
            onChange={(color) => handleChange('backgroundColor', color)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <HexColorPicker
            color={style.textColor}
            onChange={(color) => handleChange('textColor', color)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Color
          </label>
          <HexColorPicker
            color={style.buttonColor}
            onChange={(color) => handleChange('buttonColor', color)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Radius
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={parseInt(style.borderRadius)}
            onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={style.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};