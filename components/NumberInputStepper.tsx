

import React from 'react';
import { PlusIcon, MinusIcon } from './icons/Icons';

interface NumberInputStepperProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
}

const NumberInputStepper: React.FC<NumberInputStepperProps> = ({ label, value, onChange, step = 1, min, max }) => {
    
    const handleStep = (direction: 'up' | 'down') => {
        const newValue = value + (direction === 'up' ? step : -step);
        if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
            onChange(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
            onChange(numValue)
        } else if (e.target.value === '') {
            onChange(min !== undefined ? min : 0);
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <div className="flex items-center h-9">
                <button 
                    onClick={() => handleStep('down')} 
                    className="h-full px-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded-l-md transition-colors disabled:opacity-50"
                    disabled={min !== undefined && value <= min}
                    aria-label={`Decrease ${label}`}
                >
                    <MinusIcon className="w-4 h-4" />
                </button>
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                         if (min !== undefined && value < min) onChange(min);
                         if (max !== undefined && value > max) onChange(max);
                    }}
                    step={step}
                    min={min}
                    max={max}
                    className="w-full h-full bg-white border-y border-slate-300 text-slate-900 text-center focus:ring-1 focus:ring-slate-500 focus:border-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                />
                 <button 
                    onClick={() => handleStep('up')} 
                    className="h-full px-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded-r-md transition-colors disabled:opacity-50"
                    disabled={max !== undefined && value >= max}
                    aria-label={`Increase ${label}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default NumberInputStepper;