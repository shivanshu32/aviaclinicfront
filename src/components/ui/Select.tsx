'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange(options[nextIndex].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-2.5 text-left border border-gray-200 rounded-xl font-sans text-secondary-700 bg-white flex items-center justify-between gap-2 transition-all ${
          isOpen ? 'ring-2 ring-primary-500 border-primary-500' : 'hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-2.5 text-left font-sans flex items-center justify-between gap-2 transition-colors ${
                option.value === value
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-gray-50'
              } first:rounded-t-xl last:rounded-b-xl`}
            >
              <span className="capitalize">{option.label}</span>
              {option.value === value && <Check className="w-4 h-4 text-primary-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
