/**
 * useModuleCompletion Hook
 * 
 * Tracks completion status for all modules
 */

import { useState, useEffect } from 'react';
import { useAutonomy } from './useAutonomy';
import { autonomyStore } from '@/lib/store/autonomy-store';

export interface ModuleCompletion {
  moduleId: string;
  completed: boolean;
  lastCompleted?: Date;
  progress?: number; // 0-100 for partial completion
}

export function useModuleCompletion() {
  const [completion, setCompletion] = useState<Record<string, ModuleCompletion>>({});
  const [loading, setLoading] = useState(true);
  const { userId } = useAutonomy();

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const user = userId();
        const [
          baselineResponses,
          identityResponses,
          echoResponses,
          disconfirmGames,
          schemaReclaims,
          influenceSources,
          argumentFlips,
          sourceAudits,
          reflections
        ] = await Promise.all([
          autonomyStore.getResponses('baseline'),
          autonomyStore.getResponses('identity'),
          autonomyStore.getResponses('echo'),
          autonomyStore.getDisconfirmGames(user),
          autonomyStore.getSchemaReclaims(user),
          autonomyStore.getInfluenceSources(user),
          autonomyStore.getArgumentFlips(user),
          autonomyStore.getSourceAudits(user),
          autonomyStore.getDailyReflections(user)
        ]);

        const completionData: Record<string, ModuleCompletion> = {
          'baseline': {
            moduleId: 'baseline',
            completed: baselineResponses.length >= 36, // Full assessment
            progress: Math.min((baselineResponses.length / 36) * 100, 100),
            lastCompleted: baselineResponses.length > 0 ? baselineResponses[baselineResponses.length - 1].timestamp : undefined
          },
          'identity': {
            moduleId: 'identity',
            completed: identityResponses.length >= 20, // Full assessment
            progress: Math.min((identityResponses.length / 20) * 100, 100),
            lastCompleted: identityResponses.length > 0 ? identityResponses[identityResponses.length - 1].timestamp : undefined
          },
          'echo': {
            moduleId: 'echo',
            completed: echoResponses.length >= 10, // Minimum rounds
            progress: Math.min((echoResponses.length / 10) * 100, 100),
            lastCompleted: echoResponses.length > 0 ? echoResponses[echoResponses.length - 1].timestamp : undefined
          },
          'disconfirm': {
            moduleId: 'disconfirm',
            completed: disconfirmGames.length >= 3, // Minimum sessions
            progress: Math.min((disconfirmGames.length / 3) * 100, 100),
            lastCompleted: disconfirmGames.length > 0 ? disconfirmGames[disconfirmGames.length - 1].timestamp : undefined
          },
          'schema': {
            moduleId: 'schema',
            completed: schemaReclaims.length >= 3, // Minimum sessions
            progress: Math.min((schemaReclaims.length / 3) * 100, 100),
            lastCompleted: schemaReclaims.length > 0 ? schemaReclaims[schemaReclaims.length - 1].timestamp : undefined
          },
          'influence': {
            moduleId: 'influence',
            completed: influenceSources.length >= 5, // Minimum sources mapped
            progress: Math.min((influenceSources.length / 5) * 100, 100),
            lastCompleted: influenceSources.length > 0 ? new Date() : undefined // Use current date as fallback
          },
          'argument-flip': {
            moduleId: 'argument-flip',
            completed: argumentFlips.length >= 3, // Minimum sessions
            progress: Math.min((argumentFlips.length / 3) * 100, 100),
            lastCompleted: argumentFlips.length > 0 ? argumentFlips[argumentFlips.length - 1].timestamp : undefined
          },
          'source-audit': {
            moduleId: 'source-audit',
            completed: sourceAudits.length >= 7, // Minimum week of entries
            progress: Math.min((sourceAudits.length / 7) * 100, 100),
            lastCompleted: sourceAudits.length > 0 ? sourceAudits[sourceAudits.length - 1].date : undefined
          },
          'reflect': {
            moduleId: 'reflect',
            completed: reflections.length >= 7, // Minimum week of entries
            progress: Math.min((reflections.length / 7) * 100, 100),
            lastCompleted: reflections.length > 0 ? reflections[reflections.length - 1].date : undefined
          }
        };

        setCompletion(completionData);
      } catch (error) {
        console.error('Failed to check module completion:', error);
        setCompletion({});
      } finally {
        setLoading(false);
      }
    };

    checkCompletion();
  }, [userId]);

  const getCompletionStatus = (moduleId: string): ModuleCompletion => {
    return completion[moduleId] || {
      moduleId,
      completed: false,
      progress: 0
    };
  };

  const getCompletionCount = (): number => {
    return Object.values(completion).filter(m => m.completed).length;
  };

  const getTotalModules = (): number => {
    return Object.keys(completion).length;
  };

  return {
    completion,
    loading,
    getCompletionStatus,
    getCompletionCount,
    getTotalModules
  };
}
