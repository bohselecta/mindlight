/**
 * CompletionIndicator Component
 * 
 * Shows completion status for modules
 */

'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { ModuleCompletion } from '@/lib/hooks/useModuleCompletion';
import { cn } from '@/lib/utils';

interface CompletionIndicatorProps {
  completion: ModuleCompletion;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function CompletionIndicator({ 
  completion, 
  size = 'md', 
  showProgress = false,
  className 
}: CompletionIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (completion.completed) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <CheckCircle2 className={cn(sizeClasses[size], 'text-emerald-400')} />
        {showProgress && (
          <span className={cn(textSizeClasses[size], 'text-emerald-400 font-medium')}>
            Complete
          </span>
        )}
      </div>
    );
  }

  if (completion.progress && completion.progress > 0) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="relative">
          <Circle className={cn(sizeClasses[size], 'text-slate-400')} />
          <div 
            className="absolute inset-0 rounded-full border-2 border-amber-400"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + (completion.progress / 100) * 50}% 0%, ${50 + (completion.progress / 100) * 50}% 50%)`
            }}
          />
        </div>
        {showProgress && (
          <span className={cn(textSizeClasses[size], 'text-amber-400 font-medium')}>
            {Math.round(completion.progress)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Circle className={cn(sizeClasses[size], 'text-slate-500')} />
      {showProgress && (
        <span className={cn(textSizeClasses[size], 'text-slate-500')}>
          Not started
        </span>
      )}
    </div>
  );
}

/**
 * CompletionBadge Component
 * 
 * Shows completion status as a badge
 */

interface CompletionBadgeProps {
  completion: ModuleCompletion;
  className?: string;
}

export function CompletionBadge({ completion, className }: CompletionBadgeProps) {
  if (completion.completed) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        className
      )}>
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </span>
    );
  }

  if (completion.progress && completion.progress > 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        className
      )}>
        <Clock className="w-3 h-3" />
        {Math.round(completion.progress)}%
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      'bg-slate-500/20 text-slate-500 border border-slate-500/30',
      className
    )}>
      <Circle className="w-3 h-3" />
      Not started
    </span>
  );
}
