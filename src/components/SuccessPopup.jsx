import React from 'react';
import { Check, X } from 'lucide-react';

export default function SuccessPopup({ isOpen, onClose, googleReviewLink, onGoogleClick }) {
  if (!isOpen) return null;

  const handleOpenGoogle = () => {
    if (onGoogleClick) onGoogleClick();
    window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Background Backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#121212]/40 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm p-6 rounded-3xl border border-luxury-border bg-luxury-glass backdrop-blur-3xl shadow-gold-glow-lg text-center z-10 animate-slide-up select-none text-luxury-textLight">
        
        {/* Absolute Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-luxury-textMuted hover:text-luxury-textLight hover:bg-black/5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Gold Circle Check */}
        <div className="mx-auto my-3 w-12 h-12 rounded-full bg-gold-50 border border-gold-400/50 flex items-center justify-center text-gold-600 filter drop-shadow-[0_0_6px_rgba(255,215,0,0.15)]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Messaging */}
        <h3 className="font-serif text-2xl font-extrabold tracking-wide mb-2 text-luxury-textLight">
          Review Copied!
        </h3>
        
        <div className="my-5 p-5 rounded-2xl border border-luxury-border bg-white text-left space-y-4 shadow-sm">
          <span className="block text-xs uppercase font-extrabold tracking-widest text-gold-600 text-center border-b border-luxury-border pb-2">
            Follow These Steps:
          </span>
          
          <ol className="space-y-3 text-xs sm:text-sm font-sans font-extrabold text-luxury-textLight list-decimal pl-4.5 leading-relaxed">
            <li className="pl-1">
              <span>Scan the QR code.</span>
            </li>
            <li className="pl-1">
              <span>Tap "Post Instant Review".</span>
            </li>
            <li className="pl-1">
              <span>Tap "Open Google" below.</span>
            </li>
            <li className="pl-1">
              <span>Paste the review <span className="text-luxury-textMuted font-bold block text-[10px] mt-0.5">(it's already written by our system and copied to your clipboard)</span>.</span>
            </li>
            <li className="pl-1">
              <span>Tap Post.</span>
            </li>
          </ol>
        </div>

        {/* Action Button - Solid Blue/Gold Pill */}
        <button
          onClick={handleOpenGoogle}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-sans font-extrabold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md active:scale-[0.98] transition-all cursor-pointer text-xs"
        >
          <span>Open Google & Paste Review</span>
        </button>

        {/* Thank You Note */}
        <div className="mt-4 pt-3 border-t border-luxury-border">
          <p className="text-xs font-sans font-extrabold text-gold-600 uppercase tracking-wider">
            Thank you for supporting Chapter One Cafe! ☕🍕
          </p>
        </div>

      </div>
    </div>
  );
}
