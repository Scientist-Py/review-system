import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setIsError(false);
  }, [isOpen]);

  useEffect(() => {
    if (pin.length === 3) {
      if (pin === '160') {
        onSuccess();
        onClose();
      } else {
        setIsError(true);
        // Reset after shake animation finishes
        const timer = setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, onSuccess, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 3) {
          setPin((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, onClose]);

  if (!isOpen) return null;

  const handleNumberClick = (num) => {
    if (pin.length < 3) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 animate-fade-in">
      {/* Background Backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#121212]/30 backdrop-blur-md transition-opacity" 
      />

      {/* Passcode Box */}
      <div className={`relative w-full max-w-[280px] p-6 rounded-3xl border border-luxury-border bg-luxury-glass backdrop-blur-3xl shadow-gold-glow-lg text-center z-10 select-none text-luxury-textLight ${isError ? 'animate-shake' : 'animate-slide-up'}`}>
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-luxury-textMuted hover:text-luxury-textLight hover:bg-black/5 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mt-4 mb-6">
          <h3 className="text-sm font-sans font-bold text-luxury-textLight">Enter Passcode</h3>
          <p className="text-[10px] text-luxury-textMuted font-sans font-bold mt-1">Owner authentication required</p>
        </div>

        {/* Apple Passcode Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div 
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border border-luxury-textLight transition-all duration-150 ${
                  isFilled ? 'bg-luxury-textLight scale-110' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Numpad Layout */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-14 h-14 rounded-full border border-luxury-border flex items-center justify-center text-lg font-sans font-bold text-luxury-textLight hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          {/* Row 4 */}
          <button
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center text-xs font-sans font-bold text-luxury-textMuted hover:text-luxury-textLight active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            className="w-14 h-14 rounded-full border border-luxury-border flex items-center justify-center text-lg font-sans font-bold text-luxury-textLight hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 flex items-center justify-center text-luxury-textMuted hover:text-luxury-textLight active:scale-95 transition-all cursor-pointer"
            aria-label="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
