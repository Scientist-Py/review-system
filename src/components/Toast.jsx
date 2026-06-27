import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-gold-450/20 shadow-gold-glow bg-[#F5F5F7]/95',
    error: 'border-red-200 bg-red-50/95',
    warning: 'border-amber-200 bg-amber-50/95',
    info: 'border-sky-200 bg-sky-50/95'
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-slide-up">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md text-luxury-textLight shadow-lg ${borderColors[type]}`}>
        {/* Status Icon */}
        <div className="pt-0.5">
          {iconMap[type]}
        </div>

        {/* Message Body */}
        <div className="flex-1 text-xs font-sans font-bold text-luxury-textLight">
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-0.5 rounded-lg text-luxury-textMuted hover:text-luxury-textLight hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
