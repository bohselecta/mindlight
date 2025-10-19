/**
 * useAutonomy Hook
 * 
 * Main hook for managing assessment responses and profiles
 */

import { useState, useEffect, useCallback } from 'react';
import { UserResponse, AutonomyProfile, ScoreOutput, ExportedData } from '@/types';
import { calculateScores } from '@/lib/scoring/scoring-engine';
import { createAutonomyStore } from '@/lib/store/autonomy-store';

const store = createAutonomyStore();

export function useResponses(assessmentId: string) {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const data = await store.getResponses(assessmentId);
        setResponses(data);
      } catch (error) {
        console.error('Failed to load responses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [assessmentId]);

  const saveResponse = useCallback(async (response: Omit<UserResponse, 'userId'>) => {
    try {
      const fullResponse: UserResponse = {
        ...response,
        userId: 'default_user'
      };
      
      await store.saveResponse(fullResponse);
      
      // Update local state
      setResponses(prev => {
        const existing = prev.find(r => r.itemId === response.itemId);
        if (existing) {
          return prev.map(r => 
            r.itemId === response.itemId ? fullResponse : r
          );
        }
        return [...prev, fullResponse];
      });
    } catch (error) {
      console.error('Failed to save response:', error);
      throw error;
    }
  }, []);

  return { responses, saveResponse, loading };
}

export function useProfile() {
  const [profile, setProfile] = useState<AutonomyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await store.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = useCallback(async (profileData: AutonomyProfile) => {
    try {
      await store.saveProfile(profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }, []);

  const recalculateProfile = useCallback(async () => {
    try {
      const responses = await store.getAllResponses();
      if (responses.length === 0) return;

      const scoreOutput = calculateScores(responses);
      
      const newProfile: AutonomyProfile = {
        userId: 'default_user',
        scores: {
          ...scoreOutput.scores,
          EH: { raw: 0, ci_lower: 0, ci_upper: 0, ci_width: 0, n_items: 0, alpha: 0 },
          II: { raw: 0, ci_lower: 0, ci_upper: 0, ci_width: 0, n_items: 0, alpha: 0 }
        },
        composite_autonomy: scoreOutput.composite_autonomy,
        interpretation: {
          ...scoreOutput.interpretation,
          EH: 'low' as const,
          II: 'low' as const
        },
        lastUpdated: new Date(),
        version: scoreOutput.version
      };

      await saveProfile(newProfile);
    } catch (error) {
      console.error('Failed to recalculate profile:', error);
      throw error;
    }
  }, [saveProfile]);

  return { profile, saveProfile, recalculateProfile, loading };
}

export function useExport() {
  const exportData = useCallback(async (): Promise<ExportedData> => {
    try {
      return await store.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const exportCSV = useCallback(async (): Promise<string> => {
    try {
      const data = await exportData();
      const { exportScoresCSV } = await import('@/lib/scoring/scoring-engine');
      
      // Generate CSV for the latest profile
      if (data.profiles.length > 0) {
        const latestProfile = data.profiles[data.profiles.length - 1];
        const mockScoreOutput: ScoreOutput = {
          assessmentId: 'export',
          userId: latestProfile.userId,
          timestamp: latestProfile.lastUpdated,
          version: latestProfile.version,
          scores: latestProfile.scores,
          composite_autonomy: latestProfile.composite_autonomy,
          response_integrity: {
            acquiescence_bias: 0,
            straightlining: false,
            completion_time_flag: false,
            attention_check_passed: true
          },
          completion_percentage: 100,
          interpretation: latestProfile.interpretation
        };
        
        return exportScoresCSV(mockScoreOutput);
      }
      
      return 'No profile data available for export';
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }, [exportData]);

  return { exportData, exportCSV };
}

// Combined hook for convenience
export function useAutonomy() {
  return {
    useResponses,
    useProfile,
    useExport,
    userId: () => 'default-user', // For now, return a default user ID
    loading: false // For now, no loading state
  };
}
