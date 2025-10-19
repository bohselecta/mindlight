/**
 * VennDrift Component
 * 
 * Visual representation of aligned vs divergent values
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface VennDriftProps {
  aligned: number;
  divergent: number;
  total: number;
  className?: string;
}

export function VennDrift({ aligned, divergent, total, className }: VennDriftProps) {
  const alignedPercentage = total > 0 ? (aligned / total) * 100 : 0;
  const divergentPercentage = total > 0 ? (divergent / total) * 100 : 0;
  const overlapPercentage = total > 0 ? Math.min(alignedPercentage, divergentPercentage) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Venn Diagram */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-2 border-slate-600 opacity-30" />
        </div>
        
        {/* Aligned circle */}
        <div 
          className="absolute top-0 left-0 w-32 h-32 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center"
          style={{ 
            transform: `scale(${Math.max(alignedPercentage / 100, 0.3)})`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <span className="text-sm font-medium text-emerald-300">You</span>
        </div>
        
        {/* Divergent circle */}
        <div 
          className="absolute bottom-0 right-0 w-32 h-32 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center"
          style={{ 
            transform: `scale(${Math.max(divergentPercentage / 100, 0.3)})`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <span className="text-sm font-medium text-amber-300">Tribe</span>
        </div>
        
        {/* Overlap indicator */}
        {overlapPercentage > 0 && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-violet-500 bg-violet-500/20 flex items-center justify-center"
            style={{ 
              transform: `translate(-50%, -50%) scale(${Math.max(overlapPercentage / 100, 0.2)})`,
              transition: 'transform 0.5s ease-out'
            }}
          >
            <span className="text-xs font-medium text-violet-300">Both</span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-light text-emerald-400 mb-1">{aligned}</div>
          <div className="text-xs text-slate-400">Aligned Values</div>
          <div className="text-xs text-slate-500">
            {Math.round(alignedPercentage)}% match
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-light text-amber-400 mb-1">{divergent}</div>
          <div className="text-xs text-slate-400">Independent Values</div>
          <div className="text-xs text-slate-500">
            {Math.round(divergentPercentage)}% unique
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-light text-blue-400 mb-1">{total}</div>
          <div className="text-xs text-slate-400">Total Examined</div>
          <div className="text-xs text-slate-500">
            Values selected
          </div>
        </div>
      </div>

      {/* Insight Message */}
      {divergent > 0 && (
        <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/30 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Your personal values diverge from group expectations on <strong>{divergent}</strong> key areas. 
            This suggests you maintain some independent judgment—worth continuing to nurture.
          </p>
        </div>
      )}

      {divergent === 0 && aligned > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-700/30 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Your values align closely with your group's expectations. Consider exploring 
            whether these are truly your values or absorbed from your environment.
          </p>
        </div>
      )}
    </div>
  );
}
