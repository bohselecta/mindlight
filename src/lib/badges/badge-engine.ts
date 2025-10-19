/**
 * Badge Definitions and Logic
 * 
 * Defines 12 badges across different categories:
 * - Streak badges (7, 21, 60, 100 days)
 * - Module completion badges
 * - Reflection badges
 * - Special achievement badges
 */

import { Badge, Milestone, DailyReflection, DisconfirmGame, SchemaReclaim, InfluenceSource, ArgumentFlip, SourceAudit } from '@/types';
import { analyzeAuditPatterns } from '@/lib/scoring/scoring-engine';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'module' | 'reflection' | 'achievement';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  condition: (data: BadgeCheckData) => boolean;
}

export interface BadgeCheckData {
  streak: { current: number; longest: number; milestones: any };
  reflections: DailyReflection[];
  disconfirmGames: DisconfirmGame[];
  schemaReclaims: SchemaReclaim[];
  influenceSources: InfluenceSource[];
  milestones: Milestone[];
  // Phase 3 data
  argumentFlips: ArgumentFlip[];
  sourceAudits: SourceAudit[];
}

export const badgeDefinitions: BadgeDefinition[] = [
  // Streak Badges
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day reflection streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    condition: (data) => data.streak.milestones.seven
  },
  {
    id: 'streak_21',
    name: 'Habit Former',
    description: 'Built a 21-day reflection habit',
    icon: '⚡',
    category: 'streak',
    rarity: 'uncommon',
    condition: (data) => data.streak.milestones.twentyOne
  },
  {
    id: 'streak_60',
    name: 'Mindfulness Master',
    description: 'Sustained 60 days of daily reflection',
    icon: '🧘',
    category: 'streak',
    rarity: 'rare',
    condition: (data) => data.streak.milestones.sixty
  },
  {
    id: 'streak_100',
    name: 'Epistemic Sage',
    description: 'Achieved 100 days of metacognitive practice',
    icon: '👑',
    category: 'streak',
    rarity: 'epic',
    condition: (data) => data.streak.milestones.hundred
  },

  // Module Completion Badges
  {
    id: 'baseline_complete',
    name: 'Self-Aware',
    description: 'Completed the Baseline Mirror assessment',
    icon: '🪞',
    category: 'module',
    rarity: 'common',
    condition: (data) => data.milestones.some(m => m.milestoneType === 'module_complete')
  },
  {
    id: 'disconfirm_master',
    name: 'Falsification Expert',
    description: 'Mastered the Disconfirm Game',
    icon: '🎯',
    category: 'module',
    rarity: 'uncommon',
    condition: (data) => data.disconfirmGames.length >= 3
  },
  {
    id: 'schema_reclaimer',
    name: 'Emotional Regulator',
    description: 'Completed Schema Reclaim sessions',
    icon: '🛡️',
    category: 'module',
    rarity: 'uncommon',
    condition: (data) => data.schemaReclaims.length >= 2
  },
  {
    id: 'source_auditor',
    name: 'Information Detective',
    description: 'Mapped your influence sources',
    icon: '🔍',
    category: 'module',
    rarity: 'uncommon',
    condition: (data) => data.influenceSources.length >= 5
  },

  // Reflection Badges
  {
    id: 'reflection_10',
    name: 'Thoughtful',
    description: 'Completed 10 daily reflections',
    icon: '💭',
    category: 'reflection',
    rarity: 'common',
    condition: (data) => data.reflections.length >= 10
  },
  {
    id: 'insight_hunter',
    name: 'Insight Hunter',
    description: 'Flagged 5 insightful reflections',
    icon: '💡',
    category: 'reflection',
    rarity: 'uncommon',
    condition: (data) => data.reflections.filter(r => r.insightFlagged).length >= 5
  },

  // Special Achievement Badges
  {
    id: 'balanced_mind',
    name: 'Balanced Mind',
    description: 'Achieved balanced scores across all constructs',
    icon: '⚖️',
    category: 'achievement',
    rarity: 'rare',
    condition: (data) => {
      // This would need access to user profile scores
      // For now, return false as placeholder
      return false;
    }
  },
  {
    id: 'epistemic_autonomy',
    name: 'Epistemic Autonomy',
    description: 'Completed all modules and achieved high metacognitive awareness',
    icon: '🌟',
    category: 'achievement',
    rarity: 'epic',
    condition: (data) => {
      const hasAllModules = data.disconfirmGames.length > 0 && 
                           data.schemaReclaims.length > 0 && 
                           data.influenceSources.length > 0;
      const hasReflections = data.reflections.length >= 20;
      const hasLongStreak = data.streak.longest >= 30;
      
      return hasAllModules && hasReflections && hasLongStreak;
    }
  },

  // Phase 3 Badges
  {
    id: 'steelman_initiate',
    name: 'Steelman Initiate',
    description: 'Completed first Argument Flip with 60+ charity score',
    icon: '⚖️',
    category: 'module',
    rarity: 'common',
    condition: (data) => {
      return data.argumentFlips.some(f => f.charityScore >= 60);
    }
  },
  {
    id: 'intellectual_honesty',
    name: 'Intellectual Honesty',
    description: 'Completed 5 Argument Flips with 70+ average charity',
    icon: '🎯',
    category: 'achievement',
    rarity: 'rare',
    condition: (data) => {
      const flips = data.argumentFlips;
      if (flips.length < 5) return false;
      const avgCharity = flips.reduce((sum, f) => sum + f.charityScore, 0) / flips.length;
      return avgCharity >= 70;
    }
  },
  {
    id: 'source_detective',
    name: 'Source Detective',
    description: 'Completed 7 consecutive days of Source Audits',
    icon: '🔍',
    category: 'module',
    rarity: 'common',
    condition: (data) => {
      return data.sourceAudits.length >= 7;
    }
  },
  {
    id: 'independent_thinker',
    name: 'Independent Thinker',
    description: 'Low source dependency + high evidence checking (II > 75)',
    icon: '🦅',
    category: 'achievement',
    rarity: 'epic',
    condition: (data) => {
      const audits = data.sourceAudits;
      if (audits.length < 14) return false;
      
      // Calculate II score from patterns
      const patterns = analyzeAuditPatterns(audits);
      let score = 100;
      
      if (patterns.dependencyLevel === 'high') score -= 30;
      else if (patterns.dependencyLevel === 'moderate') score -= 15;
      
      score -= patterns.evidenceGaps * 0.5;
      
      const uniqueBeneficiaries = new Set(patterns.beneficiaryPatterns).size;
      if (uniqueBeneficiaries >= 3) score += 5;
      
      return Math.max(0, Math.min(100, Math.round(score))) > 75;
    }
  }
];

