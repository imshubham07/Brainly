import { ReactElement } from "react";
// Define the ButtonVariant type
type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "danger";

interface ButtonProps {
  variant?: ButtonVariant; // Make variant optional with a default value
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

// Mapping button variants to their respective CSS classes
const variantClasses: Record<ButtonVariant, string> = {
  "primary": "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800",
  "secondary": "bg-purple-100 text-purple-600 hover:bg-purple-200 active:bg-purple-300",
  "outline": "bg-transparent text-purple-600 border border-purple-600 hover:bg-purple-50",
  "text": "bg-transparent text-purple-600 hover:underline hover:bg-purple-50",
  "danger": "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
};

// Size mapping for consistent sizing
const sizeClasses = {
  "sm": "px-3 py-1 text-sm",
  "md": "px-4 py-2",
  "lg": "px-6 py-3 text-lg"
};

// Default CSS classes for all buttons
const defaultStyles = "rounded-md font-medium flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50";

export function Button({
  variant = "primary", // Default value set here
  text,
  startIcon,
  endIcon,
  onClick,
  fullWidth = false,
  loading = false,
  size = "md",
  disabled = false,
  className = ""
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${variantClasses[variant]} ${defaultStyles} ${sizeClasses[size]} ${
        fullWidth ? "w-full" : ""
      } ${loading ? "opacity-70 cursor-not-allowed" : ""} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
          <span>{text}</span>
        </div>
      ) : (
        <>
          {startIcon && <span className="mr-2">{startIcon}</span>}
          <span>{text}</span>
          {endIcon && <span className="ml-2">{endIcon}</span>}
        </>
      )}
    </button>
  );
}