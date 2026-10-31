import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-charcoal-900 rounded-2xl shadow-soft-lg border border-charcoal-800 p-6 md:p-8 z-10 my-8 transition-all transform animate-in fade-in zoom-in-95`}
      >
        {title || subtitle ? (
          <div className="flex items-start justify-between pb-4 border-b border-charcoal-800">
            <div>
              {title && (
                <h3 className="text-xl font-bold text-cream-50 font-editorial tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-charcoal-400 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-cream-200 hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-charcoal-950/80 hover:bg-charcoal-950 text-white backdrop-blur-md transition-all border border-charcoal-700/80 shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className={title || subtitle ? "pt-4 text-cream-100" : "text-cream-100"}>
          {children}
        </div>
      </div>
    </div>
  );
};
