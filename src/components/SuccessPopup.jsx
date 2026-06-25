import React from 'react';
import { Check, X } from 'lucide-react';

export default function SuccessPopup({ isOpen, onClose, googleReviewLink }) {
  if (!isOpen) return null;

  const handleOpenGoogle = () => {
    window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
    onClose();
  };

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
        <div className="mx-auto my-3 w-12 h-12 rounded-full bg-gold-50 border border-gold-400/50 flex items-center justify-center text-gold-600 filter drop-shadow-[0_0_6px_rgba(255,215,0,0.15)]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Messaging */}
        <h3 className="font-serif text-lg font-bold tracking-wide mb-1 text-luxury-textLight">
          Review Copied!
        </h3>
        <p className="text-[10px] text-luxury-textMuted font-sans font-bold">
          Your review is copied. Follow these simple steps:
        </p>

        {/* Visual Paste Helper Mockup */}
        <div className="my-4 p-3.5 rounded-2xl border border-luxury-border bg-[#F5F4F1] text-left space-y-2.5 shadow-inner">
          <span className="block text-[8px] uppercase font-sans font-extrabold tracking-wider text-gold-600 text-center">
            How to Paste on Mobile (पेस्ट करने का तरीका)
          </span>
          
          {/* Phone Keyboard Simulation */}
          <div className="relative border border-gray-200 bg-white rounded-xl p-2.5 shadow-sm select-none">
            {/* Mock Google Input Field */}
            <div className="border border-gold-400/30 rounded-lg p-1.5 bg-gray-50/50 text-[9px] text-gray-400 font-sans italic flex items-center justify-between">
              <span>Write a review...</span>
              <span className="w-0.5 h-3 bg-gold-500 animate-pulse inline-block"></span>
            </div>
            
            {/* Keyboard Suggestion Bar Mock */}
            <div className="mt-2.5 bg-gray-100 rounded-lg p-1.5 flex items-center justify-between text-[8px] font-sans font-bold text-luxury-textLight border border-gray-200/80 animate-pulse">
              <span className="text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded border border-gold-400/20">📋 Tap to Paste</span>
              <span className="text-gray-400 font-semibold truncate max-w-[150px]">"Good food and nice..."</span>
            </div>
            
            {/* Pointer finger indicator */}
            <div className="absolute right-5 bottom-0.5 w-6 h-6 text-gold-600 animate-bounce pointer-events-none text-base">
              👇
            </div>
          </div>
          
          <div className="text-[10px] font-sans font-bold space-y-1 text-luxury-textMuted leading-relaxed">
            <p className="flex items-start gap-1">
              <span className="text-gold-600 font-bold">1.</span>
              <span>Tap the Google review comment box.</span>
            </p>
            <p className="flex items-start gap-1">
              <span className="text-gold-600 font-bold">2.</span>
              <span>Tap the **Clipboard Suggestion** on your keyboard (as shown above).</span>
            </p>
            <p className="flex items-start gap-1">
              <span className="text-gold-600 font-bold">3.</span>
              <span>Or **Long Press** the review box and tap **Paste** (पेस्ट).</span>
            </p>
          </div>
        </div>

        {/* Action Button - Solid Rounded Black Pill */}
        <button
          onClick={handleOpenGoogle}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-black shadow-md active:scale-[0.98] transition-all cursor-pointer text-xs"
        >
          <span>Open Google & Paste Review</span>
        </button>

      </div>
    </div>
  );
}
