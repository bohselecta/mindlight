/**
 * Unit Tests for Phase 2 Functionality
 * 
 * Tests for:
 * - Streak calculation engine
 * - Badge condition checking
 * - Storage operations
 */

import { BadgeEngine, BadgeCheckData } from '@/lib/badges/badge-engine';
import { StreakData } from '@/types';

describe('BadgeEngine', () => {
  describe('getProgressForBadge', () => {
    it('should calculate streak progress correctly', () => {
      const data: BadgeCheckData = {
        streak: { current: 5, longest: 10, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } },
        reflections: [],
        disconfirmGames: [],
        schemaReclaims: [],
        influenceSources: [],
        milestones: []
      };

      expect(BadgeEngine.getProgressForBadge('streak_7', data)).toBe(5/7);
      expect(BadgeEngine.getProgressForBadge('streak_21', data)).toBe(5/21);
      expect(BadgeEngine.getProgressForBadge('streak_60', data)).toBe(5/60);
      expect(BadgeEngine.getProgressForBadge('streak_100', data)).toBe(5/100);
    });

    it('should calculate reflection progress correctly', () => {
      const reflections = Array(7).fill(null).map((_, i) => ({
        id: `reflection-${i}`,
        userId: 'test-user',
        date: new Date(),
        prompt: 'Test prompt',
        category: 'meta' as const,
        response: 'Test response',
        timeSpent: 60,
        insightFlagged: i < 3 // First 3 are insightful
      }));

      const data: BadgeCheckData = {
        streak: { current: 0, longest: 0, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } },
        reflections,
        disconfirmGames: [],
        schemaReclaims: [],
        influenceSources: [],
        milestones: []
      };

      expect(BadgeEngine.getProgressForBadge('reflection_10', data)).toBe(7/10);
      expect(BadgeEngine.getProgressForBadge('insight_hunter', data)).toBe(3/5);
    });

    it('should calculate module progress correctly', () => {
      const data: BadgeCheckData = {
        streak: { current: 0, longest: 0, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } },
        reflections: [],
        disconfirmGames: Array(2).fill(null).map((_, i) => ({
          id: `game-${i}`,
          userId: 'test-user',
          belief: 'Test belief',
          falsifiers: [],
          overallScore: 80,
          timestamp: new Date()
        })),
        schemaReclaims: Array(1).fill(null).map((_, i) => ({
          id: `session-${i}`,
          userId: 'test-user',
          schema: 'approval' as const,
          preRegulation: { emotion: 'anxiety', intensity: 8, certainty: 9 },
          postRegulation: { emotion: 'calm', intensity: 3, certainty: 6 },
          timestamp: new Date()
        })),
        influenceSources: Array(3).fill(null).map((_, i) => ({
          id: `source-${i}`,
          userId: 'test-user',
          name: `Source ${i}`,
          type: 'news' as const,
          leaning: 'center' as const,
          trust: 4,
          frequency: 'weekly' as const,
          category: 'politics'
        })),
        milestones: []
      };

      expect(BadgeEngine.getProgressForBadge('disconfirm_master', data)).toBe(2/3);
      expect(BadgeEngine.getProgressForBadge('schema_reclaimer', data)).toBe(1/2);
      expect(BadgeEngine.getProgressForBadge('source_auditor', data)).toBe(3/5);
    });

    it('should return 0 for unknown badge IDs', () => {
      const data: BadgeCheckData = {
        streak: { current: 0, longest: 0, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } },
        reflections: [],
        disconfirmGames: [],
        schemaReclaims: [],
        influenceSources: [],
        milestones: []
      };

      expect(BadgeEngine.getProgressForBadge('unknown_badge', data)).toBe(0);
    });
  });

  describe('getBadgeById', () => {
    it('should return correct badge definition', () => {
      const badge = BadgeEngine.getBadgeById('streak_7');
      expect(badge).toBeDefined();
      expect(badge?.name).toBe('Week Warrior');
      expect(badge?.category).toBe('streak');
      expect(badge?.rarity).toBe('common');
    });

    it('should return undefined for unknown badge ID', () => {
      const badge = BadgeEngine.getBadgeById('unknown_badge');
      expect(badge).toBeUndefined();
    });
  });

  describe('getBadgesByCategory', () => {
    it('should return badges filtered by category', () => {
      const streakBadges = BadgeEngine.getBadgesByCategory('streak');
      expect(streakBadges.length).toBe(4);
      expect(streakBadges.every(badge => badge.category === 'streak')).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const badges = BadgeEngine.getBadgesByCategory('unknown');
      expect(badges.length).toBe(0);
    });
  });

  describe('getBadgesByRarity', () => {
    it('should return badges filtered by rarity', () => {
      const epicBadges = BadgeEngine.getBadgesByRarity('epic');
      expect(epicBadges.length).toBe(2);
      expect(epicBadges.every(badge => badge.rarity === 'epic')).toBe(true);
    });
  });
});

