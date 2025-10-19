/**
 * ConstructRadar Component
 * 
 * 4-axis radar chart showing EAI, RF, SA, ARD scores
 */

import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ConstructScore, Construct } from '@/types';
import { cn } from '@/lib/utils';

interface ConstructRadarProps {
  scores: Record<Construct, ConstructScore>;
  className?: string;
  animated?: boolean;
}

const constructLabels = {
  EAI: 'Epistemic Autonomy',
  RF: 'Reflective Flexibility', 
  SA: 'Source Awareness',
  ARD: 'Affect Regulation'
};

const constructColors = {
  EAI: '#3b82f6', // blue
  RF: '#8b5cf6',  // violet
  SA: '#10b981',  // emerald
  ARD: '#f59e0b'  // amber
};

export function ConstructRadar({ scores, className, animated = true }: ConstructRadarProps) {
  const [displayScores, setDisplayScores] = useState<Record<Construct, number>>({
    EAI: 0,
    RF: 0,
    SA: 0,
    ARD: 0
  });

  // Animate scores on mount
  useEffect(() => {
    if (!animated) {
      setDisplayScores({
        EAI: scores.EAI.raw,
        RF: scores.RF.raw,
        SA: scores.SA.raw,
        ARD: scores.ARD.raw
      });
      return;
    }

    const duration = 1000; // 1 second
    const steps = 60;
    const stepDuration = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setDisplayScores({
        EAI: Math.round(scores.EAI.raw * progress),
        RF: Math.round(scores.RF.raw * progress),
        SA: Math.round(scores.SA.raw * progress),
        ARD: Math.round(scores.ARD.raw * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [scores, animated]);

  const data = [
    {
      construct: 'EAI',
      score: displayScores.EAI,
      fullMark: 100
    },
    {
      construct: 'RF', 
      score: displayScores.RF,
      fullMark: 100
    },
    {
      construct: 'SA',
      score: displayScores.SA,
      fullMark: 100
    },
    {
      construct: 'ARD',
      score: displayScores.ARD,
      fullMark: 100
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis 
              dataKey="construct" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => constructLabels[value as Construct]}
            />
            <PolarRadiusAxis 
              angle={0} 
              domain={[0, 100]} 
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Legend */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(displayScores).map(([construct, score]) => {
          const constructKey = construct as Construct;
          const interpretation = scores[constructKey].raw >= 70 ? 'high' : 
                               scores[constructKey].raw >= 40 ? 'moderate' : 'low';
          
          const colorClasses = {
            high: 'text-emerald-400',
            moderate: 'text-blue-400', 
            low: 'text-amber-400'
          };

          return (
            <div key={construct} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: constructColors[constructKey] }}
                />
                <span className="text-sm text-slate-300">
                  {constructLabels[constructKey]}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-medium ${colorClasses[interpretation]}`}>
                  {score}
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {interpretation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
