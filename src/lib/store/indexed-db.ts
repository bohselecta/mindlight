/**
 * IndexedDB Storage Implementation using Dexie
 * 
 * Implements the AutonomyStore interface for local-first data persistence
 */

import Dexie, { Table } from 'dexie';
import { 
  AutonomyStore, 
  UserResponse, 
  AutonomyProfile, 
  IdentityProfile, 
  StreakData, 
  ExportedData,
  DisconfirmGame,
  SchemaReclaim,
  InfluenceSource,
  DailyReflection,
  Badge,
  Milestone,
  ArgumentFlip,
  SourceAudit
} from '@/types';
import { BadgeEngine } from '@/lib/badges/badge-engine';

// Database schema
class ReflectorDB extends Dexie {
  responses!: Table<UserResponse>;
  profiles!: Table<AutonomyProfile>;
  identityProfiles!: Table<IdentityProfile>;
  streaks!: Table<StreakData>;
  metadata!: Table<{ key: string; value: any }>;
  // Phase 2 tables
  disconfirmGames!: Table<DisconfirmGame>;
  schemaReclaims!: Table<SchemaReclaim>;
  influenceSources!: Table<InfluenceSource>;
  dailyReflections!: Table<DailyReflection>;
  badges!: Table<Badge>;
  milestones!: Table<Milestone>;
  // Phase 3 tables
  argumentFlips!: Table<ArgumentFlip>;
  sourceAudits!: Table<SourceAudit>;

  constructor() {
    super('ReflectorDB');
    
    this.version(1).stores({
      responses: '++id, userId, assessmentId, itemId, timestamp',
      profiles: '++id, userId, lastUpdated',
      identityProfiles: '++id, userId, lastUpdated',
      streaks: '++id, userId',
      metadata: 'key'
    });

    // Phase 2 schema migration
    this.version(2).stores({
      responses: '++id, userId, assessmentId, itemId, timestamp',
      profiles: '++id, userId, lastUpdated',
      identityProfiles: '++id, userId, lastUpdated',
      streaks: '++id, userId',
      metadata: 'key',
      // Phase 2 tables
      disconfirmGames: '++id, userId, timestamp, belief',
      schemaReclaims: '++id, userId, timestamp, schema',
      influenceSources: '++id, userId, name, type, category',
      dailyReflections: '++id, userId, date, category',
      badges: '++id, userId, badgeId, unlockedAt',
      milestones: '++id, userId, milestoneType, achievedAt'
    });

    // Phase 3 schema migration
    this.version(3).stores({
      responses: '++id, userId, assessmentId, itemId, timestamp',
      profiles: '++id, userId, lastUpdated',
      identityProfiles: '++id, userId, lastUpdated',
      streaks: '++id, userId',
      metadata: 'key',
      // Phase 2 tables
      disconfirmGames: '++id, userId, timestamp, belief',
      schemaReclaims: '++id, userId, timestamp, schema',
      influenceSources: '++id, userId, name, type, category',
      dailyReflections: '++id, userId, date, category',
      badges: '++id, userId, badgeId, unlockedAt',
      milestones: '++id, userId, milestoneType, achievedAt',
      // Phase 3 tables
      argumentFlips: '++id, userId, timestamp, userBelief',
      sourceAudits: '++id, userId, date, belief'
    });
  }
}

const db = new ReflectorDB();

export class LocalAutonomyStore implements AutonomyStore {
  private userId: string;

  constructor(userId: string = 'default_user') {
    this.userId = userId;
  }

  // Response management
  async saveResponse(response: UserResponse): Promise<void> {
    await db.responses.add({
      ...response,
      userId: this.userId,
      timestamp: new Date(response.timestamp)
    });
  }

