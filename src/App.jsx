import React, { useState, useEffect } from 'react';
import LandingSection from './components/LandingSection';
import ReviewForm from './components/ReviewForm';
import GeneratedReview from './components/GeneratedReview';
import SuccessPopup from './components/SuccessPopup';
import Toast from './components/Toast';
import Logo from './components/Logo';
import Dashboard from './components/Dashboard';
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

  // User-approved examples list for few-shot learning
  const [userApprovedExamples, setUserApprovedExamples] = useState([]);

  const reviewLink = import.meta.env.VITE_GOOGLE_REVIEW_LINK || import.meta.env.VITE_GOOGLE_PLACE_ID || "YOUR_PLACE_ID";
  const googleReviewLink = (reviewLink.startsWith("http://") || reviewLink.startsWith("https://"))
    ? reviewLink
    : `https://search.google.com/local/writereview?placeid=${reviewLink}`;

  // Log scan and load approved examples on mount
  useEffect(() => {
    // 1. Record scan once per session
    const sessionRecorded = sessionStorage.getItem("scanRecorded");
    if (!sessionRecorded) {
      analytics.incrementScan();
      sessionStorage.setItem("scanRecorded", "true");
    }

    // 2. Load preferences list for learning
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setUserApprovedExamples(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load user examples from localStorage:", e);
    }
  }, []);

  // Trigger boutique gold and silver confetti
  const triggerGoldConfetti = () => {
    try {
      const duration = 1.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FFD700', '#B8860B', '#FFFFFF', '#E5E7EB']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FFD700', '#B8860B', '#FFFFFF', '#E5E7EB']
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

  const handleStartReview = () => {
    setCurrentPage('form');
  };

  const handleFormSubmit = async (data) => {
    setIsGenerating(true);
    setFormData(data);
    setCurrentPage('result');
    
    // Log review generation event in analytics
    analytics.incrementReviewGenerated(data.selectedItems);

    try {
      // Pass both form details and userApprovedExamples for learning
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
    // 1. Trigger celebration
    triggerGoldConfetti();
    
    // 2. Increment analytics stats
    analytics.incrementCopyClick();
    analytics.incrementGoogleClick();

    // 3. Mark customer as returning for future scans & save review for learning
    try {
      localStorage.setItem("reviewGenerated", "true");
      
      // Learning block: Save final edited review text as a future few-shot exemplar
      const latestApproved = [...userApprovedExamples];
      // Avoid duplicate saves
      if (!latestApproved.includes(reviewText) && reviewText.trim().length > 15) {
        latestApproved.push(reviewText);
        // Limit historical exemplars size to keep prompt compact and relevant
        const trimmedList = latestApproved.slice(-6);
        setUserApprovedExamples(trimmedList);
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(trimmedList));
      }
    } catch (e) {
      console.warn("Unable to save statistics/learning preferences:", e);
    }

    // 4. Open success modal instructions
    setIsSuccessOpen(true);

    // 5. Open redirect in new tab after 1.5s countdown
    setTimeout(() => {
      window.open(googleReviewLink, '_blank', 'noopener,noreferrer');
      setIsSuccessOpen(false);
    }, 1600);
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
      
      {/* Decorative premium gold & green glowing orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-green-700/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-gold-400/3 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-white/5 relative z-10">
        <div onClick={handleReset} className="flex items-center gap-2 cursor-pointer">
          <Logo className="w-9 h-9" />
          <div className="text-left">
            <span className="font-serif text-sm font-bold tracking-wider text-white block">CHAPTER ONE</span>
            <span className="text-[9px] font-sans font-bold text-gold-400 tracking-widest uppercase block -mt-1">Cafe Assistant</span>
          </div>
        </div>

        {/* Small restart key visible on sub-pages */}
        {(currentPage !== 'landing' || showDashboard) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gold-400/20 bg-gold-400/5 text-xs text-gold-400 hover:bg-gold-400/10 hover:border-gold-400/40 active:scale-95 transition-all cursor-pointer font-semibold"
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
                onOpenDashboard={() => setShowDashboard(true)}
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
        <p className="text-[9px] font-sans font-semibold text-gray-500 leading-relaxed max-w-xs mx-auto">
          &copy; 2026 Chapter One Cafe Baghpat. Powered by Google Gemini API. 
          The assistant will never post directly to Google Reviews. All stars and final submissions are done manually by customers.
        </p>
      </footer>

    </div>
  );
}
