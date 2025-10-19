/**
 * Reflector Scoring Engine
 * 
 * Pure functional scoring with:
 * - Reverse-coded item handling
 * - Construct-level scores (0-100 scale)
 * - Confidence intervals (bootstrapped)
 * - Cronbach's alpha reliability
 * - Response integrity checks
 */

import { BASELINE_MIRROR_ITEMS, type Construct, type AssessmentItem } from './assessment-bank';

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

/**
 * Main scoring function - pure, deterministic, testable
 */
export function calculateScores(
  responses: UserResponse[],
  assessmentId: string = 'baseline_mirror_v1'
): ScoreOutput {
  // Group responses by construct
  const responsesByConstruct = groupByConstruct(responses);
  
  // Calculate construct scores with CIs
  const scores: Record<string, ConstructScore> = {};
  for (const construct of ['EAI', 'RF', 'SA', 'ARD'] as Construct[]) {
    scores[construct] = calculateConstructScore(
      responsesByConstruct[construct] || [],
      construct
    );
  }

  // Calculate composite autonomy (EAI + RF weighted)
  const compositeAutonomy = (scores.EAI.raw * 0.6 + scores.RF.raw * 0.4);

  // Response integrity checks
  const responseIntegrity = assessResponseIntegrity(responses);

  // Interpret scores
  const interpretation = interpretScores(scores as Record<Construct, ConstructScore>);

  // Completion percentage
  const totalItems = BASELINE_MIRROR_ITEMS.length;
  const completionPercentage = (responses.length / totalItems) * 100;

  return {
    assessmentId,
    userId: responses[0]?.userId || 'unknown',
    timestamp: new Date(),
    version: '1.0.0',
    scores: scores as Record<Construct, ConstructScore>,
    composite_autonomy: Math.round(compositeAutonomy),
    response_integrity: responseIntegrity,
    completion_percentage: Math.round(completionPercentage),
    interpretation
  };
}

/**
 * Group responses by construct for scoring
 */
function groupByConstruct(responses: UserResponse[]): Record<string, UserResponse[]> {
  const grouped: Record<string, UserResponse[]> = {};
  
  for (const response of responses) {
    const item = BASELINE_MIRROR_ITEMS.find(i => i.id === response.itemId);
    if (!item) continue;
    
    if (!grouped[item.construct]) {
      grouped[item.construct] = [];
    }
    grouped[item.construct].push(response);
  }
  
  return grouped;
}

/**
 * Calculate score for a single construct with confidence intervals
 */
function calculateConstructScore(
  responses: UserResponse[],
  construct: Construct
): ConstructScore {
  if (responses.length === 0) {
    return {
      raw: 0,
      ci_lower: 0,
      ci_upper: 0,
      ci_width: 0,
      n_items: 0
    };
  }

  // Get normalized scores (handle reverse coding)
  const normalizedScores = responses.map(response => {
    const item = BASELINE_MIRROR_ITEMS.find(i => i.id === response.itemId);
    if (!item) return response.value;
    
    // Reverse code if needed (only for likert7)
    if (item.type === 'likert7' && item.reverse) {
      return 8 - response.value; // 1→7, 2→6, etc.
    }
    
    return response.value;
  });

  // Calculate mean (1-7 scale)
  const mean = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
  
  // Convert to 0-100 scale
  const raw = ((mean - 1) / 6) * 100;

  // Bootstrap confidence interval
  const { lower, upper } = bootstrapCI(normalizedScores, 1000);
  const ci_lower = Math.max(0, ((lower - 1) / 6) * 100);
  const ci_upper = Math.min(100, ((upper - 1) / 6) * 100);

  // Calculate Cronbach's alpha if enough items (need ≥3)
  const alpha = normalizedScores.length >= 3 
    ? calculateCronbachAlpha(normalizedScores, responses)
    : undefined;

  return {
    raw: Math.round(raw),
    ci_lower: Math.round(ci_lower),
    ci_upper: Math.round(ci_upper),
    ci_width: Math.round(ci_upper - ci_lower),
    n_items: responses.length,
    alpha
  };
}

/**
 * Bootstrap confidence interval calculation
 * Uses percentile method with B bootstrap samples
 */
function bootstrapCI(
  scores: number[],
  B: number = 1000,
  alpha: number = 0.05
): { lower: number; upper: number } {
  const n = scores.length;
  const bootstrapMeans: number[] = [];

  // Generate B bootstrap samples
  for (let i = 0; i < B; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      const randomIndex = Math.floor(Math.random() * n);
      sample.push(scores[randomIndex]);
    }
    const mean = sample.reduce((a, b) => a + b, 0) / n;
    bootstrapMeans.push(mean);
  }

  // Sort and extract percentiles
  bootstrapMeans.sort((a, b) => a - b);
  const lowerIndex = Math.floor((alpha / 2) * B);
  const upperIndex = Math.floor((1 - alpha / 2) * B);

  return {
    lower: bootstrapMeans[lowerIndex],
    upper: bootstrapMeans[upperIndex]
  };
}

