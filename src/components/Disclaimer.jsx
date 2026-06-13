import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Disclaimer() {
  const [show, setShow] = useState(() => {
    const isDismissed = localStorage.getItem('mindflow_disclaimer_dismissed');
    return isDismissed !== 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('mindflow_disclaimer_dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/20 text-amber-200 px-4 py-2 text-xs md:text-sm flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <AlertCircle size={16} className="text-amber-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Medical Disclaimer:</strong> MindFlow is an AI-powered student mental wellness companion designed for stress tracking and self-reflection. It is <strong>not</strong> a medical device, diagnostic tool, or a substitute for professional clinical therapy. If you are experiencing an emotional crisis, please contact student helpline numbers or professional healthcare services immediately.
        </p>
      </div>
      <button 
        onClick={handleDismiss}
        className="p-1 hover:bg-amber-900/50 rounded-full transition-colors text-amber-400 hover:text-amber-200 ml-2"
        aria-label="Dismiss disclaimer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
