import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import Toast from './components/Toast';
import { generateReviewDraft } from './services/gemini';
import { RotateCcw, Copy, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analytics } from './utils/analytics';

const PREFERENCES_KEY = "chapter_one_user_examples";

export default function App() {
  const [reviewText, setReviewText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);
  const [buttonText, setButtonText] = useState("Copy & Open Google");

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

  // Load user approved examples on mount & automatically generate review
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
        setButtonText("Copy & Open Google");
      }, 3000);

      // Open Google Maps Review link
      analytics.incrementGoogleClick();
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');

      showToast("Copied! Paste inside the Google comment box.", "success");

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
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
      showToast("Opened Google Maps! Please write your review.", "info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 select-none font-sans text-luxury-textLight">
      
      {/* Unified Vertical Centered Container */}
      <div className="w-full max-w-sm space-y-6 text-center animate-slide-up">
        
        {/* Logo and Cafe Name */}
        <div className="flex flex-col items-center space-y-2.5 animate-fade-in">
          <Logo className="w-20 h-20" />
          <div>
            <h1 className="font-sans text-2xl font-black tracking-tight text-luxury-textLight leading-none">
              Chapter One Cafe
            </h1>
            <p className="text-[9px] font-sans font-extrabold text-luxury-textMuted tracking-widest uppercase mt-1">
              AI Review Assistant
            </p>
          </div>
        </div>

        {/* Flat Review Area Box */}
        <div className="w-full p-4.5 rounded-2xl border border-luxury-border bg-white space-y-4">
          
          {/* Review text field or loader */}
          <div className="min-h-[100px] flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-2 text-luxury-textMuted">
                <div className="w-5 h-5 border-2 border-luxury-dark border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Creating Review...</span>
              </div>
            ) : (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[100px] p-0 font-medium text-center"
                placeholder="Review text will appear here..."
              />
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleCopyAndOpen}
            disabled={isGenerating || !reviewText}
            className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-full font-sans font-black text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-sm active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{buttonText}</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>

        </div>

        {/* Small reload link underneath */}
        <button
          onClick={triggerGeneration}
          disabled={isGenerating}
          className="inline-flex items-center gap-1 text-[10px] text-luxury-textMuted hover:text-luxury-textLight font-sans font-bold cursor-pointer transition-all uppercase tracking-widest disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Try another review</span>
        </button>

      </div>

      {/* subtly positioned toasts only */}
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
