/**
 * AssessmentWrapper Component
 * 
 * Wrapper component that handles assessment flow, auto-save, and progress tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AssessmentItem, UserResponse } from '@/types';
import { LikertScale } from './LikertScale';
import { VignetteChoice } from './VignetteChoice';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface AssessmentWrapperProps {
  items: AssessmentItem[];
  assessmentId: string;
  onComplete: (responses: UserResponse[]) => void;
  onSaveProgress?: (responses: UserResponse[]) => void;
  className?: string;
}

export function AssessmentWrapper({ 
  items, 
  assessmentId, 
  onComplete, 
  onSaveProgress,
  className 
}: AssessmentWrapperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIndex];
  const completedCount = Object.keys(responses).length;
  const progress = (completedCount / items.length) * 100;

  // Auto-save progress
  useEffect(() => {
    if (onSaveProgress && completedCount > 0) {
      const userResponses: UserResponse[] = Object.entries(responses).map(([itemId, value]) => ({
        userId: 'default_user',
        assessmentId,
        itemId,
        value,
        timestamp: new Date()
      }));
      onSaveProgress(userResponses);
    }
  }, [responses, assessmentId, onSaveProgress, completedCount]);

  const handleResponse = useCallback((value: number) => {
    if (!currentItem) return;

    setResponses(prev => ({
      ...prev,
      [currentItem.id]: value
    }));

    // Auto-advance to next item
    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Assessment complete
        setIsComplete(true);
        const allResponses: UserResponse[] = Object.entries({
          ...responses,
          [currentItem.id]: value
        }).map(([itemId, value]) => ({
          userId: 'default_user',
          assessmentId,
          itemId,
          value,
          timestamp: new Date()
        }));
        onComplete(allResponses);
      }
    }, 300);
  }, [currentItem, currentIndex, items.length, responses, assessmentId, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, items.length]);

  if (isComplete) {
    return (
      <div className={cn('text-center space-y-4', className)}>
        <div className="text-2xl text-emerald-400">✓</div>
        <h3 className="text-xl font-medium text-slate-200">Assessment Complete</h3>
        <p className="text-slate-400">Processing your responses...</p>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className={cn('text-center space-y-4', className)}>
        <div className="text-2xl text-amber-400">⚠</div>
        <h3 className="text-xl font-medium text-slate-200">No Items Available</h3>
        <p className="text-slate-400">Please check your assessment configuration.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      <ProgressBar 
        current={completedCount} 
        total={items.length} 
        className="mb-8"
      />

      {/* Current Item */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm text-slate-400">
            {currentIndex + 1}
          </div>
          <p className="text-slate-200 leading-relaxed flex-1">{currentItem.prompt}</p>
        </div>

        {/* Response Component */}
        {currentItem.type === 'likert7' ? (
          <LikertScale
            value={responses[currentItem.id]}
            onChange={handleResponse}
          />
        ) : currentItem.type === 'vignette' ? (
          <VignetteChoice
            options={currentItem.options}
            value={responses[currentItem.id]?.toString()}
            onChange={(optionId) => {
              const option = currentItem.options.find(o => o.id === optionId);
              if (option) {
                handleResponse(option.score);
              }
            }}
          />
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            'px-4 py-2 rounded-lg border-2 transition-all',
            currentIndex === 0
              ? 'border-slate-700 text-slate-600 cursor-not-allowed'
              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
          )}
        >
          ← Previous
        </button>

        <div className="text-sm text-slate-500">
          {currentIndex + 1} of {items.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === items.length - 1 || !responses[currentItem.id]}
          className={cn(
            'px-4 py-2 rounded-lg border-2 transition-all',
            currentIndex === items.length - 1 || !responses[currentItem.id]
              ? 'border-slate-700 text-slate-600 cursor-not-allowed'
              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
          )}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
