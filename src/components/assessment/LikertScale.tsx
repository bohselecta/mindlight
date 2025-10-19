/**
 * LikertScale Component
 * 
 * 7-point Likert scale with accessibility and keyboard navigation
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const labels = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Somewhat Disagree',
  4: 'Neutral',
  5: 'Somewhat Agree',
  6: 'Agree',
  7: 'Strongly Agree'
};

export function LikertScale({ value, onChange, disabled = false, className }: LikertScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      const key = e.key;
      if (key >= '1' && key <= '7') {
        const numValue = parseInt(key);
        onChange(numValue);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChange, disabled]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Scale Labels */}
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>Strongly Disagree</span>
        <span>Neutral</span>
        <span>Strongly Agree</span>
      </div>

      {/* Scale Buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(scaleValue => (
          <button
            key={scaleValue}
            onClick={() => !disabled && onChange(scaleValue)}
            onMouseEnter={() => setHoveredValue(scaleValue)}
            onMouseLeave={() => setHoveredValue(null)}
            disabled={disabled}
            className={cn(
              'flex-1 h-12 rounded-lg border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900',
              value === scaleValue
                ? 'border-violet-500 bg-violet-500/20 text-white'
                : hoveredValue === scaleValue
                ? 'border-violet-400 bg-violet-500/10 text-slate-200'
                : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`${scaleValue}: ${labels[scaleValue as keyof typeof labels]}`}
            aria-pressed={value === scaleValue}
          >
            <span className="font-medium">{scaleValue}</span>
          </button>
        ))}
      </div>

      {/* Selected Value Label */}
      {value && (
        <div className="text-center">
          <span className="text-sm text-slate-300 font-medium">
            {labels[value as keyof typeof labels]}
          </span>
        </div>
      )}
    </div>
  );
}
