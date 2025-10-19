/**
 * Integration Tests for Phase 2 Storage Operations
 * 
 * Tests for:
 * - IndexedDB schema migration
 * - Data persistence across Phase 2 modules
 * - Cross-module data queries
 */

import { LocalAutonomyStore } from '@/lib/store/indexed-db';
import { DisconfirmGame, SchemaReclaim, InfluenceSource, DailyReflection, Badge, Milestone } from '@/types';

// Mock Dexie for testing
jest.mock('dexie', () => {
  const mockDb = {
    version: jest.fn().mockReturnThis(),
    stores: jest.fn().mockReturnThis(),
    responses: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      })
    },
    profiles: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    },
    identityProfiles: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    },
    streaks: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      }),
      add: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(1)
    },
    metadata: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    },
    // Phase 2 tables
    disconfirmGames: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    },
    schemaReclaims: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    },
    influenceSources: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    },
    dailyReflections: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    },
    badges: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    },
    milestones: {
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      }),
      add: jest.fn().mockResolvedValue(1)
    }
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockDb),
    Dexie: jest.fn(() => mockDb)
  };
});

describe('Phase 2 Storage Integration', () => {
  let store: LocalAutonomyStore;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    store = new LocalAutonomyStore(testUserId);
  });

  describe('Disconfirm Game Storage', () => {
    it('should save and retrieve disconfirm games', async () => {
      const game: DisconfirmGame = {
        id: 'game-1',
        userId: testUserId,
        belief: 'Climate change is primarily caused by human activity',
        falsifiers: [
          { id: 'f1', text: 'Global temperature data shows cooling trend', specificity: 85 },
          { id: 'f2', text: 'Solar activity correlates with temperature changes', specificity: 70 }
        ],
        overallScore: 75,
        timestamp: new Date()
      };

      await store.saveDisconfirmGame(game);
      const games = await store.getDisconfirmGames(testUserId);
      
      expect(games).toHaveLength(1);
      expect(games[0].belief).toBe(game.belief);
      expect(games[0].falsifiers).toHaveLength(2);
      expect(games[0].overallScore).toBe(75);
    });

    it('should handle multiple disconfirm games per user', async () => {
      const games = [
        {
          id: 'game-1',
          userId: testUserId,
          belief: 'Belief 1',
          falsifiers: [],
          overallScore: 80,
          timestamp: new Date()
        },
        {
          id: 'game-2',
          userId: testUserId,
          belief: 'Belief 2',
          falsifiers: [],
          overallScore: 90,
          timestamp: new Date()
        }
      ];

      for (const game of games) {
        await store.saveDisconfirmGame(game);
      }

      const retrievedGames = await store.getDisconfirmGames(testUserId);
      expect(retrievedGames).toHaveLength(2);
    });
  });

  describe('Schema Reclaim Storage', () => {
    it('should save and retrieve schema reclaim sessions', async () => {
      const session: SchemaReclaim = {
        id: 'session-1',
        userId: testUserId,
        schema: 'approval',
        preRegulation: { emotion: 'anxiety', intensity: 8, certainty: 9 },
        postRegulation: { emotion: 'calm', intensity: 3, certainty: 6 },
        timestamp: new Date()
      };

      await store.saveSchemaReclaim(session);
      const sessions = await store.getSchemaReclaims(testUserId);
      
      expect(sessions).toHaveLength(1);
      expect(sessions[0].schema).toBe('approval');
      expect(sessions[0].preRegulation.intensity).toBe(8);
      expect(sessions[0].postRegulation.intensity).toBe(3);
    });

    it('should handle all schema types', async () => {
      const schemas: Array<SchemaReclaim['schema']> = ['approval', 'dependence', 'punitiveness', 'defectiveness'];
      
      for (const schema of schemas) {
        const session: SchemaReclaim = {
          id: `session-${schema}`,
          userId: testUserId,
          schema,
          preRegulation: { emotion: 'test', intensity: 5, certainty: 7 },
          postRegulation: { emotion: 'test', intensity: 3, certainty: 5 },
          timestamp: new Date()
        };
        await store.saveSchemaReclaim(session);
      }

      const sessions = await store.getSchemaReclaims(testUserId);
      expect(sessions).toHaveLength(4);
      expect(sessions.map(s => s.schema)).toEqual(expect.arrayContaining(schemas));
    });
  });

  describe('Influence Source Storage', () => {
    it('should save and retrieve influence sources', async () => {
      const source: InfluenceSource = {
        id: 'source-1',
        userId: testUserId,
        name: 'The New York Times',
        type: 'news',
        leaning: 'center',
        trust: 7,
        frequency: 'daily',
        category: 'politics'
      };

      await store.saveInfluenceSource(source);
      const sources = await store.getInfluenceSources(testUserId);
      
      expect(sources).toHaveLength(1);
      expect(sources[0].name).toBe('The New York Times');
      expect(sources[0].type).toBe('news');
      expect(sources[0].trust).toBe(7);
    });

    it('should handle different source types and leanings', async () => {
      const sources = [
        { type: 'podcast' as const, leaning: 'left' as const, name: 'Podcast 1' },
        { type: 'news' as const, leaning: 'right' as const, name: 'News 1' },
        { type: 'person' as const, leaning: 'center' as const, name: 'Person 1' },
        { type: 'community' as const, leaning: 'unknown' as const, name: 'Community 1' },
        { type: 'social' as const, leaning: 'left' as const, name: 'Social 1' }
      ];

      for (const sourceData of sources) {
        const source: InfluenceSource = {
          id: `source-${sourceData.name}`,
          userId: testUserId,
          name: sourceData.name,
          type: sourceData.type,
          leaning: sourceData.leaning,
          trust: 5,
          frequency: 'weekly',
          category: 'general'
        };
        await store.saveInfluenceSource(source);
      }

      const retrievedSources = await store.getInfluenceSources(testUserId);
      expect(retrievedSources).toHaveLength(5);
    });
  });

  describe('Daily Reflection Storage', () => {
    it('should save and retrieve daily reflections', async () => {
      const reflection: DailyReflection = {
        id: 'reflection-1',
        userId: testUserId,
        date: new Date(),
        prompt: 'What cognitive pattern did you notice today?',
        category: 'meta',
        response: 'I noticed confirmation bias when reading news articles.',
        timeSpent: 120,
        insightFlagged: true
      };

      await store.saveDailyReflection(reflection);
      const reflections = await store.getDailyReflections(testUserId);
      
      expect(reflections).toHaveLength(1);
      expect(reflections[0].prompt).toBe(reflection.prompt);
      expect(reflections[0].response).toBe(reflection.response);
      expect(reflections[0].insightFlagged).toBe(true);
    });

    it('should handle different reflection categories', async () => {
      const categories: Array<DailyReflection['category']> = ['disconfirm', 'emotion', 'source', 'meta'];
      
      for (const category of categories) {
        const reflection: DailyReflection = {
          id: `reflection-${category}`,
          userId: testUserId,
          date: new Date(),
          prompt: `Test prompt for ${category}`,
          category,
          response: `Test response for ${category}`,
          timeSpent: 60,
          insightFlagged: false
        };
        await store.saveDailyReflection(reflection);
      }

      const reflections = await store.getDailyReflections(testUserId);
      expect(reflections).toHaveLength(4);
      expect(reflections.map(r => r.category)).toEqual(expect.arrayContaining(categories));
    });
  });

  describe('Badge and Milestone Storage', () => {
    it('should save and retrieve badges', async () => {
      const badge: Badge = {
        id: 'badge-1',
        badgeId: 'streak_7',
        userId: testUserId,
        name: 'Week Warrior',
        description: 'Maintained a 7-day reflection streak',
        unlockedAt: new Date(),
        icon: '🔥'
      };

      await store.unlockBadge(badge);
      const badges = await store.getBadges(testUserId);
      
      expect(badges).toHaveLength(1);
      expect(badges[0].name).toBe('Week Warrior');
      expect(badges[0].icon).toBe('🔥');
    });

    it('should save and retrieve milestones', async () => {
      const milestone: Milestone = {
        id: 'milestone-1',
        userId: testUserId,
        milestoneType: 'streak_7',
        achievedAt: new Date(),
        metadata: { streakLength: 7 }
      };

      await store.saveMilestone(milestone);
      const milestones = await store.getMilestones(testUserId);
      
      expect(milestones).toHaveLength(1);
      expect(milestones[0].milestoneType).toBe('streak_7');
      expect(milestones[0].metadata?.streakLength).toBe(7);
    });
  });

  describe('Data Export Integration', () => {
    it('should export all Phase 2 data', async () => {
      // Create sample data
      const game: DisconfirmGame = {
        id: 'game-1',
        userId: testUserId,
        belief: 'Test belief',
        falsifiers: [],
        overallScore: 80,
        timestamp: new Date()
      };

      const session: SchemaReclaim = {
        id: 'session-1',
        userId: testUserId,
        schema: 'approval',
        preRegulation: { emotion: 'anxiety', intensity: 8, certainty: 9 },
        postRegulation: { emotion: 'calm', intensity: 3, certainty: 6 },
        timestamp: new Date()
      };

      const source: InfluenceSource = {
        id: 'source-1',
        userId: testUserId,
        name: 'Test Source',
        type: 'news',
        leaning: 'center',
        trust: 7,
        frequency: 'daily',
        category: 'politics'
      };

      const reflection: DailyReflection = {
        id: 'reflection-1',
        userId: testUserId,
        date: new Date(),
        prompt: 'Test prompt',
        category: 'meta',
        response: 'Test response',
        timeSpent: 60,
        insightFlagged: true
      };

      const badge: Badge = {
        id: 'badge-1',
        badgeId: 'streak_7',
        userId: testUserId,
        name: 'Week Warrior',
        description: '7-day streak',
        unlockedAt: new Date(),
        icon: '🔥'
      };

      // Save all data
      await store.saveDisconfirmGame(game);
      await store.saveSchemaReclaim(session);
      await store.saveInfluenceSource(source);
      await store.saveDailyReflection(reflection);
      await store.unlockBadge(badge);

      // Export data
      const exportedData = await store.exportData();
      
      expect(exportedData.disconfirmGames).toHaveLength(1);
      expect(exportedData.schemaReclaims).toHaveLength(1);
      expect(exportedData.influenceSources).toHaveLength(1);
      expect(exportedData.dailyReflections).toHaveLength(1);
      expect(exportedData.badges).toHaveLength(1);
      expect(exportedData.version).toBe('2.0.0');
    });
  });

  describe('Data Clearing Integration', () => {
    it('should clear all Phase 2 data', async () => {
      // Create and save sample data
      const game: DisconfirmGame = {
        id: 'game-1',
        userId: testUserId,
        belief: 'Test belief',
        falsifiers: [],
        overallScore: 80,
        timestamp: new Date()
      };

      const reflection: DailyReflection = {
        id: 'reflection-1',
        userId: testUserId,
        date: new Date(),
        prompt: 'Test prompt',
        category: 'meta',
        response: 'Test response',
        timeSpent: 60,
        insightFlagged: true
      };

      await store.saveDisconfirmGame(game);
      await store.saveDailyReflection(reflection);

      // Verify data exists
      let games = await store.getDisconfirmGames(testUserId);
      let reflections = await store.getDailyReflections(testUserId);
      expect(games).toHaveLength(1);
      expect(reflections).toHaveLength(1);

      // Clear all data
      await store.clearData();

      // Verify data is cleared
      games = await store.getDisconfirmGames(testUserId);
      reflections = await store.getDailyReflections(testUserId);
      expect(games).toHaveLength(0);
      expect(reflections).toHaveLength(0);
    });
  });
});
