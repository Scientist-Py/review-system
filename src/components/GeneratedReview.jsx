import React, { useRef, useState, useEffect } from 'react';
import { Copy, RefreshCw, Sparkles, Edit3, ExternalLink } from 'lucide-react';

export default function GeneratedReview({
  reviewText,
  onChangeText,
  onCopy,
  onRegenerate,
  isGenerating,
  selectedItemsCount = 1,
  googleReviewLink
}) {
  const textareaRef = useRef(null);
  const [qualityScore, setQualityScore] = useState(90);

  useEffect(() => {
    if (!reviewText) return;
    
    let score = 72; // Baseline
    
    if (reviewText.length > 200) score += 10;
    else if (reviewText.length > 100) score += 7;
    else score += 4;

    score += Math.min(selectedItemsCount * 4, 12);

    const premiumKeywords = [
      "delicious", "refreshing", "aesthetic", "polite", "cozy", "hygienic", 
      "cheesy", "large", "sharing", "recommend", "great", "friendly", "clean"
    ];
    let matchCount = 0;
    premiumKeywords.forEach(word => {
      if (reviewText.toLowerCase().includes(word)) matchCount++;
    });
    score += Math.min(matchCount * 2, 8);

    const seed = (reviewText.charCodeAt(0) || 0) + (reviewText.charCodeAt(reviewText.length - 1) || 0);
    score += (seed % 5);

    setQualityScore(Math.min(score, 100));
  }, [reviewText, selectedItemsCount]);

  const handlePostClick = () => {
    if (!reviewText) return;
    navigator.clipboard.writeText(reviewText);
    onCopy();
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 rounded-3xl border border-luxury-border bg-luxury-card shadow-gold-glow-lg flex flex-col justify-between min-h-[480px] animate-slide-up text-luxury-textLight">
      
      {/* Section Header */}
      <div className="space-y-1.5 text-center mb-3">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-gold-400/30 bg-gold-50/10 text-gold-600 text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3 h-3 animate-pulse-subtle fill-gold-400/50 text-gold-500" />
          Review Draft Ready
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
          Your Review Draft
        </h2>
      </div>

      {/* Quality Score Indicator */}
      <div className="mb-4 p-3.5 rounded-2xl border border-luxury-border bg-[#1C1C1E]/40 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2.5">
          <div className="relative w-11 h-11 flex items-center justify-center rounded-full border border-gold-400/25 bg-[#1C1C1E] shadow-sm">
            <span className="text-xs font-sans font-extrabold text-gold-600">{qualityScore}</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.85]">
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="#F5A623"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * qualityScore) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
          <div className="text-left font-sans">
            <p className="text-[11px] font-extrabold text-luxury-textLight">Review Quality Score</p>
            <p className="text-[9px] text-luxury-textMuted font-bold">Natural phrasing & dish references</p>
          </div>
        </div>
        <div className="text-right text-[10px] font-sans text-emerald-400 bg-emerald-950/20 px-2.5 py-0.5 rounded-md border border-emerald-800/30 font-bold shadow-sm">
          Premium Quality
        </div>
      </div>

      {/* Main Textarea Area */}
      <div className="flex-1 flex flex-col space-y-2 relative">
        <div className="absolute top-3 right-3 text-gold-500/40 pointer-events-none">
          <Edit3 className="w-4 h-4" />
        </div>
        
        <textarea
          ref={textareaRef}
          value={reviewText}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={isGenerating}
          rows={7}
          className="w-full flex-1 px-4 py-3 rounded-2xl border border-luxury-border bg-[#1C1C1E] text-luxury-textLight font-sans text-xs sm:text-sm leading-relaxed placeholder-gray-300 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all resize-none shadow-inner"
          placeholder="Generating your draft..."
        />

        {/* Text Area Footer Info */}
        <div className="flex items-center justify-between text-[10px] font-sans font-bold text-luxury-textMuted px-1">
          <span>Editable Draft</span>
          <span>{reviewText ? reviewText.length : 0} characters</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 mt-5">
        
        {/* Post on Google - Solid Rounded Black Pill */}
        <button
          onClick={handlePostClick}
          disabled={isGenerating || !reviewText}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
        >
          <ExternalLink className="w-4.5 h-4.5 stroke-[2.5]" />
          <span className="text-xs">Post on Google</span>
        </button>

        {/* Regenerate Button - White Rounded Outline Pill */}
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-luxury-border bg-[#1C1C1E] text-luxury-textLight hover:bg-[#2C2C2E] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer font-bold shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="text-xs">Regenerate Draft</span>
        </button>

      </div>

    </div>
  );
}
