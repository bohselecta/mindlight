/**
 * ProgressBar Component
 * 
 * Visual progress indicator for assessments
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export function ProgressBar({ 
  current, 
  total, 
  className, 
  showText = true 
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      {showText && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {current} of {total} completed
          </span>
          <span className="text-slate-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
