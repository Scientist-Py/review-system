import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { ChevronRight, Award, MapPin, Settings, RotateCcw, Sparkles } from 'lucide-react';

export default function LandingSection({ onStart, onOpenDashboard, onInstantClick, isGenerating }) {
  const [isReturning, setIsReturning] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");

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
      <h1 className="font-serif text-2.5xl sm:text-3.5xl text-luxury-textLight tracking-wide leading-tight mb-6 animate-fade-in px-4">
        Welcome to <span className="font-extrabold text-gold-600">Chapter One</span> AI Review System
      </h1>

      {/* Description card with glassmorphism */}
      <div className="max-w-md p-5 rounded-2xl border border-luxury-border bg-luxury-card shadow-gold-glow mb-8 animate-slide-up">
        <p className="font-sans text-xs sm:text-sm text-luxury-textMuted leading-relaxed font-semibold">
          {isReturning 
            ? "Need another review draft for your visit today? Choose a language and tap below to instantly generate and post, or customize one."
            : "Tell us about your visit and we'll help you create a natural review draft. Your review will be copied so you can easily paste it on our Google page."
          }
        </p>
      </div>

      {/* Quick Location info badge */}
      <div className="flex items-center gap-1.5 text-xs text-luxury-textMuted mb-6 font-sans font-bold">
        <MapPin className="w-3.5 h-3.5 text-gold-500" />
        <span>Opposite Maya Hotel, Baghpat</span>
      </div>

      {/* Language Selector Pill */}
      <div className="mb-6 w-full max-w-xs space-y-2">
        <span className="block text-[9px] uppercase font-bold tracking-wider text-gold-600">Select Review Language</span>
        <div className="grid grid-cols-2 gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-luxury-border">
          <button
            type="button"
            onClick={() => setSelectedLang("English")}
            className={`py-2 rounded-lg text-[11px] font-sans font-bold transition-all text-center cursor-pointer ${
              selectedLang === "English"
                ? 'bg-luxury-dark text-white shadow-sm'
                : 'text-luxury-textMuted hover:text-luxury-textLight'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("Hinglish")}
            className={`py-2 rounded-lg text-[11px] font-sans font-bold transition-all text-center cursor-pointer ${
              selectedLang === "Hinglish"
                ? 'bg-luxury-dark text-white shadow-sm'
                : 'text-luxury-textMuted hover:text-luxury-textLight'
            }`}
          >
            Hinglish (Hindi)
          </button>
        </div>
      </div>

      {/* CTA Action Buttons Container */}
      <div className="flex flex-col gap-3 w-full max-w-xs select-none">
        {/* 1-Click Instant Review Button */}
        <button
          onClick={() => onInstantClick(selectedLang)}
          disabled={isGenerating}
          className="group relative flex items-center justify-center gap-2 px-8 py-3.5 w-full rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating review...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white stroke-white text-gold-400" />
              <span>Post Instant Review</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Manual Helper / Customize Button */}
        <button
          onClick={onStart}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-8 py-3 w-full rounded-full border border-luxury-border bg-[#F5F5F7] text-luxury-textLight hover:bg-[#E5E5EA] active:scale-[0.98] transition-all duration-300 font-bold shadow-sm disabled:opacity-60 cursor-pointer text-xs"
        >
          Customize Review
        </button>
      </div>

      {/* Secret Dashboard Link */}
      <button
        onClick={onOpenDashboard}
        className="mt-10 text-[10px] text-luxury-textMuted hover:text-luxury-textLight font-sans flex items-center gap-1 opacity-70 hover:opacity-100 transition-all cursor-pointer uppercase tracking-wider py-1.5 font-bold"
      >
        <Settings className="w-3 h-3" />
        <span>Owner Dashboard</span>
      </button>

    </div>
  );
}
