'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  // Check if user dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-slate-800/95 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-200 mb-1">
              Install Reflector
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Add to your home screen for quick access to your epistemic autonomy training.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-all"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Smartphone className="w-3 h-3" />
            <span>Works on mobile and desktop</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PWAStatus() {
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      
      setIsPWA(isStandalone || (isIOS && isInStandaloneMode));
    };

    // Check online status
    const checkOnline = () => {
      setIsOnline(navigator.onLine);
    };

    checkPWA();
    checkOnline();

    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  if (!isPWA) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2">
        <Monitor className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-300">PWA Mode</span>
        {!isOnline && (
          <div className="w-2 h-2 bg-amber-400 rounded-full" title="Offline" />
        )}
      </div>
    </div>
  );
}
