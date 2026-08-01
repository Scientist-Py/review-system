import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import Toast from './components/Toast';
import { generateReviewDraft } from './services/gemini';
import { RotateCcw, Copy, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analytics } from './utils/analytics';

const PREFERENCES_KEY = "chapter_one_user_examples";

export default function App() {
  const [reviewText, setReviewText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);
  const [buttonText, setButtonText] = useState("Copy Review & Open Google");

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

  // Load user approved examples from localStorage on mount
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

    // Automatically generate review on page load
    triggerGeneration();
  }, []);

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

  const getRandomItems = () => {
    const items = ["Pizza", "Burger", "Momos", "Cold Coffee", "Staff", "Ambience", "Cleanliness"];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
    return shuffled.slice(0, count);
  };

  const triggerGeneration = async () => {
    setIsGenerating(true);
    setReviewText("");
    
    const randomItems = getRandomItems();
    const randomLanguage = Math.random() < 0.4 ? "Hinglish" : "English";
    const randomTones = ["Casual", "Simple", "Foodie"];
    const randomTone = randomTones[Math.floor(Math.random() * randomTones.length)];

    try {
      const response = await generateReviewDraft({
        selectedItems: randomItems,
        experienceRating: 5,
        writingTone: randomTone,
        language: randomLanguage,
        userApprovedExamples
      });

      // Use the normal draft as default
      const chosenReview = response.normal || response.quick || "Good food and quick service.";
      setReviewText(chosenReview);
    } catch (error) {
      console.error(error);
      const fallbacks = [
        "Really good pizza and quick service. Nice place to visit.",
        "Cold coffee was refreshing and pizza was cheesy. Loved the atmosphere.",
        "Maza aa gaya. Pizza aur cold coffee kafi badhiya tha. Service fast thi."
      ];
      setReviewText(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAndOpen = async () => {
    if (!reviewText) return;

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(reviewText);
      
      triggerConfetti();
      analytics.incrementCopyClick();
      
      // Update button text status briefly
      setButtonText("Review Copied!");
      setTimeout(() => {
        setButtonText("Copy Review & Open Google");
      }, 3000);

      // Open Google Maps Review link
      analytics.incrementGoogleClick();
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');

      showToast("Copied! Paste it inside the Google comment box.", "success");

      // Save to preference examples
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
      // Fallback: Open google anyway
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
      showToast("Opened Google Maps! Please write your review.", "info");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden pb-12 select-none bg-luxury-black text-luxury-textLight font-sans">
      
      {/* Top Header branding (minimal) */}
      <header className="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-luxury-border relative z-10">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <div className="text-left leading-tight">
            <span className="font-sans text-xs font-black tracking-tight text-luxury-textLight block">CHAPTER ONE</span>
            <span className="text-[8px] font-sans font-bold text-gold-400 tracking-widest uppercase block">Cafe Assistant</span>
          </div>
        </div>

        {/* Small silent reload icon */}
        <button
          onClick={triggerGeneration}
          disabled={isGenerating}
          title="Regenerate different review"
          className="p-2 rounded-full border border-luxury-border bg-white text-luxury-textMuted hover:text-luxury-textLight hover:bg-[#E5E5EA] transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main minimal card layout */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-10 relative z-10 flex flex-col items-center justify-center space-y-6">
        
        {/* Logo and Cafe Name */}
        <div className="flex flex-col items-center space-y-3 animate-fade-in text-center">
          <Logo className="w-20 h-20 shadow-sm" />
          <div>
            <h1 className="font-sans text-2xl font-black tracking-tight text-luxury-textLight leading-tight">
              Chapter One Cafe
            </h1>
            <p className="text-[9px] font-sans font-extrabold text-gold-400 tracking-widest uppercase mt-0.5">
              AI Review Assistant
            </p>
          </div>
        </div>

        {/* Review Output Area */}
        <div className="w-full p-5 rounded-3xl border border-luxury-border bg-luxury-card shadow-gold-glow-lg space-y-4 animate-slide-up text-left">
          
          <div className="flex items-center justify-between border-b border-luxury-border pb-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-luxury-textMuted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF9F0A] fill-[#FF9F0A]" />
              Your Review Draft
            </span>
            <span className="text-[8px] font-bold text-luxury-textMuted">
              {isGenerating ? "Generating..." : `${reviewText.split(/\s+/).filter(Boolean).length} words`}
            </span>
          </div>

          {/* Textarea or loader */}
          <div className="min-h-[90px] flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-2 text-luxury-textMuted">
                <div className="w-5 h-5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold">Creating custom review...</span>
              </div>
            ) : (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[90px] p-0 font-medium"
                placeholder="Review text will appear here..."
              />
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleCopyAndOpen}
            disabled={isGenerating || !reviewText}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-sans font-black text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
          >
            <Copy className="w-4 h-4" />
            <span>{buttonText}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

        </div>

        {/* Minimal Instructions Banner */}
        <div className="w-full p-4 rounded-2xl border border-luxury-border bg-white text-left shadow-sm">
          <span className="block text-[8px] uppercase font-extrabold tracking-widest text-[#FF9F0A] text-center border-b border-luxury-border pb-1.5 mb-2.5">
            Quick Guide
          </span>
          <ol className="space-y-2 text-[10px] font-sans font-extrabold text-luxury-textLight list-decimal pl-4.5 leading-normal">
            <li>Scan QR Code.</li>
            <li>Tap "Copy Review & Open Google".</li>
            <li>Paste in Google comment box & tap Post.</li>
          </ol>
          <div className="mt-3 pt-2 border-t border-luxury-border text-center text-[9px] font-sans font-extrabold text-gold-400">
            Thank you for supporting Chapter One Cafe! ☕🍕
          </div>
        </div>

      </main>

      {/* subtles toasts only */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Minimal Brand Footer */}
      <footer className="w-full text-center px-4 mt-4 relative z-10">
        <p className="text-[8px] font-sans font-semibold text-luxury-textMuted leading-relaxed max-w-xs mx-auto">
          &copy; 2026 Chapter One Cafe. Powered by AI. 
          The assistant will never post directly. All stars and final submissions are done manually by customers.
        </p>
      </footer>

    </div>
  );
}
