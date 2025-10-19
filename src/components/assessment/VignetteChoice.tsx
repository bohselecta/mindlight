/**
 * VignetteChoice Component
 * 
 * Multiple choice component for vignette-style questions
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { VignetteOption } from '@/types';

interface VignetteChoiceProps {
  options: VignetteOption[];
  value?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VignetteChoice({ 
  options, 
  value, 
  onChange, 
  disabled = false, 
  className 
}: VignetteChoiceProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        const isSelected = value === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={cn(
              'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900',
              isSelected
                ? 'border-violet-500 bg-violet-500/10 text-slate-200'
                : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center text-sm font-medium text-slate-300">
                {letter}
              </span>
              <span className="text-sm leading-relaxed">{option.text}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
