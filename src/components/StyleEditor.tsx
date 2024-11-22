import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Settings, Type, Square, Circle } from 'lucide-react';

interface FormStyle {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  borderRadius: string;
  fontFamily: string;
}

interface StyleEditorProps {
  style: FormStyle;
  onChange: (style: FormStyle) => void;
}

export const StyleEditor = ({ style, onChange }: StyleEditorProps) => {
  const fonts = [
    'Poppins, sans-serif',
    'Inter, sans-serif',
    'Arial, sans-serif',
    'Georgia, serif',
    'Verdana, sans-serif',
  ];

  const handleChange = (key: keyof FormStyle, value: string) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold font-heading">Style Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Square className="h-4 w-4" />
            Background Color
          </label>
          <HexColorPicker
            color={style.backgroundColor}
            onChange={(color) => handleChange('backgroundColor', color)}
            className="w-full"
          />
          <input
            type="text"
            value={style.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Type className="h-4 w-4" />
            Text Color
          </label>
          <HexColorPicker
            color={style.textColor}
            onChange={(color) => handleChange('textColor', color)}
            className="w-full"
          />
          <input
            type="text"
            value={style.textColor}
            onChange={(e) => handleChange('textColor', e.target.value)}
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Button Color
          </label>
          <HexColorPicker
            color={style.buttonColor}
            onChange={(color) => handleChange('buttonColor', color)}
            className="w-full"
          />
          <input
            type="text"
            value={style.buttonColor}
            onChange={(e) => handleChange('buttonColor', e.target.value)}
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Circle className="h-4 w-4" />
            Border Radius
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="24"
              value={parseInt(style.borderRadius)}
              onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-16">{style.borderRadius}</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={style.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font.split(',')[0] }}>
                {font.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};