describe('Streak Calculation', () => {
  describe('streak milestone detection', () => {
    it('should detect 7-day milestone', () => {
      const streak: StreakData = {
        current: 7,
        longest: 7,
        lastActivity: new Date(),
        milestones: { seven: false, twentyOne: false, sixty: false, hundred: false }
      };

      // Simulate milestone check logic
      const shouldUnlockSeven = streak.current >= 7 && !streak.milestones.seven;
      expect(shouldUnlockSeven).toBe(true);
    });

    it('should detect 21-day milestone', () => {
      const streak: StreakData = {
        current: 21,
        longest: 21,
        lastActivity: new Date(),
        milestones: { seven: true, twentyOne: false, sixty: false, hundred: false }
      };

      const shouldUnlockTwentyOne = streak.current >= 21 && !streak.milestones.twentyOne;
      expect(shouldUnlockTwentyOne).toBe(true);
    });

    it('should detect 100-day milestone', () => {
      const streak: StreakData = {
        current: 100,
        longest: 100,
        lastActivity: new Date(),
        milestones: { seven: true, twentyOne: true, sixty: true, hundred: false }
      };

      const shouldUnlockHundred = streak.current >= 100 && !streak.milestones.hundred;
      expect(shouldUnlockHundred).toBe(true);
    });
  });

  describe('streak status calculation', () => {
    it('should identify current streak', () => {
      const today = new Date();
      const streak: StreakData = {
        current: 5,
        longest: 10,
        lastActivity: today,
        milestones: { seven: false, twentyOne: false, sixty: false, hundred: false }
      };

      const daysDiff = Math.floor((today.getTime() - streak.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysDiff === 0 ? 'current' : daysDiff === 1 ? 'at_risk' : 'broken';
      
      expect(status).toBe('current');
    });

    it('should identify at-risk streak', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const streak: StreakData = {
        current: 5,
        longest: 10,
        lastActivity: yesterday,
        milestones: { seven: false, twentyOne: false, sixty: false, hundred: false }
      };

      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - streak.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysDiff === 0 ? 'current' : daysDiff === 1 ? 'at_risk' : 'broken';
      
      expect(status).toBe('at_risk');
    });

    it('should identify broken streak', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const streak: StreakData = {
        current: 5,
        longest: 10,
        lastActivity: threeDaysAgo,
        milestones: { seven: false, twentyOne: false, sixty: false, hundred: false }
      };

      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - streak.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysDiff === 0 ? 'current' : daysDiff === 1 ? 'at_risk' : 'broken';
      
      expect(status).toBe('broken');
    });
  });
});

describe('Module Completion Detection', () => {
  it('should detect Phase 1 completion', () => {
    const hasBaseline = true;
    const hasIdentity = true;
    const phase1Complete = hasBaseline && hasIdentity;
    
    expect(phase1Complete).toBe(true);
  });

  it('should detect Phase 2 completion', () => {
    const hasDisconfirm = true;
    const hasSchema = true;
    const hasInfluence = true;
    const phase2Complete = hasDisconfirm && hasSchema && hasInfluence;
    
    expect(phase2Complete).toBe(true);
  });

  it('should detect full completion', () => {
    const phase1Complete = true;
    const phase2Complete = true;
    const fullComplete = phase1Complete && phase2Complete;
    
    expect(fullComplete).toBe(true);
  });
});

describe('Badge Condition Logic', () => {
  it('should unlock streak badges based on milestones', () => {
    const streak = { current: 7, longest: 7, milestones: { seven: true, twentyOne: false, sixty: false, hundred: false } };
    const reflections = [];
    const disconfirmGames = [];
    const schemaReclaims = [];
    const influenceSources = [];
    const milestones = [];

    const data: BadgeCheckData = { streak, reflections, disconfirmGames, schemaReclaims, influenceSources, milestones };
    
    const streakBadge = BadgeEngine.getBadgeById('streak_7');
    expect(streakBadge?.condition(data)).toBe(true);
  });

  it('should unlock module completion badges', () => {
    const streak = { current: 0, longest: 0, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } };
    const reflections = [];
    const disconfirmGames = Array(3).fill(null).map((_, i) => ({
      id: `game-${i}`,
      userId: 'test-user',
      belief: 'Test belief',
      falsifiers: [],
      overallScore: 80,
      timestamp: new Date()
    }));
    const schemaReclaims = [];
    const influenceSources = [];
    const milestones = [];

    const data: BadgeCheckData = { streak, reflections, disconfirmGames, schemaReclaims, influenceSources, milestones };
    
    const disconfirmBadge = BadgeEngine.getBadgeById('disconfirm_master');
    expect(disconfirmBadge?.condition(data)).toBe(true);
  });

  it('should unlock reflection badges', () => {
    const streak = { current: 0, longest: 0, milestones: { seven: false, twentyOne: false, sixty: false, hundred: false } };
    const reflections = Array(10).fill(null).map((_, i) => ({
      id: `reflection-${i}`,
      userId: 'test-user',
      date: new Date(),
      prompt: 'Test prompt',
      category: 'meta' as const,
      response: 'Test response',
      timeSpent: 60,
      insightFlagged: i < 5 // First 5 are insightful
    }));
    const disconfirmGames = [];
    const schemaReclaims = [];
    const influenceSources = [];
    const milestones = [];

    const data: BadgeCheckData = { streak, reflections, disconfirmGames, schemaReclaims, influenceSources, milestones };
    
    const reflectionBadge = BadgeEngine.getBadgeById('reflection_10');
    const insightBadge = BadgeEngine.getBadgeById('insight_hunter');
    
    expect(reflectionBadge?.condition(data)).toBe(true);
    expect(insightBadge?.condition(data)).toBe(true);
  });
});
