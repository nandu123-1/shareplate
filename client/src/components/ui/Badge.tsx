import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'sage' | 'citrus' | 'cream' | 'charcoal' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  const variantClasses = {
    forest: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-forest-950/80 dark:text-forest-200 dark:border-forest-800',
    sage: 'bg-teal-50 text-teal-800 border border-teal-200/80 dark:bg-sage-950/80 dark:text-sage-300 dark:border-sage-800',
    citrus: 'bg-orange-50 text-orange-800 border border-orange-200/80 dark:bg-citrus-950/80 dark:text-citrus-300 dark:border-citrus-800',
    cream: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-charcoal-800 dark:text-cream-200 dark:border-charcoal-700',
    charcoal: 'bg-slate-800 text-white dark:bg-charcoal-700',
    outline: 'bg-transparent text-slate-700 border border-slate-200 dark:text-charcoal-300 dark:border-charcoal-700',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