export class BadgeEngine {
  static async checkAndUnlockBadges(
    userId: string,
    store: any,
    newlyUnlocked: string[] = []
  ): Promise<Badge[]> {
    // Gather all user data
    const [
      streak,
      reflections,
      disconfirmGames,
      schemaReclaims,
      influenceSources,
      milestones,
      argumentFlips,
      sourceAudits,
      existingBadges
    ] = await Promise.all([
      store.getStreak(),
      store.getDailyReflections(userId),
      store.getDisconfirmGames(userId),
      store.getSchemaReclaims(userId),
      store.getInfluenceSources(userId),
      store.getMilestones(userId),
      store.getArgumentFlips(userId),
      store.getSourceAudits(userId),
      store.getBadges(userId)
    ]);

    const badgeCheckData: BadgeCheckData = {
      streak,
      reflections,
      disconfirmGames,
      schemaReclaims,
      influenceSources,
      milestones,
      argumentFlips,
      sourceAudits
    };

    const unlockedBadges: Badge[] = [];
    const existingBadgeIds = new Set(existingBadges.map((b: Badge) => b.badgeId));

    // Check each badge definition
    for (const badgeDef of badgeDefinitions) {
      // Skip if already unlocked
      if (existingBadgeIds.has(badgeDef.id)) continue;

      // Check if condition is met
      if (badgeDef.condition(badgeCheckData)) {
        const badge: Badge = {
          id: crypto.randomUUID(),
          badgeId: badgeDef.id,
          userId,
          name: badgeDef.name,
          description: badgeDef.description,
          unlockedAt: new Date(),
          icon: badgeDef.icon
        };

        await store.unlockBadge(badge);
        unlockedBadges.push(badge);
        newlyUnlocked.push(badgeDef.id);
      }
    }

    return unlockedBadges;
  }

  static getBadgeById(badgeId: string): BadgeDefinition | undefined {
    return badgeDefinitions.find(b => b.id === badgeId);
  }

  static getBadgesByCategory(category: string): BadgeDefinition[] {
    return badgeDefinitions.filter(b => b.category === category);
  }

  static getBadgesByRarity(rarity: string): BadgeDefinition[] {
    return badgeDefinitions.filter(b => b.rarity === rarity);
  }

  static getProgressForBadge(badgeId: string, data: BadgeCheckData): number {
    const badge = this.getBadgeById(badgeId);
    if (!badge) return 0;

    // Calculate progress based on badge type
    switch (badge.category) {
      case 'streak':
        switch (badgeId) {
          case 'streak_7': return Math.min(data.streak.current / 7, 1);
          case 'streak_21': return Math.min(data.streak.current / 21, 1);
          case 'streak_60': return Math.min(data.streak.current / 60, 1);
          case 'streak_100': return Math.min(data.streak.current / 100, 1);
        }
        break;
      
      case 'reflection':
        switch (badgeId) {
          case 'reflection_10': return Math.min(data.reflections.length / 10, 1);
          case 'insight_hunter': 
            const insights = data.reflections.filter(r => r.insightFlagged).length;
            return Math.min(insights / 5, 1);
        }
        break;
      
      case 'module':
        switch (badgeId) {
          case 'disconfirm_master': return Math.min(data.disconfirmGames.length / 3, 1);
          case 'schema_reclaimer': return Math.min(data.schemaReclaims.length / 2, 1);
          case 'source_auditor': return Math.min(data.influenceSources.length / 5, 1);
        }
        break;
    }

    return 0;
  }
}
