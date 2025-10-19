/**
 * useOnboarding Hook
 * 
 * Manages onboarding state using localStorage
 */

import { useState, useEffect } from 'react';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasBaselineScore: boolean;
  isLoading: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    hasSeenOnboarding: false,
    hasBaselineScore: false,
    isLoading: true
  });

  useEffect(() => {
    // Check localStorage for onboarding state
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    
    // Check if user has completed Baseline Mirror
    const checkBaselineCompletion = async () => {
      try {
        // Import the store dynamically to avoid SSR issues
        const { createAutonomyStore } = await import('@/lib/store/autonomy-store');
        const store = createAutonomyStore();
        const responses = await store.getResponses('baseline-mirror');
        const hasBaselineScore = responses.length > 0;
        
        setState({
          hasSeenOnboarding,
          hasBaselineScore,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to check baseline completion:', error);
        setState({
          hasSeenOnboarding,
          hasBaselineScore: false,
          isLoading: false
        });
      }
    };

    checkBaselineCompletion();
  }, []);

  const markOnboardingSeen = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setState(prev => ({ ...prev, hasSeenOnboarding: true }));
  };

  const shouldShowOnboarding = !state.hasSeenOnboarding && !state.isLoading;

  return {
    ...state,
    markOnboardingSeen,
    shouldShowOnboarding
  };
}
