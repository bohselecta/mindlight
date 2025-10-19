/**
 * Core TypeScript interfaces for Reflector
 */

export type Construct = 'EAI' | 'RF' | 'SA' | 'ARD' | 'EH' | 'II';

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
  // Phase 3 constructs
  EH?: number; // Epistemic Honesty (from Argument Flip)
  II?: number; // Intellectual Independence (from Source Audit)
}

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: Date;
  milestones: {
    seven: boolean;
    twentyOne: boolean;
    sixty: boolean;
    hundred: boolean; // Phase 2 milestone
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
  
  // Phase 2: Badges
  unlockBadge(badge: Badge): Promise<void>;
  getBadges(userId: string): Promise<Badge[]>;
  
  // Phase 2: Milestones
  saveMilestone(milestone: Milestone): Promise<void>;
  getMilestones(userId: string): Promise<Milestone[]>;
  
  // Phase 3: Argument Flip
  saveArgumentFlip(flip: ArgumentFlip): Promise<void>;
  getArgumentFlips(userId: string): Promise<ArgumentFlip[]>;
  
  // Phase 3: Source Audit
  saveSourceAudit(audit: SourceAudit): Promise<void>;
  getSourceAudits(userId: string): Promise<SourceAudit[]>;
  
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

export interface ExportedData {
  responses: UserResponse[];
  profiles: AutonomyProfile[];
  identityProfiles: IdentityProfile[];
  streaks: StreakData[];
  // Phase 2 data
  disconfirmGames: DisconfirmGame[];
  schemaReclaims: SchemaReclaim[];
  influenceSources: InfluenceSource[];
  dailyReflections: DailyReflection[];
  badges: Badge[];
  milestones: Milestone[];
  // Phase 3 data
  argumentFlips: ArgumentFlip[];
  sourceAudits: SourceAudit[];
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

// Phase 2 Types

export interface Falsifier {
  id: string;
  text: string;
  specificity: number; // 0-100, calculated by keyword analysis
}

export interface DisconfirmGame {
  id: string;
  userId: string;
  belief: string;
  falsifiers: Falsifier[];
  overallScore: number;
  timestamp: Date;
}

export interface SchemaReclaim {
  id: string;
  userId: string;
  schema: 'approval' | 'dependence' | 'punitiveness' | 'defectiveness';
  preRegulation: { emotion: string; intensity: number; certainty: number };
  postRegulation: { emotion: string; intensity: number; certainty: number };
  timestamp: Date;
}

export interface InfluenceSource {
  id: string;
  userId: string;
  name: string;
  type: 'podcast' | 'news' | 'person' | 'community' | 'social';
  leaning: 'left' | 'center' | 'right' | 'unknown';
  trust: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: Date;
  prompt: string;
  category: 'disconfirm' | 'emotion' | 'source' | 'meta';
  response: string;
  timeSpent: number;
  insightFlagged: boolean;
}

export interface Badge {
  id: string;
  badgeId: string;
  userId: string;
  name: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

export interface Milestone {
  id: string;
  userId: string;
  milestoneType: 'streak_7' | 'streak_21' | 'streak_60' | 'streak_100' | 'module_complete' | 'badge_unlock';
  achievedAt: Date;
  metadata?: Record<string, any>;
}

// Phase 3 Types

export interface ArgumentFlip {
  id: string;
  userId: string;
  userBelief: string;
  generatedCounter: string;
  userRestatement: string;
  charityScore: number; // 0-100
  accuracyScore: number; // 0-100
  strawmanDetected: boolean;
  missingKeyPoints: string[];
  addedWeakPoints: string[];
  timestamp: Date;
}

export interface SourceAudit {
  id: string;
  userId: string;
  date: Date;
  belief: string;
  firstHeard: string;
  whoHeardFrom: string;
  whenHeardIt: string;
  whoBenefits: string[];
  evidenceChecked: string;
  certaintyBefore: number;
  certaintyAfter: number;
  insightNotes: string;
}
