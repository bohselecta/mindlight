/**
 * useProgress Hook
 * 
 * Manages historical progress tracking and trend analysis
 */

import { useState, useEffect, useCallback } from 'react';
import { ProgressData, Construct, AutonomyProfile } from '@/types';
import { createAutonomyStore } from '@/lib/store/autonomy-store';

const store = createAutonomyStore();

export function useProgress() {
  const [progressData, setProgressData] = useState<ProgressData>({
    historicalScores: [],
    trends: {
      EAI: 'stable',
      RF: 'stable',
      SA: 'stable',
      ARD: 'stable'
    },
    ahaMoments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const profiles = await store.getAllResponses();
        // This would need to be implemented to get historical profiles
        // For now, we'll create mock data structure
        setProgressData({
          historicalScores: [],
          trends: {
            EAI: 'stable',
            RF: 'stable',
            SA: 'stable',
            ARD: 'stable'
          },
          ahaMoments: []
        });
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const addAhaMoment = useCallback(async (description: string, module: string) => {
    try {
      const ahaMoment = {
        id: Date.now().toString(),
        timestamp: new Date(),
        module,
        description
      };

      // In a real implementation, this would be saved to the store
      setProgressData(prev => ({
        ...prev,
        ahaMoments: [...prev.ahaMoments, ahaMoment]
      }));
    } catch (error) {
      console.error('Failed to add aha moment:', error);
      throw error;
    }
  }, []);

  const calculateTrends = useCallback((historicalScores: ProgressData['historicalScores']) => {
    const trends: Record<Construct, 'improving' | 'stable' | 'declining'> = {
      EAI: 'stable',
      RF: 'stable',
      SA: 'stable',
      ARD: 'stable'
    };

    if (historicalScores.length < 2) return trends;

    const constructs: Construct[] = ['EAI', 'RF', 'SA', 'ARD'];
    
    constructs.forEach(construct => {
      const scores = historicalScores.map(h => h.scores[construct]);
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const change = secondAvg - firstAvg;
      
      if (change > 5) {
        trends[construct] = 'improving';
      } else if (change < -5) {
        trends[construct] = 'declining';
      } else {
        trends[construct] = 'stable';
      }
    });

    return trends;
  }, []);

  const getProgressInsights = useCallback(() => {
    const insights: string[] = [];
    
    Object.entries(progressData.trends).forEach(([construct, trend]) => {
      switch (trend) {
        case 'improving':
          insights.push(`Your ${construct} scores are trending upward. Keep up the great work!`);
          break;
        case 'declining':
          insights.push(`Your ${construct} scores have declined recently. Consider focusing on this area.`);
          break;
        case 'stable':
          // No insight for stable trends
          break;
      }
    });

    if (progressData.ahaMoments.length > 0) {
      insights.push(`You've had ${progressData.ahaMoments.length} insight moments. Reflection is working!`);
    }

    return insights;
  }, [progressData]);

  const getSuggestedModule = useCallback((profile: AutonomyProfile | null) => {
    if (!profile) return null;

    const scores = profile.scores;
    const lowestConstruct = Object.entries(scores).reduce((lowest, [construct, score]) => {
      return score.raw < scores[lowest as Construct].raw ? construct : lowest;
    }, 'EAI') as Construct;

    const suggestions = {
      EAI: 'Baseline Mirror',
      RF: 'Disconfirm Practice',
      SA: 'Influence Map',
      ARD: 'Schema Reclaim'
    };

    return {
      construct: lowestConstruct,
      module: suggestions[lowestConstruct],
      score: scores[lowestConstruct].raw,
      message: `Your ${lowestConstruct} score (${scores[lowestConstruct].raw}) suggests focusing on ${suggestions[lowestConstruct]}.`
    };
  }, []);

  return {
    progressData,
    addAhaMoment,
    calculateTrends,
    getProgressInsights,
    getSuggestedModule,
    loading
  };
}
