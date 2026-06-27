import React from 'react';
import { Check, X } from 'lucide-react';

export default function SuccessPopup({ isOpen, onClose, googleReviewLink }) {
  if (!isOpen) return null;

  const handleOpenGoogle = () => {
    window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Background Backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0d0d11]/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm p-6 rounded-3xl border border-luxury-border bg-luxury-glass backdrop-blur-3xl shadow-gold-glow-lg text-center z-10 animate-slide-up select-none text-luxury-textLight">
        
        {/* Absolute Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-luxury-textMuted hover:text-luxury-textLight hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Gold Circle Check */}
        <div className="mx-auto my-3 w-12 h-12 rounded-full bg-gold-50/10 border border-gold-400/50 flex items-center justify-center text-gold-600 filter drop-shadow-[0_0_6px_rgba(255,215,0,0.15)]">
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
        <div className="my-4 p-4 rounded-2xl border border-luxury-border bg-[#1C1C1E]/50 text-left space-y-3.5 shadow-inner">
          <span className="block text-[9px] uppercase font-sans font-extrabold tracking-wider text-gold-600 text-center">
            2-Step Quick Paste Guide (पेस्ट करने का तरीका)
          </span>
          
          {/* Phone Screen Mockup */}
          <div className="relative border border-luxury-border bg-[#0D0D11] rounded-2xl p-3 shadow-md select-none overflow-hidden max-w-[280px] mx-auto">
            {/* Mock Google Maps Header */}
            <div className="flex items-center gap-1.5 border-b border-luxury-border pb-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">G</div>
              <div className="text-left leading-none">
                <span className="text-[8px] font-bold text-luxury-textLight block">Chapter One Cafe</span>
                <span className="text-[6px] text-gray-400 block font-semibold">Google Maps Review</span>
              </div>
            </div>
            
            {/* 5 Golden Stars */}
            <div className="flex gap-0.5 justify-center my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-xs text-amber-400">★</span>
              ))}
            </div>

            {/* Mock Google Input Box (User clicks here) */}
            <div className="border border-gold-400/20 rounded-lg p-2 bg-[#1C1C1E] text-[9px] text-gray-400 font-sans italic flex items-center justify-between shadow-inner">
              <span>Share details of your experience...</span>
              <span className="w-0.5 h-3 bg-gold-500 animate-pulse"></span>
            </div>
            
            {/* Keyboard Suggestion Bar (Shows Copied Text) */}
            <div className="mt-3 bg-[#1C1C1E]/60 rounded-lg p-2 flex items-center gap-2 text-[8px] font-sans font-bold text-luxury-textLight border border-luxury-border shadow-sm animate-pulse-subtle">
              <span className="text-[10px]">📋</span>
              <div className="flex-1 min-w-0">
                <span className="text-gold-700 block text-[7px] leading-tight font-extrabold uppercase">Tap to Paste (टच करें)</span>
                <span className="text-gray-500 truncate block text-[7px] font-semibold">"Pizza expected se bhi better nikla..."</span>
              </div>
            </div>
            
            {/* Floating Pointer Hand Icon */}
            <div className="absolute right-8 bottom-1 w-6 h-6 text-xl animate-bounce pointer-events-none">
              👆
            </div>
          </div>
          
          {/* Plain Bilingual Step list */}
          <div className="text-[10.5px] font-sans font-bold space-y-2 text-luxury-textMuted leading-normal">
            <p className="flex items-start gap-1.5">
              <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-gold-50/10 text-gold-600 text-[9px] font-bold shrink-0 mt-0.5">1</span>
              <span>
                Tap the **comment box** inside Google.
                <span className="block text-[9.5px] text-luxury-textMuted/80 font-semibold font-sans mt-0.5">
                  (गूगल के खाली कमेंट बॉक्स पर टच करें)
                </span>
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-gold-50/10 text-gold-600 text-[9px] font-bold shrink-0 mt-0.5">2</span>
              <span>
                Tap the **copied text bubble** above your keyboard.
                <span className="block text-[9.5px] text-luxury-textMuted/80 font-semibold font-sans mt-0.5">
                  (कीबोर्ड के ऊपर आ रहे लिखे हुए मैसेज पर टच करें)
                </span>
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-gold-50/10 text-gold-600 text-[9px] font-bold shrink-0 mt-0.5">3</span>
              <span>
                Or **long press** inside the box and select **Paste**.
                <span className="block text-[9.5px] text-luxury-textMuted/80 font-semibold font-sans mt-0.5">
                  (या खाली जगह को थोड़ी देर दबाकर रखें और Paste दबाएं)
                </span>
              </span>
            </p>
          </div>
        </div>

        {/* Action Button - Solid Rounded Espresso Pill */}
        <button
          onClick={handleOpenGoogle}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md active:scale-[0.98] transition-all cursor-pointer text-xs"
        >
          <span>Open Google & Paste Review</span>
        </button>

      </div>
    </div>
  );
}
