'use client';

import React, { useEffect } from 'react';
import { PWAInstallPrompt, PWAStatus } from './PWAInstallPrompt';
import { registerServiceWorker } from '@/lib/utils/service-worker';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAStatus />
    </>
  );
}
