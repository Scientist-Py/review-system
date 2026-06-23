import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { ChevronRight, Award, MapPin, Settings, RotateCcw } from 'lucide-react';

export default function LandingSection({ onStart, onOpenDashboard }) {
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    try {
      const reviewGenerated = localStorage.getItem("reviewGenerated");
      if (reviewGenerated === "true") {
        setIsReturning(true);
      }
    } catch (e) {
      console.warn("Could not check returning customer status:", e);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 py-6 select-none relative">
      
      {/* Subtle background gold glow effect behind the logo */}
      <div className="absolute top-[18%] w-56 h-56 bg-gold-400/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Branded Logo */}
      <div className="mb-4">
        <Logo className="w-22 h-22" />
      </div>

      {/* Returning Customer / Welcome Badge */}
      {isReturning ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-gold-400/30 bg-gold-50 text-gold-700 text-xs font-sans font-bold tracking-wide animate-pulse-subtle shadow-sm">
          <RotateCcw className="w-3 h-3 text-gold-600" />
          Welcome Back!
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-xs font-sans font-bold tracking-wider uppercase shadow-sm">
          <Award className="w-3.5 h-3.5 text-gold-500" />
          Premium Selection
        </div>
      )}

      {/* Main Titles */}
      <h1 className="font-serif text-3xl sm:text-4.5xl font-bold text-luxury-textLight tracking-wide leading-tight mb-1.5 animate-fade-in">
        Chapter One Cafe
      </h1>
      
      <p className="font-serif text-sm sm:text-base text-gold-600 tracking-widest uppercase font-bold mb-6">
        Baghpat
      </p>

      {/* Description card with glassmorphism */}
      <div className="max-w-md p-5 rounded-2xl border border-luxury-border bg-white shadow-gold-glow mb-8 animate-slide-up">
        <p className="font-sans text-xs sm:text-sm text-luxury-textMuted leading-relaxed font-semibold">
          {isReturning 
            ? "Need another review draft for your visit today? Tap below to select what you ordered and generate a new draft."
            : "Tell us about your visit and we'll help you create a natural review draft. Your review will be copied so you can easily paste it on our Google page."
          }
        </p>
      </div>

      {/* Quick Location info badge */}
      <div className="flex items-center gap-1.5 text-xs text-luxury-textMuted mb-6 font-sans font-bold">
        <MapPin className="w-3.5 h-3.5 text-gold-500" />
        <span>Opposite Maya Hotel, Baghpat</span>
      </div>

      {/* CTA Button - Solid Rounded Black Pill */}
      <button
        onClick={onStart}
        className="group relative flex items-center justify-center gap-2 px-8 py-3.5 w-full max-w-xs rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
      >
        <span>{isReturning ? "Create New Draft" : "Start Draft Helper"}</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Secret Dashboard Link */}
      <button
        onClick={onOpenDashboard}
        className="mt-10 text-[10px] text-gray-400 hover:text-luxury-dark font-sans flex items-center gap-1 opacity-70 hover:opacity-100 transition-all cursor-pointer uppercase tracking-wider py-1.5 font-bold"
      >
        <Settings className="w-3 h-3" />
        <span>Owner Dashboard</span>
      </button>

    </div>
  );
}
