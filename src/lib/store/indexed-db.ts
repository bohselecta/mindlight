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
  ExportedData 
} from '@/types';

// Database schema
class ReflectorDB extends Dexie {
  responses!: Table<UserResponse>;
  profiles!: Table<AutonomyProfile>;
  identityProfiles!: Table<IdentityProfile>;
  streaks!: Table<StreakData>;
  metadata!: Table<{ key: string; value: any }>;

  constructor() {
    super('ReflectorDB');
    
    this.version(1).stores({
      responses: '++id, userId, assessmentId, itemId, timestamp',
      profiles: '++id, userId, lastUpdated',
      identityProfiles: '++id, userId, lastUpdated',
      streaks: '++id, userId',
      metadata: 'key'
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
          sixty: false
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
          sixty: false
        }
      };
    }
    
    return {
      ...streak,
      lastActivity: new Date(streak.lastActivity)
    };
  }

  // Export/Import
  async exportData(): Promise<ExportedData> {
    const [responses, profiles, identityProfiles, streaks, metadataRecords] = await Promise.all([
      this.getAllResponses(),
      db.profiles.where('userId').equals(this.userId).toArray(),
      db.identityProfiles.where('userId').equals(this.userId).toArray(),
      db.streaks.where('userId').equals(this.userId).toArray(),
      db.metadata.toArray()
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
      metadata,
      exportedAt: new Date(),
      version: '1.0.0'
    };
  }

  async clearData(): Promise<void> {
    await Promise.all([
      db.responses.where('userId').equals(this.userId).delete(),
      db.profiles.where('userId').equals(this.userId).delete(),
      db.identityProfiles.where('userId').equals(this.userId).delete(),
      db.streaks.where('userId').equals(this.userId).delete(),
      db.metadata.clear()
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
}

// Export singleton instance
export const autonomyStore = new LocalAutonomyStore();