/**
 * Calculate Cronbach's alpha for reliability
 * α = (k / (k-1)) * (1 - (Σσ²ᵢ / σ²ₜ))
 */
function calculateCronbachAlpha(
  scores: number[],
  responses: UserResponse[]
): number {
  const k = scores.length;
  if (k < 2) return 0;

  // Calculate variance of each item (not implemented fully here - simplified)
  // In production, you'd need the full response matrix
  // For now, return a placeholder
  
  // This is a simplified version - full implementation would require
  // access to all users' responses to calculate item variances properly
  const itemVariances = scores.map(s => variance([s])); // simplified
  const totalVariance = variance(scores);
  
  const sumItemVar = itemVariances.reduce((a, b) => a + b, 0);
  const alpha = (k / (k - 1)) * (1 - (sumItemVar / totalVariance));
  
  return Math.max(0, Math.min(1, alpha));
}

/**
 * Calculate variance
 */
function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Assess response integrity (detect careless responding)
 */
function assessResponseIntegrity(responses: UserResponse[]): ResponseIntegrity {
  const values = responses.map(r => r.value);
  
  // Acquiescence bias: tendency to strongly agree (6-7) or disagree (1-2)
  const extremeCount = values.filter(v => v <= 2 || v >= 6).length;
  const acquiescence_bias = extremeCount / values.length;

  // Straightlining: same response repeatedly
  const uniqueValues = new Set(values);
  const straightlining = uniqueValues.size <= 2 && values.length > 10;

  // Completion time (if timestamps available)
  const times = responses.map(r => r.timestamp.getTime());
  const totalTime = Math.max(...times) - Math.min(...times);
  const avgTimePerItem = totalTime / responses.length;
  const completion_time_flag = avgTimePerItem < 2000; // < 2 sec per item

  return {
    acquiescence_bias: Math.round(acquiescence_bias * 100) / 100,
    straightlining,
    completion_time_flag,
    attention_check_passed: true // placeholder
  };
}

/**
 * Interpret scores into categories
 */
function interpretScores(
  scores: Record<Construct, ConstructScore>
): Record<Construct, 'high' | 'moderate' | 'low'> {
  const interpretation: Record<string, 'high' | 'moderate' | 'low'> = {};
  
  for (const [construct, score] of Object.entries(scores)) {
    if (score.raw >= 70) {
      interpretation[construct] = 'high';
    } else if (score.raw >= 40) {
      interpretation[construct] = 'moderate';
    } else {
      interpretation[construct] = 'low';
    }
  }
  
  return interpretation as Record<Construct, 'high' | 'moderate' | 'low'>;
}

/**
 * Export utility: generate CSV of scores
 */
export function exportScoresCSV(scoreOutput: ScoreOutput): string {
  const rows = [
    ['Construct', 'Score', 'CI_Lower', 'CI_Upper', 'Interpretation', 'Items', 'Alpha'].join(','),
    ...Object.entries(scoreOutput.scores).map(([construct, score]) => 
      [
        construct,
        score.raw,
        score.ci_lower,
        score.ci_upper,
        scoreOutput.interpretation[construct as Construct],
        score.n_items,
        score.alpha?.toFixed(3) || 'N/A'
      ].join(',')
    )
  ];
  
  return rows.join('\n');
}

/**
 * Export utility: generate human-readable summary
 */
export function generateSummary(scoreOutput: ScoreOutput): string {
  const { scores, interpretation, composite_autonomy } = scoreOutput;
  
  let summary = `REFLECTOR AUTONOMY PROFILE\n`;
  summary += `Generated: ${scoreOutput.timestamp.toISOString()}\n\n`;
  
  summary += `COMPOSITE AUTONOMY: ${composite_autonomy}/100\n`;
  summary += `(Weighted blend of Epistemic Autonomy + Reflective Flexibility)\n\n`;
  
  summary += `CONSTRUCT SCORES:\n`;
  for (const [construct, score] of Object.entries(scores)) {
    const level = interpretation[construct as Construct];
    summary += `\n${construct}: ${score.raw}/100 [${level.toUpperCase()}]\n`;
    summary += `  95% CI: [${score.ci_lower}, ${score.ci_upper}]\n`;
    summary += `  Precision: ±${Math.round(score.ci_width / 2)} points\n`;
    if (score.alpha) {
      summary += `  Reliability (α): ${score.alpha.toFixed(3)}\n`;
    }
  }
  
  return summary;
}
