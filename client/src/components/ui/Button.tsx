import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  const variantClasses = {
    primary:
      'bg-forest-900 dark:bg-emerald-600 text-white hover:bg-forest-800 dark:hover:bg-emerald-500 shadow-soft-sm hover:shadow-soft focus:ring-forest-900',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200/90 dark:bg-charcoal-800 dark:text-cream-100 dark:border-charcoal-700 dark:hover:bg-charcoal-700 focus:ring-forest-700 shadow-soft-sm',
    accent:
      'bg-citrus-500 text-white hover:bg-citrus-600 shadow-soft-sm hover:shadow-soft focus:ring-citrus-500',
    outline:
      'bg-charcoal-900 text-cream-100 hover:bg-charcoal-800 border border-charcoal-700 focus:ring-forest-800 shadow-soft-sm',
    ghost:
      'bg-transparent text-cream-200 hover:bg-charcoal-800 focus:ring-charcoal-700',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-soft-sm'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
