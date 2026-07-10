import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import SuccessPopup from './components/SuccessPopup';
import Toast from './components/Toast';
import Dashboard from './components/Dashboard';
import PinModal from './components/PinModal';
import { generateReviewDraft } from './services/gemini';
import { RotateCcw, Sparkles, Star, Languages, Type, Settings, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analytics } from './utils/analytics';

const PREFERENCES_KEY = "chapter_one_user_examples";

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

const LANGUAGE_ITEMS = [
  { id: "English", label: "English" },
  { id: "Hinglish", label: "Hinglish (Hindi)" }
];

export default function App() {
  // Option Selections
  const [selectedItems, setSelectedItems] = useState(["Pizza", "Cold Coffee"]);
  const [experienceRating, setExperienceRating] = useState(5);
  const [language, setLanguage] = useState("English");
  const [writingTone, setWritingTone] = useState("Casual");
  
  // Customizer visibility
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInstantGenerating, setIsInstantGenerating] = useState(false);
  const [drafts, setDrafts] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Modals, toast, dashboard toggles
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [activeReviewText, setActiveReviewText] = useState('');
  const [toast, setToast] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // User-approved examples list for few-shot learning
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);

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

  // Load approved examples on mount
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
  }, []);

  // Trigger boutique gold, charcoal, and white confetti
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

  const handleItemToggle = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const getRandomItems = () => {
    const items = ["Pizza", "Burger", "Momos", "Cold Coffee", "Staff", "Ambience", "Cleanliness"];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
    return shuffled.slice(0, count);
  };

  const handleInstantReview = async () => {
    setIsInstantGenerating(true);
    const randomItems = getRandomItems();
    
    try {
      const response = await generateReviewDraft({
        selectedItems: randomItems,
        experienceRating: 5,
        writingTone: "Casual",
        language: "English",
        userApprovedExamples
      });

      const chosenReview = response.normal || response.quick || "Good food and quick service.";
      
      // Copy to clipboard
      await navigator.clipboard.writeText(chosenReview);
      
      triggerConfetti();
      analytics.incrementReviewGenerated(randomItems);
      analytics.incrementCopyClick();

      try {
        localStorage.setItem("reviewGenerated", "true");
        const latestApproved = [...userApprovedExamples];
        if (!latestApproved.includes(chosenReview) && chosenReview.trim().length > 15) {
          latestApproved.push(chosenReview);
          const trimmedList = latestApproved.slice(-6);
          setUserApprovedExamples(trimmedList);
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
        }
      } catch (storageErr) {
        console.warn("Learning storage failed", storageErr);
      }

      setActiveReviewText(chosenReview);
      setIsSuccessOpen(true);
      showToast("Instant review copied successfully!", "success");
    } catch (err) {
      console.error(err);
      const fallbackText = "Good place, nice cheesy pizza and quick service. Will visit again.";
      await navigator.clipboard.writeText(fallbackText);
      triggerConfetti();
      setActiveReviewText(fallbackText);
      setIsSuccessOpen(true);
      showToast("Copied fallback review.", "info");
    } finally {
      setIsInstantGenerating(false);
    }
  };

  const triggerCustomGeneration = async () => {
    setIsGenerating(true);
    
    try {
      const response = await generateReviewDraft({
        selectedItems,
        experienceRating,
        writingTone,
        language,
        userApprovedExamples
      });

      setDrafts({
        quick: response.quick,
        normal: response.normal,
        detailed: response.detailed
      });

      analytics.incrementReviewGenerated(selectedItems);
      if (response.source === 'fallback') {
        showToast("Drafts ready! (Local generator used)", "info");
      } else {
        showToast("AI Review Drafts ready!", "success");
      }
    } catch (error) {
      console.error(error);
      setDrafts({
        quick: "Nice food and quick service.",
        normal: "Loved the cheesy pizza and cold coffee. Seating is nice. Good service.",
        detailed: "Good experience at Chapter One Cafe. Cheesy pizza was very tasty and cold coffee was refreshing. Staff was polite. Cozy place."
      });
      showToast("Generation failed. Loaded fallback drafts.", "warning");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostReviewClick = async (text) => {
    triggerConfetti();
    analytics.incrementCopyClick();

    try {
      await navigator.clipboard.writeText(text);
      localStorage.setItem("reviewGenerated", "true");
      
      const latestApproved = [...userApprovedExamples];
      if (!latestApproved.includes(text) && text.trim().length > 15) {
        latestApproved.push(text);
        const trimmedList = latestApproved.slice(-6);
        setUserApprovedExamples(trimmedList);
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
      }
    } catch (e) {
      console.warn("Unable to save statistics/learning preferences:", e);
    }

    setActiveReviewText(text);
    setCopiedText(text);
    setIsSuccessOpen(true);

    // Reset copied status after a delay
    setTimeout(() => {
      setCopiedText("");
    }, 3000);
  };

  const handleReset = () => {
    setSelectedItems(["Pizza", "Cold Coffee"]);
    setExperienceRating(5);
    setLanguage("English");
    setWritingTone("Casual");
    setDrafts(null);
    setToast(null);
    setShowDashboard(false);
    setShowCustomizer(false);
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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden pb-12 select-none bg-luxury-black text-luxury-textLight">
      
      {/* Decorative premium soft glowing orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-gold-400/2 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-400/2 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between border-b border-luxury-border relative z-10">
        <div onClick={handleReset} className="flex items-center gap-2 cursor-pointer">
          <Logo className="w-9 h-9" />
          <div className="text-left">
            <span className="font-serif text-sm font-bold tracking-wider text-luxury-textLight block">CHAPTER ONE</span>
            <span className="text-[9px] font-sans font-bold text-gold-600 tracking-widest uppercase block -mt-1">Cafe Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showDashboard && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-luxury-border bg-[#F5F5F7] text-xs text-luxury-textLight hover:bg-[#E5E5EA] active:scale-95 transition-all cursor-pointer font-bold shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {!showDashboard && (
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-luxury-border bg-[#F5F5F7] text-xs text-luxury-textMuted hover:text-luxury-textLight hover:bg-[#E5E5EA] active:scale-95 transition-all cursor-pointer font-bold shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center">
        
        {showDashboard ? (
          <div className="w-full">
            <Dashboard onClose={() => setShowDashboard(false)} />
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6 text-center">
            
            {/* 1. Large Logo and Branding */}
            <div className="flex flex-col items-center space-y-3 animate-fade-in">
              <Logo className="w-24 h-24 shadow-gold-glow" />
              <div>
                <h1 className="font-serif text-2.5xl sm:text-3.5xl font-extrabold tracking-wide text-luxury-textLight">
                  Chapter One Cafe
                </h1>
                <p className="text-xs font-sans font-bold text-gold-600 tracking-widest uppercase mt-0.5">
                  AI Review Assistant
                </p>
              </div>
            </div>

            {/* 2. Simple Landing Action Buttons */}
            <div className="p-6 rounded-3xl border border-luxury-border bg-luxury-card shadow-gold-glow-lg space-y-4 animate-slide-up">
              
              {/* Primary Instant Review Button */}
              <button
                onClick={handleInstantReview}
                disabled={isInstantGenerating}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isInstantGenerating ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing Review Draft...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm">Post Instant Review</span>
                  </>
                )}
              </button>

              {/* Secondary Customizer Toggle Button */}
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-luxury-border bg-[#F5F5F7] text-luxury-textLight hover:bg-[#E5E5EA] active:scale-[0.98] transition-all font-bold shadow-sm cursor-pointer text-xs"
              >
                <span>Customize Review</span>
                {showCustomizer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

            </div>

            {/* 3. Expandable Customizer Section */}
            {showCustomizer && (
              <div className="w-full p-6 rounded-3xl border border-luxury-border bg-luxury-card shadow-gold-glow-lg space-y-5 animate-slide-up text-left">
                <div>
                  <h3 className="font-serif text-lg font-bold tracking-wide">
                    Configure Custom Review
                  </h3>
                  <p className="text-[10px] text-luxury-textMuted font-sans font-bold">Select details below to generate specific drafts.</p>
                </div>

                {/* Checklist: What did you enjoy? */}
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
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-sans font-bold transition-all duration-150 cursor-pointer shadow-sm ${
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

                {/* Rating Selector */}
                <div className="space-y-1 text-center py-2 bg-[#F5F5F7]/60 rounded-2xl border border-luxury-border shadow-inner">
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

                {/* Language Selector */}
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

                {/* Tone Selector */}
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

                {/* Custom Generate Button */}
                <button
                  onClick={triggerCustomGeneration}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Review Drafts...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 fill-white stroke-white" />
                      <span className="text-sm">Generate Review Drafts</span>
                    </>
                  )}
                </button>

                {/* Customizer Generated Options Display */}
                {!isGenerating && drafts && (
                  <div className="space-y-3 pt-3 border-t border-luxury-border">
                    <span className="block text-[9px] uppercase font-bold tracking-wider text-gold-600 text-center">Select your favorite option</span>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {/* 1. Quick Option */}
                      <div className="p-4 rounded-2xl border border-luxury-border bg-white shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold text-gold-700 bg-gold-50 border border-gold-400/20 rounded-md">Quick Option</span>
                          <span className="text-[8px] font-sans font-bold text-luxury-textMuted">{drafts.quick.split(/\s+/).length} words</span>
                        </div>
                        <textarea
                          value={drafts.quick}
                          onChange={(e) => setDrafts({ ...drafts, quick: e.target.value })}
                          className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[65px]"
                        />
                        <button
                          onClick={() => handlePostReviewClick(drafts.quick)}
                          className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer w-full"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedText === drafts.quick ? "Copied!" : "Copy & Post"}</span>
                        </button>
                      </div>

                      {/* 2. Casual Option */}
                      <div className="p-4 rounded-2xl border border-gold-400/30 bg-white shadow-md flex flex-col justify-between relative">
                        <div className="absolute top-0 right-4 translate-y-[-50%] bg-gold-600 text-white text-[7px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Popular</div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold text-gold-700 bg-gold-50 border border-gold-400/20 rounded-md">Casual Option</span>
                          <span className="text-[8px] font-sans font-bold text-luxury-textMuted">{drafts.normal.split(/\s+/).length} words</span>
                        </div>
                        <textarea
                          value={drafts.normal}
                          onChange={(e) => setDrafts({ ...drafts, normal: e.target.value })}
                          className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[65px]"
                        />
                        <button
                          onClick={() => handlePostReviewClick(drafts.normal)}
                          className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer w-full"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedText === drafts.normal ? "Copied!" : "Copy & Post"}</span>
                        </button>
                      </div>

                      {/* 3. Detailed Option */}
                      <div className="p-4 rounded-2xl border border-luxury-border bg-white shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold text-gold-700 bg-gold-50 border border-gold-400/20 rounded-md">Foodie Option</span>
                          <span className="text-[8px] font-sans font-bold text-luxury-textMuted">{drafts.detailed.split(/\s+/).length} words</span>
                        </div>
                        <textarea
                          value={drafts.detailed}
                          onChange={(e) => setDrafts({ ...drafts, detailed: e.target.value })}
                          className="w-full text-xs font-sans text-luxury-textLight bg-transparent border-0 resize-none focus:ring-0 focus:outline-none leading-relaxed h-[65px]"
                        />
                        <button
                          onClick={() => handlePostReviewClick(drafts.detailed)}
                          className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-sans font-bold text-white bg-luxury-dark hover:bg-luxury-darkHover hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer w-full"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedText === drafts.detailed ? "Copied!" : "Copy & Post"}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Modals & Toasts */}
      <SuccessPopup
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        googleReviewLink={googleReviewLink}
        onGoogleClick={() => analytics.incrementGoogleClick()}
      />

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => setShowDashboard(true)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Brand Compliance Footer */}
      <footer className="w-full text-center px-4 mt-8 relative z-10">
        <p className="text-[9px] font-sans font-semibold text-luxury-textMuted leading-relaxed max-w-xs mx-auto">
          &copy; 2026 Chapter One Cafe. Powered by AI. 
          The assistant will never post directly. All stars and final submissions are done manually by customers.
        </p>
      </footer>

    </div>
  );
}
