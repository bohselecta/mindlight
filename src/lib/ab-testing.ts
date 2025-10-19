/**
 * Reflector A/B Testing Framework
 * 
 * Tests different Motivational Interviewing prompt frames:
 * - Curiosity-prime (emphasis on discovery, interest, exploration)
 * - Autonomy-prime (emphasis on choice, independence, self-direction)
 * 
 * Measures:
 * - Completion rates
 * - Self-reported "aha" moments
 * - Time to completion
 * - Follow-through to next module
 */

export type PromptVariant = 'curiosity' | 'autonomy' | 'control';

export interface PromptTemplate {
  variant: PromptVariant;
  onboarding: string;
  assessmentIntro: string;
  reflectionPrompt: string;
  insightReveal: string;
  nextSteps: string;
}

// ============================================
// VARIANT A: Curiosity-Prime
// ============================================

export const CURIOSITY_VARIANT: PromptTemplate = {
  variant: 'curiosity',
  
  onboarding: `
    **Ever wonder where your beliefs actually come from?**
    
    This isn't about changing what you think—it's about discovering *how* you think.
    
    We're going to explore the hidden patterns in how you form opinions. 
    No judgment, just curiosity.
  `,
  
  assessmentIntro: `
    Let's investigate your thinking patterns together.
    
    There are no right or wrong answers—just honest reflections that might 
    surface something interesting you haven't noticed before.
    
    **Ready to explore?**
  `,
  
  reflectionPrompt: `
    Interesting response. Let's dig deeper:
    
    What do you notice about your reaction to this question?
    Does anything surprise you about how quickly (or slowly) you answered?
  `,
  
  insightReveal: `
    Here's what the pattern reveals...
    
    **Curious what this might mean for how you process information?**
    
    [Insight data]
    
    What stands out to you about this?
  `,
  
  nextSteps: `
    You've uncovered some patterns worth exploring.
    
    **Curious to dig deeper?** The next module lets you map where your 
    beliefs actually originate—and you might find some surprises.
  `
};

// ============================================
// VARIANT B: Autonomy-Prime
// ============================================

export const AUTONOMY_VARIANT: PromptTemplate = {
  variant: 'autonomy',
  
  onboarding: `
    **Your mind. Your choices. Your call.**
    
    This tool helps you notice when your thinking might be outsourced 
    to groups, algorithms, or charismatic voices.
    
    We don't tell you what to believe—we help you see when beliefs 
    might not be fully yours. What you do with that is up to you.
  `,
  
  assessmentIntro: `
    Let's establish a baseline for your cognitive independence.
    
    These questions help you measure how much autonomy you maintain 
    in forming beliefs. Only you can answer honestly—and only you 
    decide what to do with the results.
    
    **Take control. Begin when ready.**
  `,
  
  reflectionPrompt: `
    Your response, your interpretation.
    
    How you answered this reveals something about your independence in 
    belief formation. You're in control of whether to explore that further.
  `,
  
  insightReveal: `
    Here's your autonomy profile—no one else's standard, just the data.
    
    **You decide what this means for you.**
    
    [Insight data]
    
    This is your information. Use it however makes sense to you.
  `,
  
  nextSteps: `
    You've measured your baseline. What happens next is your choice.
    
    **Ready to reclaim more autonomy?** The next module maps your 
    influence network—but only if you decide it's worth your time.
  `
};

// ============================================
// VARIANT C: Control (Neutral)
// ============================================

export const CONTROL_VARIANT: PromptTemplate = {
  variant: 'control',
  
  onboarding: `
    **Reflector: Epistemic Autonomy Training**
    
    This assessment helps identify patterns in how you form and maintain beliefs.
    
    The process takes about 10 minutes. Your responses are private and 
    stored locally. You can stop at any time.
  `,
  
  assessmentIntro: `
    The Baseline Mirror consists of 36 items across 4 constructs:
    - Epistemic Autonomy Index (EAI)
    - Reflective Flexibility (RF)
    - Source Awareness (SA)
    - Affect Regulation in Debate (ARD)
    
    Please respond honestly to each item.
  `,
  
  reflectionPrompt: `
    Response recorded. Continue to the next item.
  `,
  
  insightReveal: `
    Assessment complete. Here are your results:
    
    [Insight data]
    
    These scores represent your current levels across measured constructs.
  `,
  
  nextSteps: `
    You have completed the Baseline Mirror assessment.
    
    Additional modules are available to explore specific mechanisms 
    in more detail. Select one to continue.
  `
};

// ============================================
// Variant Assignment & Tracking
// ============================================

export interface ABTestAssignment {
  userId: string;
  variant: PromptVariant;
  assignedAt: Date;
  sessionId: string;
}

