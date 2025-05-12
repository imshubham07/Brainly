import React, { useState } from 'react';

interface TextAreaProps {
  placeholder: string;
  reference?: React.RefObject<HTMLTextAreaElement>;
  id?: string;
  className?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
  fullWidth?: boolean;
  value?: string;
}

export function TextArea({
  placeholder,
  reference,
  id,
  className = "",
  label,
  helperText,
  error = false,
  required = false,
  onChange,
  rows = 4,
  maxLength,
  fullWidth = false,
  value
}: TextAreaProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(value?.length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e);
    if (maxLength) setCharCount(e.target.value.length);
  };

  const baseClasses = "px-4 py-2 rounded-md transition-all duration-200 outline-none border resize-y";
  const stateClasses = error 
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
    : focused 
      ? "border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
      : "border-gray-300 hover:border-gray-400";

  const textareaClasses = `${baseClasses} ${stateClasses} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <label 
            htmlFor={id} 
            className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          
          {maxLength && (
            <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        id={id}
        ref={reference}
        placeholder={placeholder}
        value={value}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
      />
      
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}