/**
 * ScoreCard Component
 * 
 * Individual construct display with score, confidence interval, and insights
 */

import React from 'react';
import { ConstructScore, Construct } from '@/types';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  construct: Construct;
  score: ConstructScore;
  interpretation: 'high' | 'moderate' | 'low';
  className?: string;
}

const constructLabels = {
  EAI: 'Epistemic Autonomy Index',
  RF: 'Reflective Flexibility',
  SA: 'Source Awareness', 
  ARD: 'Affect Regulation in Debate',
  EH: 'Epistemic Honesty',
  II: 'Intellectual Independence'
};

const constructDescriptions = {
  EAI: 'Independence in belief formation from external identities and authorities',
  RF: 'Willingness and ability to revise beliefs in light of counter-evidence',
  SA: 'Conscious tracking of information provenance and source diversity',
  ARD: 'Capacity to manage emotional reactivity when beliefs are challenged',
  EH: 'Ability to fairly represent opposing arguments without strawmanning',
  II: 'Source diversity and evidence verification habits'
};

const interpretationStyles = {
  high: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    message: 'Strong independence'
  },
  moderate: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    bar: 'bg-gradient-to-r from-blue-500 to-blue-400',
    message: 'Room to grow'
  },
  low: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    message: 'Opportunity here'
  }
};

export function ScoreCard({ construct, score, interpretation, className }: ScoreCardProps) {
  const styles = interpretationStyles[interpretation];

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-200">
          {constructLabels[construct]}
        </h3>
        <span className={cn('text-sm px-3 py-1 rounded-full border', styles.badge)}>
          {interpretation.charAt(0).toUpperCase() + interpretation.slice(1)}
        </span>
      </div>

      {/* Score Display */}
      <div className="mb-4">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-1000', styles.bar)}
            style={{ width: `${score.raw}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-2xl font-light text-slate-300">{score.raw}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Confidence Interval */}
      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-1">95% Confidence Interval</div>
        <div className="text-sm text-slate-300">
          [{score.ci_lower}, {score.ci_upper}] 
          <span className="text-slate-500 ml-2">
            (±{Math.round(score.ci_width / 2)} points)
          </span>
        </div>
      </div>

      {/* Reliability */}
      {score.alpha && (
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-1">Reliability (α)</div>
          <div className="text-sm text-slate-300">
            {score.alpha.toFixed(3)}
            <span className="text-slate-500 ml-2">
              ({score.n_items} items)
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-slate-400 leading-relaxed">
          {constructDescriptions[construct]}
        </p>
      </div>

      {/* Interpretation Message */}
      <div className="bg-slate-700/30 rounded-xl p-3">
        <p className="text-sm text-slate-300">
          <span className="font-medium">{styles.message}.</span> {' '}
          {interpretation === 'high' && 'You demonstrate strong independence in forming and maintaining beliefs based on evidence rather than social pressure.'}
          {interpretation === 'moderate' && 'You show some autonomy but may defer to group consensus or authority in certain domains.'}
          {interpretation === 'low' && 'Your beliefs are substantially shaped by social identity, authority figures, or group expectations.'}
        </p>
      </div>
    </div>
  );
}
