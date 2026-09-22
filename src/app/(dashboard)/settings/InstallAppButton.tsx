'use client';

import { useState, useEffect } from 'react';
import { Download, CheckCircle2, Share, X, PlusSquare } from 'lucide-react';

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Check if device is iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowManualModal(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Android native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      // iOS / Safari / Unsupported fallback modal
      setShowManualModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold shadow-sm cursor-default">
        <CheckCircle2 className="w-4 h-4" /> App Installed
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-95"
      >
        <Download className="w-4 h-4" /> Install App
      </button>

      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowManualModal(false)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative overflow-hidden w-full max-w-sm z-10 animate-in zoom-in-95 duration-200 text-center">
            <button onClick={() => setShowManualModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <Download className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Install WeColax Vault</h3>
            
            {isIOS ? (
              <div className="text-slate-600 text-sm space-y-4 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
                <p>To install this app on your iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-3 font-medium text-slate-700">
                  <li className="flex items-center gap-2">
                    Tap the <Share className="w-4 h-4 text-blue-600 inline-block" /> <strong>Share</strong> button at the bottom of your screen.
                  </li>
                  <li className="flex items-center gap-2">
                    Scroll down and tap <PlusSquare className="w-4 h-4 text-slate-600 inline-block" /> <strong>Add to Home Screen</strong>.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="text-slate-600 text-sm space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
                <p>To install this app on your computer/device:</p>
                <p className="font-medium">Click the install icon (usually looks like a screen with a download arrow) in the right side of your browser's address bar, or check your browser's settings menu for "Install App".</p>
              </div>
            )}
            
            <button 
              onClick={() => setShowManualModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
