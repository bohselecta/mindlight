/**
 * useStreak Hook
 * 
 * Manages streak tracking and milestone detection
 */

import { useState, useEffect, useCallback } from 'react';
import { StreakData } from '@/types';
import { createAutonomyStore } from '@/lib/store/autonomy-store';

const store = createAutonomyStore();

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastActivity: new Date(),
    milestones: {
      seven: false,
      twentyOne: false,
      sixty: false,
      hundred: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      try {
        const data = await store.getStreak();
        setStreak(data);
      } catch (error) {
        console.error('Failed to load streak:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStreak();
  }, []);

  const updateStreak = useCallback(async () => {
    try {
      await store.updateStreak();
      const updatedStreak = await store.getStreak();
      setStreak(updatedStreak);
    } catch (error) {
      console.error('Failed to update streak:', error);
      throw error;
    }
  }, []);

  const getStreakStatus = useCallback(() => {
    const today = new Date();
    const lastActivity = new Date(streak.lastActivity);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return 'current'; // Updated today
    } else if (daysDiff === 1) {
      return 'at_risk'; // Yesterday was last activity
    } else {
      return 'broken'; // Streak broken
    }
  }, [streak.lastActivity]);

  const getNextMilestone = useCallback(() => {
    if (!streak.milestones.seven) return { target: 7, achieved: false };
    if (!streak.milestones.twentyOne) return { target: 21, achieved: false };
    if (!streak.milestones.sixty) return { target: 60, achieved: false };
    if (!streak.milestones.hundred) return { target: 100, achieved: false };
    return { target: null, achieved: true }; // All milestones achieved
  }, [streak.milestones]);

  const getStreakMessage = useCallback(() => {
    const status = getStreakStatus();
    const nextMilestone = getNextMilestone();

    switch (status) {
      case 'current':
        if (nextMilestone.target) {
          return `Keep it up! ${nextMilestone.target - streak.current} days until your next milestone.`;
        }
        return 'Amazing! You\'ve achieved all milestones.';
      
      case 'at_risk':
        return 'Your streak is at risk. Complete a reflection today to keep it alive!';
      
      case 'broken':
        return 'Streak broken. Start fresh and build a new habit!';
      
      default:
        return 'Start your reflection streak today!';
    }
  }, [streak.current, getStreakStatus, getNextMilestone]);

  return {
    streak,
    updateStreak,
    getStreakStatus,
    getNextMilestone,
    getStreakMessage,
    loading
  };
}
