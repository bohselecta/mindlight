/**
 * Core TypeScript interfaces for Reflector
 */

export type Construct = 'EAI' | 'RF' | 'SA' | 'ARD';

export type ItemType = 'likert7' | 'vignette' | 'forced_choice';

export interface LikertItem {
  id: string;
  construct: Construct;
  type: 'likert7';
  prompt: string;
  reverse: boolean;
  schema_tag?: string; // optional link to schema domain
}

export interface VignetteOption {
  id: string;
  text: string;
  score: number; // 1-7 normalized
  mechanism?: string; // what this choice reveals
}

export interface VignetteItem {
  id: string;
  construct: Construct;
  type: 'vignette';
  prompt: string;
  context?: string;
  options: VignetteOption[];
}

export type AssessmentItem = LikertItem | VignetteItem;

export interface UserResponse {
  userId: string;
  assessmentId: string;
  itemId: string;
  value: number; // 1-7 for Likert, option.score for vignettes
  timestamp: Date;
}

export interface ConstructScore {
  raw: number; // 0-100 scale
  ci_lower: number; // 95% CI lower bound
  ci_upper: number; // 95% CI upper bound
  ci_width: number; // width of CI (precision indicator)
  n_items: number; // number of items in this construct
  alpha?: number; // Cronbach's alpha (if enough items)
}

export interface ScoreOutput {
  assessmentId: string;
  userId: string;
  timestamp: Date;
  version: string;
  scores: Record<Construct, ConstructScore>;
  composite_autonomy: number; // weighted composite of EAI + RF
  response_integrity: ResponseIntegrity;
  completion_percentage: number;
  interpretation: Record<Construct, 'high' | 'moderate' | 'low'>;
}

export interface ResponseIntegrity {
  acquiescence_bias: number; // 0-1, high = extreme agreement tendency
  straightlining: boolean; // repeated same response
  completion_time_flag: boolean; // completed suspiciously fast
  attention_check_passed: boolean; // if attention checks present
}

export interface AutonomyProfile {
  userId: string;
  scores: Record<Construct, ConstructScore>;
  composite_autonomy: number;
  interpretation: Record<Construct, 'high' | 'moderate' | 'low'>;
  lastUpdated: Date;
  version: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: Date;
  milestones: {
    seven: boolean;
    twentyOne: boolean;
    sixty: boolean;
  };
}

export interface ValueCard {
  id: string;
  name: string;
  category: 'care' | 'liberty' | 'loyalty' | 'fairness' | 'sanctity' | 'other';
}

export interface TribeExpectation {
  valueId: string;
  expects: boolean; // true = tribe expects this value
}

export interface IdentityProfile {
  userId: string;
  personalValues: string[]; // selected value IDs
  tribeExpectations: Record<string, boolean>; // valueId -> expects
  drift: {
    aligned: number;
    divergent: number;
    total: number;
  };
  lastUpdated: Date;
}

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
  
  // Export/Import
  exportData(): Promise<ExportedData>;
  clearData(): Promise<void>;
  
  // Metadata
  getMetadata(): Promise<Record<string, any>>;
  setMetadata(key: string, value: any): Promise<void>;
}

export interface ExportedData {
  responses: UserResponse[];
  profiles: AutonomyProfile[];
  identityProfiles: IdentityProfile[];
  streaks: StreakData[];
  metadata: Record<string, any>;
  exportedAt: Date;
  version: string;
}

export interface ProgressData {
  historicalScores: Array<{
    date: Date;
    scores: Record<Construct, number>;
    composite: number;
  }>;
  trends: Record<Construct, 'improving' | 'stable' | 'declining'>;
  ahaMoments: Array<{
    id: string;
    timestamp: Date;
    module: string;
    description: string;
  }>;
}

export interface EchoLoopResult {
  userId: string;
  completedAt: Date;
  rounds: Array<{
    headlinePair: [string, string];
    selectedIndex: number;
    reactionTime: number;
    emotionalTrigger: boolean;
  }>;
  metrics: {
    emotionalBiasPercentage: number;
    averageReactionTime: number;
    selfAwarenessScore: number;
  };
}

export interface PromptVariant {
  variant: 'curiosity' | 'autonomy' | 'control';
  onboarding: string;
  assessmentIntro: string;
  reflectionPrompt: string;
  insightReveal: string;
  nextSteps: string;
}

export interface ABTestEvent {
  userId: string;
  variant: PromptVariant['variant'];
  eventType: 'started' | 'completed' | 'aha_flagged' | 'next_module' | 'abandoned';
  timestamp: Date;
  metadata?: Record<string, any>;
}
