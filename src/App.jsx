import React, { useState, useEffect, useRef } from 'react';
import Logo from './components/Logo';
import Toast from './components/Toast';
import { generateReviewDraft } from './services/nvidia';
import { RotateCcw, Copy, ExternalLink, Sparkles, Utensils, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analytics } from './utils/analytics';

const PREFERENCES_KEY = "chapter_one_user_examples";

const DISH_OPTIONS = [
  "Pizza",
  "Cold Coffee",
  "Burger",
  "Momos",
  "Pasta",
  "Sandwich",
  "French Fries",
  "Staff",
  "Ambience",
  "Cleanliness"
];

const COMPANION_OPTIONS = [
  "Friends",
  "Family",
  "Solo",
  "Partner / Date"
];

export default function App() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCompanion, setSelectedCompanion] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);
  const [buttonText, setButtonText] = useState("Copy Review & Open Google");

  const isInitialMount = useRef(true);

  const reviewLink = import.meta.env.VITE_GOOGLE_REVIEW_LINK || import.meta.env.VITE_GOOGLE_PLACE_ID || "YOUR_PLACE_ID";
  
  // Clean up accidental key prefix in environment variables
  let parsedReviewLink = reviewLink.trim();
  const envPrefixMatch = parsedReviewLink.match(/^[A-Z0-9_]+=(https?:\/\/.*)$/i) || parsedReviewLink.match(/^[A-Z0-9_]+=(.*)$/i);
  if (envPrefixMatch) {
    parsedReviewLink = envPrefixMatch[1].trim();
  }

  const googleReviewLink = (parsedReviewLink.startsWith("http://") || parsedReviewLink.startsWith("https://"))
    ? parsedReviewLink
    : `https://search.google.com/local/writereview?placeid=${parsedReviewLink}`;

  // Load user approved examples & auto-generate initial review
  useEffect(() => {
    const sessionRecorded = sessionStorage.getItem("scanRecorded");
    if (!sessionRecorded) {
      analytics.incrementScan();
      sessionStorage.setItem("scanRecorded", "true");
    }

    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setUserApprovedExamples(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load user examples from localStorage:", e);
    }

    // Generate initial review on load
    triggerGeneration([], "");
  }, []);

  // When user toggles dishes or companion, trigger dynamic re-generation
  const handleItemToggle = (item) => {
    const nextItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    setSelectedItems(nextItems);
    triggerGeneration(nextItems, selectedCompanion);
  };

  const handleCompanionToggle = (companion) => {
    const nextCompanion = selectedCompanion === companion ? "" : companion;
    setSelectedCompanion(nextCompanion);
    triggerGeneration(selectedItems, nextCompanion);
  };

  const triggerConfetti = () => {
    try {
      const duration = 1.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FFD700', '#121212', '#FFFFFF', '#D4AF37']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FFD700', '#121212', '#FFFFFF', '#D4AF37']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      console.warn("Confetti animation failed:", e);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getRandomDefaultItems = () => {
    const items = ["Pizza", "Cold Coffee", "Burger", "Momos"];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const triggerGeneration = async (items = selectedItems, companion = selectedCompanion) => {
    setIsGenerating(true);
    
    // If no items selected yet, pick 1-2 random items for natural prompt context
    const effectiveItems = items.length > 0 ? items : getRandomDefaultItems();
    const randomLanguage = Math.random() < 0.4 ? "Hinglish" : "English";
    const randomTones = ["Casual", "Simple", "Foodie"];
    const randomTone = randomTones[Math.floor(Math.random() * randomTones.length)];

    try {
      const response = await generateReviewDraft({
        selectedItems: effectiveItems,
        companions: companion,
        experienceRating: 5,
        writingTone: randomTone,
        language: randomLanguage,
        userApprovedExamples
      });

      if (response && response.text) {
        setReviewText(response.text);
      }
    } catch (error) {
      console.error(error);
      setReviewText("One of the best cafes in Baghpat. Really enjoyed the cheesy pizza and refreshing cold coffee. Great service and cozy vibes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAndOpen = async () => {
    if (!reviewText) return;

    try {
      await navigator.clipboard.writeText(reviewText);
      
      triggerConfetti();
      analytics.incrementCopyClick();
      analytics.incrementReviewGenerated(selectedItems.length > 0 ? selectedItems : ["General"]);
      
      setButtonText("Review Copied!");
      setTimeout(() => {
        setButtonText("Copy Review & Open Google");
      }, 3000);

      analytics.incrementGoogleClick();
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');

      showToast("Copied! Paste inside the Google comment box.", "success");

      // Save to approved examples for few-shot learning
      try {
        localStorage.setItem("reviewGenerated", "true");
        const latestApproved = [...userApprovedExamples];
        if (!latestApproved.includes(reviewText) && reviewText.trim().length > 15) {
          latestApproved.push(reviewText);
          const trimmedList = latestApproved.slice(-6);
          setUserApprovedExamples(trimmedList);
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
        }
      } catch (storageErr) {
        console.warn("Learning storage failed", storageErr);
      }

    } catch (err) {
      console.error("Clipboard copy failed:", err);
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
      showToast("Opened Google Maps! Please write your review.", "info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 select-none font-sans text-luxury-textLight">
      
      {/* Centered Main Stack */}
      <div className="w-full max-w-md space-y-5 text-center animate-slide-up">
        
        {/* Logo and Cafe Name */}
        <div className="flex flex-col items-center space-y-2 animate-fade-in">
          <Logo className="w-16 h-16 shadow-sm" />
          <div>
            <h1 className="font-sans text-2xl font-black tracking-tight text-luxury-textLight leading-none">
              Chapter One Cafe
            </h1>
            <p className="text-[9px] font-sans font-extrabold text-[#0071E3] tracking-widest uppercase mt-1">
              AI Review Assistant
            </p>
          </div>
        </div>

        {/* 1. Optional "What did you eat?" Chips */}
        <div className="space-y-1.5 text-left bg-[#F5F5F7] p-3 rounded-2xl border border-luxury-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-luxury-textMuted flex items-center gap-1">
              <Utensils className="w-3 h-3 text-[#0071E3]" />
              What did you enjoy? <span className="text-[9px] font-normal normal-case opacity-70">(optional)</span>
            </span>
            {selectedItems.length > 0 && (
              <button
                onClick={() => { setSelectedItems([]); triggerGeneration([], selectedCompanion); }}
                className="text-[9px] text-luxury-textMuted hover:text-luxury-textLight font-bold"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DISH_OPTIONS.map((dish) => {
              const isSelected = selectedItems.includes(dish);
              return (
                <button
                  key={dish}
                  type="button"
                  onClick={() => handleItemToggle(dish)}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-sans font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white shadow-sm scale-[1.02]'
                      : 'bg-white text-luxury-textLight border border-luxury-border hover:bg-gray-100'
                  }`}
                >
                  {dish}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Optional "Who were you with?" Chips */}
        <div className="space-y-1.5 text-left bg-[#F5F5F7] p-3 rounded-2xl border border-luxury-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-luxury-textMuted flex items-center gap-1">
              <Users className="w-3 h-3 text-[#0071E3]" />
              Who were you with? <span className="text-[9px] font-normal normal-case opacity-70">(optional)</span>
            </span>
            {selectedCompanion && (
              <button
                onClick={() => { setSelectedCompanion(""); triggerGeneration(selectedItems, ""); }}
                className="text-[9px] text-luxury-textMuted hover:text-luxury-textLight font-bold"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMPANION_OPTIONS.map((companion) => {
              const isSelected = selectedCompanion === companion;
              return (
                <button
                  key={companion}
                  type="button"
                  onClick={() => handleCompanionToggle(companion)}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-sans font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white shadow-sm scale-[1.02]'
                      : 'bg-white text-luxury-textLight border border-luxury-border hover:bg-gray-100'
                  }`}
                >
                  {companion}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Review Output Area Box */}
        <div className="w-full p-4 rounded-2xl border border-luxury-border bg-white shadow-sm space-y-3.5 text-left">
          
          <div className="flex items-center justify-between border-b border-luxury-border pb-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-luxury-textMuted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF9F0A] fill-[#FF9F0A]" />
              Custom Review Draft
            </span>
            <button
              onClick={() => triggerGeneration(selectedItems, selectedCompanion)}
              disabled={isGenerating}
              title="Regenerate review"
              className="flex items-center gap-1 text-[9px] font-bold text-[#0071E3] hover:underline cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-2.5 h-2.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? "Generating..." : "New Draft"}</span>
            </button>
          </div>

          {/* Textarea or loading state */}
          <div className="min-h-[80px] flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-1.5 py-4 text-luxury-textMuted">
                <div className="w-5 h-5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                <span className="text-[9.5px] font-bold tracking-wider uppercase">Tailoring review...</span>
              </div>
            ) : (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[80px] p-0 font-medium"
                placeholder="Review text will appear here..."
              />
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleCopyAndOpen}
            disabled={isGenerating || !reviewText}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-sans font-black text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{buttonText}</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>

        </div>

      </div>

      {/* Subtle Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
