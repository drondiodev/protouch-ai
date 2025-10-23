

import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  onCommit?: () => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, onChange, min, max, step, onCommit }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
        onChange(Math.max(min, Math.min(max, numValue)));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="w-20 bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-900 text-right focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #0f172a;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.2s;
            border: 2px solid white;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        .slider-thumb:focus::-webkit-slider-thumb {
            outline: 2px solid #0f172a;
            outline-offset: 2px;
        }

        .slider-thumb::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #0f172a;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        .slider-thumb:focus::-moz-range-thumb {
            outline: 2px solid #0f172a;
            outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default SliderControl;
