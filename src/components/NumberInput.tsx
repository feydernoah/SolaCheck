"use client";

import { useState, useEffect, useCallback } from 'react';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
  optionalText?: string;
}

/**
 * A reusable number input component for quiz questions.
 * Supports optional values, unit display, and validation.
 */
export function NumberInput({
  value,
  onChange,
  placeholder = '',
  unit,
  min = 0,
  max,
  step = 1,
  optional = false,
  optionalText = 'Optional – du kannst diese Frage auch überspringen.',
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only propagate valid numbers or empty string
    if (newValue === '' || !isNaN(Number(newValue))) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Validate and clamp on blur
    if (inputValue === '') {
      return; // Empty is valid for optional fields
    }
    
    const numValue = Number(inputValue);
    if (isNaN(numValue)) {
      setInputValue('');
      onChange('');
      return;
    }
    
    // Clamp to min/max if specified
    let clampedValue = numValue;
    if (numValue < min) {
      clampedValue = min;
    }
    if (max !== undefined && numValue > max) {
      clampedValue = max;
    }
    
    if (clampedValue !== numValue) {
      const clampedStr = String(clampedValue);
      setInputValue(clampedStr);
      onChange(clampedStr);
    }
  }, [inputValue, min, max, onChange]);

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            flex-1 p-4 border-2 rounded-lg transition-colors text-lg
            focus:outline-none
            ${isFocused 
              ? 'border-yellow-400' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        />
        {unit && (
          <span className="text-gray-600 font-medium whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>
      
      {optional && (
        <p className="text-sm text-gray-500 mt-2">
          {optionalText}
        </p>
      )}
    </div>
  );
}
