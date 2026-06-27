import React, { useState, useEffect } from 'react';
import LandingSection from './components/LandingSection';
import ReviewForm from './components/ReviewForm';
import GeneratedReview from './components/GeneratedReview';
import SuccessPopup from './components/SuccessPopup';
import Toast from './components/Toast';
import Logo from './components/Logo';
import Dashboard from './components/Dashboard';
import PinModal from './components/PinModal';
import { generateReviewDraft } from './services/gemini';
import { RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analytics } from './utils/analytics';

const PREFERENCES_KEY = "chapter_one_user_examples";

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'form' | 'result'
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [formData, setFormData] = useState(null);
  
  // Modals, toast, dashboard toggles
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // User-approved examples list for few-shot learning
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);

  const reviewLink = import.meta.env.VITE_GOOGLE_REVIEW_LINK || import.meta.env.VITE_GOOGLE_PLACE_ID || "YOUR_PLACE_ID";
  const googleReviewLink = (reviewLink.startsWith("http://") || reviewLink.startsWith("https://"))
    ? reviewLink
    : `https://search.google.com/local/writereview?placeid=${reviewLink}`;

  // Log scan and load approved examples on mount
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

  const getRandomItems = () => {
    const items = ["Pizza", "Burger", "Momos", "Cold Coffee", "Staff", "Ambience", "Cleanliness"];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 items
    return shuffled.slice(0, count);
  };

  const getRandomTone = () => {
    const tones = ["Casual", "Foodie", "Family", "Professional", "Short & Simple"];
    return tones[Math.floor(Math.random() * tones.length)];
  };

  const getRandomMode = () => {
    const modes = ["Quick", "Normal", "Detailed"];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  const handleInstantReview = async (language) => {
    setIsGenerating(true);
    const items = getRandomItems();
    const tone = getRandomTone();
    const mode = getRandomMode();

    try {
      const response = await generateReviewDraft({
        selectedItems: items,
        experienceRating: 5,
        reviewMode: mode,
        writingTone: tone,
        language,
        userApprovedExamples
      });

      const draftText = response.text;
      setReviewText(draftText);
      setFormData({
        selectedItems: items,
        experienceRating: 5,
        reviewMode: mode,
        writingTone: tone,
        language
      });

      try {
        await navigator.clipboard.writeText(draftText);
        
        triggerConfetti();
        analytics.incrementReviewGenerated(items);
        analytics.incrementCopyClick();

        try {
          localStorage.setItem("reviewGenerated", "true");
          const latestApproved = [...userApprovedExamples];
          if (!latestApproved.includes(draftText) && draftText.trim().length > 15) {
            latestApproved.push(draftText);
            const trimmedList = latestApproved.slice(-6);
            setUserApprovedExamples(trimmedList);
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
          }
        } catch (storageErr) {
          console.warn("Learning storage failed", storageErr);
        }

        setIsSuccessOpen(true);
        setIsGenerating(false);

      } catch (copyErr) {
        console.warn("Clipboard copy blocked, showing result page instead:", copyErr);
        setCurrentPage('result');
        showToast("Review generated! Please copy & post manually.", "info");
        setIsGenerating(false);
      }

    } catch (err) {
      console.error("Instant review generation failed:", err);
      showToast("Generation failed. Please try the Customize option.", "error");
      setIsGenerating(false);
    }
  };

  const handleStartReview = () => {
    setCurrentPage('form');
  };

  const handleFormSubmit = async (data) => {
    setIsGenerating(true);
    setFormData(data);
    setCurrentPage('result');
    
    analytics.incrementReviewGenerated(data.selectedItems);

    try {
      const response = await generateReviewDraft({
        ...data,
        userApprovedExamples
      });
      
      setReviewText(response.text);
      
      if (response.source === 'fallback') {
        showToast("Draft ready! (Local generator used)", "info");
      } else {
        showToast("AI Review Draft generated!", "success");
      }
    } catch (error) {
      console.error(error);
      setReviewText("Excellent dining experience at Chapter One Cafe Baghpat! The food was delicious, staff was very prompt, and the ambience was lovely. Highly recommended.");
      showToast("Generation failed. Loaded fallback review.", "warning");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    setIsGenerating(true);
    showToast("Regenerating review draft...", "info");

    try {
      const response = await generateReviewDraft({
        ...formData,
        userApprovedExamples
      });
      setReviewText(response.text);
      if (response.source === 'fallback') {
        showToast("New draft ready!", "success");
      } else {
        showToast("New AI Draft ready!", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Regeneration failed. Keeping current review.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostReviewClick = () => {
    triggerConfetti();
    
    analytics.incrementCopyClick();

    try {
      localStorage.setItem("reviewGenerated", "true");
      
      const latestApproved = [...userApprovedExamples];
      if (!latestApproved.includes(reviewText) && reviewText.trim().length > 15) {
        latestApproved.push(reviewText);
        const trimmedList = latestApproved.slice(-6);
        setUserApprovedExamples(trimmedList);
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
      }
    } catch (e) {
      console.warn("Unable to save statistics/learning preferences:", e);
    }

    setIsSuccessOpen(true);
  };

  const handleReset = () => {
    setCurrentPage('landing');
    setFormData(null);
    setReviewText('');
    setToast(null);
    setShowDashboard(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden pb-12 select-none bg-luxury-black">
      
      {/* Decorative premium soft glowing orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-gold-400/2 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-400/2 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-luxury-border relative z-10">
        <div onClick={handleReset} className="flex items-center gap-2 cursor-pointer">
          <Logo className="w-9 h-9" />
          <div className="text-left">
            <span className="font-serif text-sm font-bold tracking-wider text-luxury-textLight block">CHAPTER ONE</span>
            <span className="text-[9px] font-sans font-bold text-gold-600 tracking-widest uppercase block -mt-1">Cafe Assistant</span>
          </div>
        </div>

        {/* Small restart key visible on sub-pages */}
        {(currentPage !== 'landing' || showDashboard) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-luxury-border bg-[#F5F5F7] text-xs text-luxury-textLight hover:bg-[#E5E5EA] active:scale-95 transition-all cursor-pointer font-bold shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 flex flex-col justify-center py-6 relative z-10">
        
        {showDashboard ? (
          <Dashboard onClose={() => setShowDashboard(false)} />
        ) : (
          <>
            {currentPage === 'landing' && (
              <LandingSection 
                onStart={handleStartReview} 
                onOpenDashboard={() => setShowPinModal(true)}
                onInstantClick={handleInstantReview}
                isGenerating={isGenerating}
              />
            )}

            {currentPage === 'form' && (
              <ReviewForm onSubmit={handleFormSubmit} isGenerating={isGenerating} />
            )}

            {currentPage === 'result' && (
              <GeneratedReview
                reviewText={reviewText}
                onChangeText={setReviewText}
                onCopy={handlePostReviewClick}
                onRegenerate={handleRegenerate}
                isGenerating={isGenerating}
                selectedItemsCount={formData ? formData.selectedItems.length : 1}
                googleReviewLink={googleReviewLink}
              />
            )}
          </>
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
