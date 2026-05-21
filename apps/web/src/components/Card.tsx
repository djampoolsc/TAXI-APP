import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', padding = 'md', className = '', children, ...props }, ref) => {
    const paddingStyles = {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    const variants = {
      glass: 'bg-white/95 backdrop-blur-md border border-orange-100/50 shadow-md hover:shadow-lg transition-all',
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md',
      elevated: 'bg-white shadow-lg border border-orange-100',
      default: 'bg-white border border-gray-200 shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${paddingStyles[padding]}
          ${variants[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full
              bg-white
              border border-gray-300
              rounded-xl
              px-4 py-3
              ${icon ? 'pl-10' : ''}
              text-gray-800
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500/50 bg-red-50/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-orange-100 text-orange-700 border border-orange-300',
      success: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      error: 'bg-red-100 text-red-700 border border-red-300',
      info: 'bg-blue-100 text-blue-700 border border-blue-300',
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center rounded-full font-semibold
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
