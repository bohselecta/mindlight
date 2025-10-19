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
  ExportedData 
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
