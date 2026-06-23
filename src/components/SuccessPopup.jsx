import React from 'react';
import { Check, Loader2, X } from 'lucide-react';

export default function SuccessPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#121212]/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm p-6 rounded-3xl border border-luxury-border bg-white shadow-gold-glow-lg text-center z-10 animate-slide-up select-none text-luxury-textLight animate-fade-in">
        
        {/* Absolute Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-luxury-textLight hover:bg-gray-100 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Gold Circle Check */}
        <div className="mx-auto my-4 w-14 h-14 rounded-full bg-gold-50 border border-gold-400 flex items-center justify-center text-gold-600 filter drop-shadow-[0_0_6px_rgba(255,215,0,0.15)] animate-pulse-subtle">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>

        {/* Messaging */}
        <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide mb-2 text-luxury-textLight">
          Review Copied ✓
        </h3>
        
        <div className="space-y-4 px-2 mb-4 font-sans text-xs font-semibold">
          <p className="text-luxury-textMuted">
            Google Review page is opening...
          </p>
          <p className="text-gold-700 leading-relaxed bg-gold-50 py-2.5 px-3 rounded-xl border border-gold-400/20">
            Simply paste the review and submit.
          </p>
        </div>

        {/* Dynamic Loading Redirect Spinner */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-luxury-textMuted font-sans font-bold tracking-wide uppercase pt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500" />
          <span>Redirecting now</span>
        </div>

      </div>
    </div>
  );
}