export interface ABTestEvent {
  userId: string;
  variant: PromptVariant;
  eventType: 'started' | 'completed' | 'aha_flagged' | 'next_module' | 'abandoned';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ABTestMetrics {
  variant: PromptVariant;
  n_assigned: number;
  completion_rate: number;
  avg_time_to_complete: number; // seconds
  aha_moment_rate: number; // % who flagged insight
  next_module_rate: number; // % who continued to next module
  abandonment_rate: number;
}

/**
 * Assign user to variant (deterministic hash-based)
 */
export function assignVariant(userId: string): PromptVariant {
  // Simple hash to ensure consistent assignment
  const hash = hashString(userId);
  const bucket = hash % 3;
  
  switch (bucket) {
    case 0: return 'curiosity';
    case 1: return 'autonomy';
    case 2: return 'control';
    default: return 'control';
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get variant-specific prompts
 */
export function getPromptTemplate(variant: PromptVariant): PromptTemplate {
  switch (variant) {
    case 'curiosity': return CURIOSITY_VARIANT;
    case 'autonomy': return AUTONOMY_VARIANT;
    case 'control': return CONTROL_VARIANT;
    default: return CONTROL_VARIANT;
  }
}

/**
 * Track A/B test event
 */
export function trackABEvent(event: ABTestEvent): void {
  // In production: send to analytics backend
  // For now: localStorage
  const events = getStoredEvents();
  events.push(event);
  localStorage.setItem('reflector_ab_events', JSON.stringify(events));
}

function getStoredEvents(): ABTestEvent[] {
  const stored = localStorage.getItem('reflector_ab_events');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Calculate metrics by variant
 */
export function calculateABMetrics(): ABTestMetrics[] {
  const events = getStoredEvents();
  const variants = ['curiosity', 'autonomy', 'control'] as PromptVariant[];
  
  return variants.map(variant => {
    const variantEvents = events.filter(e => e.variant === variant);
    const uniqueUsers = new Set(variantEvents.map(e => e.userId));
    const n_assigned = uniqueUsers.size;
    
    if (n_assigned === 0) {
      return {
        variant,
        n_assigned: 0,
        completion_rate: 0,
        avg_time_to_complete: 0,
        aha_moment_rate: 0,
        next_module_rate: 0,
        abandonment_rate: 0
      };
    }
    
    // Calculate completion rate
    const started = variantEvents.filter(e => e.eventType === 'started').length;
    const completed = variantEvents.filter(e => e.eventType === 'completed').length;
    const completion_rate = started > 0 ? (completed / started) * 100 : 0;
    
    // Calculate aha rate
    const ahas = variantEvents.filter(e => e.eventType === 'aha_flagged').length;
    const aha_moment_rate = completed > 0 ? (ahas / completed) * 100 : 0;
    
    // Calculate next module rate
    const nextModule = variantEvents.filter(e => e.eventType === 'next_module').length;
    const next_module_rate = completed > 0 ? (nextModule / completed) * 100 : 0;
    
    // Calculate abandonment
    const abandoned = variantEvents.filter(e => e.eventType === 'abandoned').length;
    const abandonment_rate = started > 0 ? (abandoned / started) * 100 : 0;
    
    // Calculate avg time (simplified - would need start/end timestamps)
    const completedEvents = variantEvents.filter(e => e.eventType === 'completed');
    const times = completedEvents.map(e => e.metadata?.duration || 0);
    const avg_time_to_complete = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
    
    return {
      variant,
      n_assigned,
      completion_rate,
      avg_time_to_complete,
      aha_moment_rate,
      next_module_rate,
      abandonment_rate
    };
  });
}

/**
 * Export metrics as CSV for analysis
 */
export function exportABMetricsCSV(): string {
  const metrics = calculateABMetrics();
  
  const rows = [
    ['Variant', 'N', 'Completion%', 'AvgTime(s)', 'Aha%', 'NextModule%', 'Abandon%'].join(','),
    ...metrics.map(m => [
      m.variant,
      m.n_assigned,
      m.completion_rate.toFixed(1),
      m.avg_time_to_complete.toFixed(0),
      m.aha_moment_rate.toFixed(1),
      m.next_module_rate.toFixed(1),
      m.abandonment_rate.toFixed(1)
    ].join(','))
  ];
  
  return rows.join('\n');
}

// ============================================
// Statistical Significance Testing
// ============================================

/**
 * Run chi-square test for completion rate differences
 * (Simplified - in production use proper stats library)
 */
export function testCompletionRateSignificance(): {
  chi_square: number;
  p_value: number;
  significant: boolean;
} {
  const metrics = calculateABMetrics();
  
  // This is a placeholder - proper implementation would use
  // scipy.stats, jstat, or similar
  
  const observed = metrics.map(m => ({
    completed: Math.round(m.n_assigned * m.completion_rate / 100),
    incomplete: Math.round(m.n_assigned * (1 - m.completion_rate / 100))
  }));
  
  // Chi-square calculation would go here
  // For now, return placeholder
  
  return {
    chi_square: 0,
    p_value: 1,
    significant: false
  };
}