  async getResponses(assessmentId: string): Promise<UserResponse[]> {
    const responses = await db.responses
      .where('userId')
      .equals(this.userId)
      .and(r => r.assessmentId === assessmentId)
      .toArray();
    
    return responses.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }));
  }

  async getAllResponses(): Promise<UserResponse[]> {
    const responses = await db.responses
      .where('userId')
      .equals(this.userId)
      .toArray();
    
    return responses.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }));
  }

  // Profile management
  async saveProfile(profile: AutonomyProfile): Promise<void> {
    await db.profiles.put({
      ...profile,
      userId: this.userId,
      lastUpdated: new Date()
    });
  }

  async getProfile(): Promise<AutonomyProfile | null> {
    const profile = await db.profiles
      .where('userId')
      .equals(this.userId)
      .first();
    
    if (!profile) return null;
    
    return {
      ...profile,
      lastUpdated: new Date(profile.lastUpdated)
    };
  }

  // Identity management
  async saveIdentityProfile(profile: IdentityProfile): Promise<void> {
    await db.identityProfiles.put({
      ...profile,
      userId: this.userId,
      lastUpdated: new Date()
    });
  }

  async getIdentityProfile(): Promise<IdentityProfile | null> {
    const profile = await db.identityProfiles
      .where('userId')
      .equals(this.userId)
      .first();
    
    if (!profile) return null;
    
    return {
      ...profile,
      lastUpdated: new Date(profile.lastUpdated)
    };
  }

  // Streak management
  async updateStreak(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await db.streaks
      .where('userId')
      .equals(this.userId)
      .first();
    
    if (!existing) {
      // First streak
      await db.streaks.add({
        userId: this.userId,
        current: 1,
        longest: 1,
        lastActivity: today,
        milestones: {
          seven: false,
          twentyOne: false,
          sixty: false,
          hundred: false
        }
      });
      return;
    }

    const lastActivity = new Date(existing.lastActivity);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already updated today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      const newCurrent = existing.current + 1;
      const newLongest = Math.max(newCurrent, existing.longest);
      
      // Check milestones
      const milestones = { ...existing.milestones };
      if (newCurrent >= 7 && !milestones.seven) milestones.seven = true;
      if (newCurrent >= 21 && !milestones.twentyOne) milestones.twentyOne = true;
      if (newCurrent >= 60 && !milestones.sixty) milestones.sixty = true;
      if (newCurrent >= 100 && !milestones.hundred) milestones.hundred = true;
      
      await db.streaks.update(existing.id!, {
        current: newCurrent,
        longest: newLongest,
        lastActivity: today,
        milestones
      });
    } else {
      // Streak broken
      await db.streaks.update(existing.id!, {
        current: 1,
        longest: existing.longest,
        lastActivity: today,
        milestones: existing.milestones
      });
    }
  }

  async getStreak(): Promise<StreakData> {
    const streak = await db.streaks
      .where('userId')
      .equals(this.userId)
      .first();
    
    if (!streak) {
      return {
        current: 0,
        longest: 0,
        lastActivity: new Date(),
        milestones: {
          seven: false,
          twentyOne: false,
          sixty: false,
          hundred: false
        }
      };
    }
    
    return {
      ...streak,
      lastActivity: new Date(streak.lastActivity)
    };
  }

  // Phase 2: Badge checking
  async checkBadges(): Promise<Badge[]> {
    return await BadgeEngine.checkAndUnlockBadges(this.userId, this);
  }

  // Phase 2: Milestone tracking
  async checkModuleMilestones(): Promise<void> {
    const userId = this.userId;
    
    // Check if user has completed all Phase 1 modules
    const [responses, identityProfiles] = await Promise.all([
      db.responses.where('userId').equals(userId).toArray(),
      db.identityProfiles.where('userId').equals(userId).first()
    ]);
    
    const baselineComplete = responses.some(r => r.assessmentId === 'baseline-mirror');
    const identityComplete = !!identityProfiles;
    
    // Check if user has completed Phase 2 modules
    const [disconfirmGames, schemaReclaims, influenceSources] = await Promise.all([
      db.disconfirmGames.where('userId').equals(userId).toArray(),
      db.schemaReclaims.where('userId').equals(userId).toArray(),
      db.influenceSources.where('userId').equals(userId).toArray()
    ]);
    
    const phase2Complete = disconfirmGames.length > 0 && schemaReclaims.length > 0 && influenceSources.length > 0;
    
    // Save milestone if all modules completed
    if (baselineComplete && identityComplete && phase2Complete) {
      const milestone: Milestone = {
        id: crypto.randomUUID(),
        userId,
        milestoneType: 'module_complete',
        achievedAt: new Date(),
        metadata: {
          phase1Complete: true,
          phase2Complete: true,
          totalModules: 5
        }
      };
      
      await db.milestones.add(milestone);
    }
  }

  // Export/Import
  async exportData(): Promise<ExportedData> {
    const [
      responses, 
      profiles, 
      identityProfiles, 
      streaks, 
      metadataRecords,
      disconfirmGames,
      schemaReclaims,
      influenceSources,
      dailyReflections,
      badges,
      milestones,
      argumentFlips,
      sourceAudits
    ] = await Promise.all([
      this.getAllResponses(),
      db.profiles.where('userId').equals(this.userId).toArray(),
      db.identityProfiles.where('userId').equals(this.userId).toArray(),
      db.streaks.where('userId').equals(this.userId).toArray(),
      db.metadata.toArray(),
      this.getDisconfirmGames(this.userId),
      this.getSchemaReclaims(this.userId),
      this.getInfluenceSources(this.userId),
      this.getDailyReflections(this.userId),
      this.getBadges(this.userId),
      this.getMilestones(this.userId),
      this.getArgumentFlips(this.userId),
      this.getSourceAudits(this.userId)
    ]);

    const metadata: Record<string, any> = {};
    metadataRecords.forEach(record => {
      metadata[record.key] = record.value;
    });

    return {
      responses,
      profiles: profiles.map(p => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated)
      })),
      identityProfiles: identityProfiles.map(p => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated)
      })),
      streaks: streaks.map(s => ({
        ...s,
        lastActivity: new Date(s.lastActivity)
      })),
      // Phase 2 data
      disconfirmGames,
      schemaReclaims,
      influenceSources,
      dailyReflections,
      badges,
      milestones,
      // Phase 3 data
      argumentFlips,
      sourceAudits,
      metadata,
      exportedAt: new Date(),
      version: '3.0.0'
    };
  }

  async clearData(): Promise<void> {
    await Promise.all([
      db.responses.where('userId').equals(this.userId).delete(),
      db.profiles.where('userId').equals(this.userId).delete(),
      db.identityProfiles.where('userId').equals(this.userId).delete(),
      db.streaks.where('userId').equals(this.userId).delete(),
      db.metadata.clear(),
      // Phase 2 tables
      db.disconfirmGames.where('userId').equals(this.userId).delete(),
      db.schemaReclaims.where('userId').equals(this.userId).delete(),
      db.influenceSources.where('userId').equals(this.userId).delete(),
      db.dailyReflections.where('userId').equals(this.userId).delete(),
      db.badges.where('userId').equals(this.userId).delete(),
      db.milestones.where('userId').equals(this.userId).delete(),
      // Phase 3 tables
      db.argumentFlips.where('userId').equals(this.userId).delete(),
      db.sourceAudits.where('userId').equals(this.userId).delete()
    ]);
  }

  // Metadata
  async getMetadata(): Promise<Record<string, any>> {
    const records = await db.metadata.toArray();
    const metadata: Record<string, any> = {};
    records.forEach(record => {
      metadata[record.key] = record.value;
    });
    return metadata;
  }

  async setMetadata(key: string, value: any): Promise<void> {
    await db.metadata.put({ key, value });
  }

  // Phase 2: Disconfirm Game
  async saveDisconfirmGame(game: DisconfirmGame): Promise<void> {
    await db.disconfirmGames.add({
      ...game,
      userId: this.userId,
      timestamp: new Date(game.timestamp)
    });
  }

  async getDisconfirmGames(userId: string): Promise<DisconfirmGame[]> {
    const games = await db.disconfirmGames
      .where('userId')
      .equals(userId)
      .toArray();
    
    return games.map(g => ({
      ...g,
      timestamp: new Date(g.timestamp)
    }));
  }

  // Phase 2: Schema Reclaim
  async saveSchemaReclaim(session: SchemaReclaim): Promise<void> {
    await db.schemaReclaims.add({
      ...session,
      userId: this.userId,
      timestamp: new Date(session.timestamp)
    });
  }

  async getSchemaReclaims(userId: string): Promise<SchemaReclaim[]> {
    const sessions = await db.schemaReclaims
      .where('userId')
      .equals(userId)
      .toArray();
    
    return sessions.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
  }

  // Phase 2: Influence Map
  async saveInfluenceSource(source: InfluenceSource): Promise<void> {
    await db.influenceSources.add({
      ...source,
      userId: this.userId
    });
  }

  async getInfluenceSources(userId: string): Promise<InfluenceSource[]> {
    return db.influenceSources
      .where('userId')
      .equals(userId)
      .toArray();
  }

  // Phase 2: Daily Reflections
  async saveDailyReflection(reflection: DailyReflection): Promise<void> {
    await db.dailyReflections.add({
      ...reflection,
      userId: this.userId,
      date: new Date(reflection.date)
    });
  }

  async getDailyReflections(userId: string): Promise<DailyReflection[]> {
    const reflections = await db.dailyReflections
      .where('userId')
      .equals(userId)
      .toArray();
    
    return reflections.map(r => ({
      ...r,
      date: new Date(r.date)
    }));
  }

  // Phase 2: Badges
  async unlockBadge(badge: Badge): Promise<void> {
    await db.badges.add({
      ...badge,
      userId: this.userId,
      unlockedAt: new Date(badge.unlockedAt)
    });
  }

  async getBadges(userId: string): Promise<Badge[]> {
    const badges = await db.badges
      .where('userId')
      .equals(userId)
      .toArray();
    
    return badges.map(b => ({
      ...b,
      unlockedAt: new Date(b.unlockedAt)
    }));
  }

  // Phase 2: Milestones
  async saveMilestone(milestone: Milestone): Promise<void> {
    await db.milestones.add({
      ...milestone,
      userId: this.userId,
      achievedAt: new Date(milestone.achievedAt)
    });
  }

  async getMilestones(userId: string): Promise<Milestone[]> {
    const milestones = await db.milestones
      .where('userId')
      .equals(userId)
      .toArray();
    
    return milestones.map(m => ({
      ...m,
      achievedAt: new Date(m.achievedAt)
    }));
  }

  // Phase 3: Argument Flip
  async saveArgumentFlip(flip: ArgumentFlip): Promise<void> {
    await db.argumentFlips.add({
      ...flip,
      userId: this.userId,
      timestamp: new Date(flip.timestamp)
    });
  }

  async getArgumentFlips(userId: string): Promise<ArgumentFlip[]> {
    const flips = await db.argumentFlips
      .where('userId')
      .equals(userId)
      .toArray();
    
    return flips.map(f => ({
      ...f,
      timestamp: new Date(f.timestamp)
    }));
  }

  // Phase 3: Source Audit
  async saveSourceAudit(audit: SourceAudit): Promise<void> {
    await db.sourceAudits.add({
      ...audit,
      userId: this.userId,
      date: new Date(audit.date)
    });
  }

  async getSourceAudits(userId: string): Promise<SourceAudit[]> {
    const audits = await db.sourceAudits
      .where('userId')
      .equals(userId)
      .toArray();
    
    return audits.map(a => ({
      ...a,
      date: new Date(a.date)
    }));
  }
}

// Export singleton instance
export const autonomyStore = new LocalAutonomyStore();
