import React, { useState } from 'react';
import { Star, Sparkles, Utensils, Type, Timer, Languages } from 'lucide-react';

const CHECKLIST_ITEMS = [
  "Pizza",
  "Burger",
  "Momos",
  "Cold Coffee",
  "Staff",
  "Ambience",
  "Cleanliness"
];

const TONE_ITEMS = [
  { id: "Casual", label: "Casual" },
  { id: "Foodie", label: "Foodie" },
  { id: "Family", label: "Family" },
  { id: "Professional", label: "Professional" },
  { id: "Short & Simple", label: "Simple" }
];

const MODE_ITEMS = [
  { id: "Quick", label: "Quick (20-40w)" },
  { id: "Normal", label: "Normal (50-80w)" },
  { id: "Detailed", label: "Detailed (100-150w)" }
];

const LANGUAGE_ITEMS = [
  { id: "English", label: "English" },
  { id: "Hinglish", label: "Hinglish (Hindi)" }
];

export default function ReviewForm({ onSubmit, isGenerating }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [experienceRating, setExperienceRating] = useState(5); // Default to 5 stars
  const [reviewMode, setReviewMode] = useState("Normal");
  const [writingTone, setWritingTone] = useState("Casual");
  const [language, setLanguage] = useState("English");
  const [errorMsg, setErrorMsg] = useState("");

  const [hoverRating, setHoverRating] = useState(0);

  const handleItemToggle = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      setErrorMsg("Please select at least one item you enjoyed.");
      return;
    }
    if (experienceRating === 0) {
      setErrorMsg("Please tell us how was your experience.");
      return;
    }

    setErrorMsg("");
    onSubmit({
      selectedItems,
      experienceRating,
      reviewMode,
      writingTone,
      language
    });
  };

  const getRatingLabel = (val) => {
    if (val === 5) return "Exceptional";
    if (val === 4) return "Very Good";
    if (val === 3) return "Good / Average";
    if (val === 2) return "Fair";
    if (val === 1) return "Poor";
    return "";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-5 rounded-3xl border border-luxury-border bg-luxury-card shadow-gold-glow-lg space-y-4 animate-slide-up text-luxury-textLight">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide flex items-center justify-center gap-2">
          <Utensils className="w-4.5 h-4.5 text-gold-600" />
          Share Your Experience
        </h2>
        <p className="text-[10px] text-luxury-textMuted font-sans font-bold">Quick, simple selections. We do the rest.</p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 text-xs bg-red-50 border border-red-200 text-red-700 font-sans font-bold rounded-xl text-center shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* 1. What did you enjoy? Checklist */}
      <div className="space-y-1.5">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-gold-600">What did you enjoy?</label>
        <div className="flex flex-wrap gap-1.5 select-none">
          {CHECKLIST_ITEMS.map((item) => {
            const isSelected = selectedItems.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleItemToggle(item)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-sans font-bold transition-all duration-150 cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-luxury-dark border-luxury-dark text-white'
                    : 'bg-[#F5F5F7] border-transparent text-luxury-textLight hover:bg-[#E5E5EA]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rating Selector */}
      <div className="space-y-1 text-center py-1.5 bg-[#F5F5F7]/60 rounded-2xl border border-luxury-border shadow-inner">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-gold-600">How was your experience?</label>
        
        <div className="flex items-center justify-center gap-1.5 py-1 select-none">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating || experienceRating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setExperienceRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform active:scale-90 cursor-pointer"
              >
                <Star
                  className={`w-7.5 h-7.5 transition-all ${
                    active
                      ? 'fill-gold-400 stroke-gold-500 drop-shadow-[0_0_3px_rgba(255,215,0,0.3)]'
                      : 'stroke-gray-300 fill-transparent hover:stroke-gold-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-sans font-bold text-gold-600 uppercase opacity-95">
          {getRatingLabel(hoverRating || experienceRating) || "Rate Us"}
        </span>
      </div>

      {/* 3. Language Selector */}
      <div className="space-y-1.5">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-gold-600 flex items-center gap-1">
          <Languages className="w-3.5 h-3.5 text-gold-600" />
          Review Language
        </label>
        <div className="grid grid-cols-2 gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-luxury-border">
          {LANGUAGE_ITEMS.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-sans font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-luxury-dark text-white'
                    : 'text-luxury-textMuted hover:text-luxury-textLight'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Review Length Selector */}
      <div className="space-y-1.5">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-gold-600 flex items-center gap-1">
          <Timer className="w-3.5 h-3.5 text-gold-600" />
          Review Length
        </label>
        <div className="grid grid-cols-3 gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-luxury-border">
          {MODE_ITEMS.map((mode) => {
            const isSelected = reviewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setReviewMode(mode.id)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-sans font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-luxury-dark text-white'
                    : 'text-luxury-textMuted hover:text-luxury-textLight'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Tone Selector */}
      <div className="space-y-1.5">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-gold-600 flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-gold-600" />
          Writing Tone
        </label>
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
          {TONE_ITEMS.map((tone) => {
            const isSelected = writingTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => setWritingTone(tone.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-sans font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-luxury-dark text-white'
                    : 'bg-[#F5F5F7] text-luxury-textMuted hover:text-luxury-textLight'
                }`}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button - Solid Black rounded pill */}
      <button
        type="submit"
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Drafting your review...</span>
          </div>
        ) : (
          <>
            <Sparkles className="w-4.5 h-4.5 fill-white stroke-white" />
            <span className="text-sm">Generate Review Draft</span>
          </>
        )}
      </button>
    </form>
  );
}
