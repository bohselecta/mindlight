/**
 * AutonomyStore Interface Definition
 * 
 * Abstract interface for data storage operations
 * Allows swapping between local and cloud implementations
 */

import { 
  UserResponse, 
  AutonomyProfile, 
  IdentityProfile, 
  StreakData, 
  ExportedData,
  ArgumentFlip,
  SourceAudit,
  Badge,
  DisconfirmGame,
  SchemaReclaim,
  InfluenceSource,
  DailyReflection,
  Milestone
} from '@/types';

export interface AutonomyStore {
  // Response management
  saveResponse(response: UserResponse): Promise<void>;
  getResponses(assessmentId: string): Promise<UserResponse[]>;
  getAllResponses(): Promise<UserResponse[]>;
  
  // Profile management
  saveProfile(profile: AutonomyProfile): Promise<void>;
  getProfile(): Promise<AutonomyProfile | null>;
  
  // Identity management
  saveIdentityProfile(profile: IdentityProfile): Promise<void>;
  getIdentityProfile(): Promise<IdentityProfile | null>;
  
  // Streak management
  updateStreak(): Promise<void>;
  getStreak(): Promise<StreakData>;
  
  // Phase 2: Badge checking
  checkBadges(): Promise<Badge[]>;
  
  // Phase 2: Milestone tracking
  checkModuleMilestones(): Promise<void>;
  
  // Phase 2: Disconfirm Game
  saveDisconfirmGame(game: DisconfirmGame): Promise<void>;
  getDisconfirmGames(userId: string): Promise<DisconfirmGame[]>;
  
  // Phase 2: Schema Reclaim
  saveSchemaReclaim(session: SchemaReclaim): Promise<void>;
  getSchemaReclaims(userId: string): Promise<SchemaReclaim[]>;
  
  // Phase 2: Influence Map
  saveInfluenceSource(source: InfluenceSource): Promise<void>;
  getInfluenceSources(userId: string): Promise<InfluenceSource[]>;
  
  // Phase 2: Daily Reflections
  saveDailyReflection(reflection: DailyReflection): Promise<void>;
  getDailyReflections(userId: string): Promise<DailyReflection[]>;
  
  // Phase 2: Milestones
  saveMilestone(milestone: Milestone): Promise<void>;
  getMilestones(userId: string): Promise<Milestone[]>;
  
  // Phase 3: Argument Flip
  saveArgumentFlip(flip: ArgumentFlip): Promise<void>;
  getArgumentFlips(userId: string): Promise<ArgumentFlip[]>;
  
  // Phase 3: Source Audit
  saveSourceAudit(audit: SourceAudit): Promise<void>;
  getSourceAudits(userId: string): Promise<SourceAudit[]>;
  
  // Export/Import
  exportData(): Promise<ExportedData>;
  clearData(): Promise<void>;
  
  // Metadata
  getMetadata(): Promise<Record<string, any>>;
  setMetadata(key: string, value: any): Promise<void>;
}

// Factory function for creating store instances
export function createAutonomyStore(userId?: string): AutonomyStore {
  // For now, always return local implementation
  // In Phase 2, this could return cloud-synced version
  const { LocalAutonomyStore } = require('./indexed-db');
  return new LocalAutonomyStore(userId);
}

// Default store instance for convenience
export const autonomyStore = createAutonomyStore();
