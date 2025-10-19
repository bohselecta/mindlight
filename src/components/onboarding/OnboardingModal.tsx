/**
 * OnboardingModal Component
 * 
 * 3-screen onboarding modal for first-time users
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles, Brain, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { markOnboardingSeen } = useOnboarding();

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingSeen();
    onClose();
  };

  const handleStartBaseline = () => {
    markOnboardingSeen();
    onClose();
  };

  const handleExploreAll = () => {
    markOnboardingSeen();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-300">Welcome to Mindlight</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Screen 1: Welcome */}
          {currentScreen === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-light text-slate-100 mb-4">
                Reclaim Your Epistemic Autonomy
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                A research-backed suite for noticing when beliefs aren't yours. 
                Develop the metacognitive skills to think independently.
              </p>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-8">
                <p className="text-sm text-slate-300">
                  <strong className="text-slate-200">What you'll learn:</strong> How to spot when 
                  your thinking patterns are outsourced to groups, authorities, or echo chambers.
                </p>
              </div>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto"
              >
                How It Works
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Screen 2: Three-Path Explanation */}
          {currentScreen === 1 && (
            <div>
              <h2 className="text-2xl font-light text-slate-100 mb-6 text-center">
                Three Steps to Autonomy
              </h2>
              
              <div className="space-y-6">
                {/* Mirror */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Mirror</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Assess your current thinking patterns. Get your baseline autonomy score 
                      across four key constructs.
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>

                {/* Loop */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Loop</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Train bias detection through interactive games. Practice spotting 
                      when emotion bypasses deliberation.
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>

                {/* Progress */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Progress</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Track your autonomy growth over time with visual dashboards 
                      and personalized insights.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setCurrentScreen(0)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-3 rounded-xl font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Screen 3: Call to Action */}
          {currentScreen === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-light text-slate-100 mb-4">
                Ready to Begin?
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Start with the Baseline Mirror to get your autonomy score, 
                or explore all modules at your own pace.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/mirrors/baseline"
                  onClick={handleStartBaseline}
                  className="block w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  Start with Baseline Mirror
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button
                  onClick={handleExploreAll}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Explore All Modules
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentScreen(1)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-all text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-transparent hover:bg-slate-700/50 text-slate-400 px-4 py-2 rounded-lg font-medium transition-all text-sm"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentScreen
                  ? 'bg-blue-500 w-6'
                  : index < currentScreen
                  ? 'bg-blue-400'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
