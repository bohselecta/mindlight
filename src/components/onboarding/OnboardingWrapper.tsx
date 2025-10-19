/**
 * OnboardingWrapper Component
 * 
 * Client-side wrapper for onboarding modal integration
 */

'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const pathname = usePathname();
  const { shouldShowOnboarding } = useOnboarding();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal when conditions are met
  useEffect(() => {
    if (pathname === '/' && shouldShowOnboarding) {
      setIsModalOpen(true);
    }
  }, [pathname, shouldShowOnboarding]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {children}
      {isModalOpen && (
        <OnboardingModal onClose={handleCloseModal} />
      )}
    </>
  );
}
