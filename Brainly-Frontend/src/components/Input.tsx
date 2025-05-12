import React, { useState } from 'react';

interface InputProps {
  placeholder: string;
  reference?: React.RefObject<HTMLInputElement>;
  id?: string;
  type?: string;
  className?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Input({
  placeholder,
  reference,
  id,
  type = "text",
  className = "",
  label,
  helperText,
  error = false,
  required = false,
  onChange,
  startIcon,
  endIcon,
  fullWidth = false
}: InputProps) {
  const [focused, setFocused] = useState<boolean>(false);

  const baseClasses = "px-4 py-2 rounded-md transition-all duration-200 outline-none border";
  const stateClasses = error 
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
    : focused 
      ? "border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
      : "border-gray-300 hover:border-gray-400";
  
  const inputClasses = `${baseClasses} ${stateClasses} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {startIcon}
          </div>
        )}
        
        <input
          id={id}
          ref={reference}
          placeholder={placeholder}
          type={type}
          className={`${inputClasses} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''}`}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
        />
        
        {endIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {endIcon}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}