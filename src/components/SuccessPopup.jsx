import React from 'react';
import { Check, Loader2, X } from 'lucide-react';

export default function SuccessPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm p-6 rounded-2xl border border-gold-400/25 bg-luxury-card shadow-gold-glow-lg text-center z-10 animate-slide-up select-none text-white">
        
        {/* Absolute Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Gold Circle Check */}
        <div className="mx-auto my-4 w-14 h-14 rounded-full bg-gold-400/10 border border-gold-400 flex items-center justify-center text-gold-400 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.25)] animate-pulse-subtle">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>

        {/* Messaging */}
        <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide mb-2">
          Review Copied ✓
        </h3>
        
        <div className="space-y-4 px-2 mb-4 font-sans text-xs">
          <p className="text-gray-300">
            Google Review page is opening...
          </p>
          <p className="text-gold-400/90 font-bold leading-relaxed bg-gold-400/5 py-2.5 px-3 rounded-lg border border-gold-400/15">
            Simply paste the review and submit.
          </p>
        </div>

        {/* Dynamic Loading Redirect Spinner */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-sans tracking-wide uppercase pt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
          <span>Redirecting now</span>
        </div>

      </div>
    </div>
  );
}
