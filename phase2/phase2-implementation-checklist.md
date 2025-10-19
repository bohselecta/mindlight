# Phase 2: Implementation Checklist
## Build Order & Integration Guide

---

## Week 7-8: Core Modules

### 1. Disconfirm Game ⏱️ 3-4 days

**Files to create:**
```
app/loops/disconfirm/page.tsx                 # Main game component
lib/scoring/falsifiability.ts                 # Specificity scoring engine
components/games/FalsifierInput.tsx           # Text input with hints
types/disconfirm.ts                          # TypeScript interfaces
```

**Key features:**
- [x] Belief entry form
- [x] Multi-falsifier input with specificity scoring
- [x] Linguistic pattern analysis (quantifiable vs vague)
- [x] Results page with feedback
- [x] Save to progress (RF score update)

**Integration points:**
- Scoring engine → Progress Dashboard (RF construct)
- Completion → Daily reflection prompt suggestion
- Low score → Micro-explainer: "Epistemic Humility"

**Testing:**
```typescript
// /lib/scoring/__tests__/falsifiability.test.ts

describe('Falsifiability Scoring', () => {
  it('scores specific falsifiers higher', () => {
    const specific = "If 3+ peer-reviewed studies show X";
    const vague = "If it just feels wrong";
    
    expect(scoreSpecificity(specific)).toBeGreaterThan(70);
    expect(scoreSpecificity(vague)).toBeLessThan(30);
  });
  
  it('detects absolutism patterns', () => {
    const absolute = "Nothing would change my mind";
    expect(scoreSpecificity(absolute)).toBeLessThan(20);
  });
});
```

---

### 2. Schema Reclaim ⏱️ 4-5 days

**Files to create:**
```
app/loops/schema/page.tsx                    # Main module
components/breathing/BoxBreathing.tsx        # 60-sec breathing exercise
lib/scoring/ard-calculator.ts                # ARD improvement tracking
content/schemas/approval-seeking.mdx         # Schema explainers
```

**Key features:**
- [x] Schema selection (4 types)
- [x] Emotion identification (multi-select)
- [x] Pre-regulation belief certainty
- [x] Animated breathing exercise (4-4-4-4 cycle)
- [x] Post-regulation belief re-check
- [x] ARD score calculation

**Integration points:**
- ARD score → Progress Dashboard
- Schema patterns → Daily reflection prompts
- Completion → Badge: "Calm Under Fire" (if ARD > 80)

**Testing:**
```typescript
// /lib/scoring/__tests__/ard-calculator.test.ts

describe('ARD Calculation', () => {
  it('rewards certainty reduction after regulation', () => {
    const result = calculateARD({
      preCertainty: 9,
      postCertainty: 6,
      preIntensity: 8,
      breathingCompleted: true
    });
    
    expect(result.score).toBeGreaterThan(70);
  });
  
  it('handles no change scenarios', () => {
    const result = calculateARD({
      preCertainty: 8,
      postCertainty: 8,
      preIntensity: 5,
      breathingCompleted: true
    });
    
    expect(result.score).toBeLessThan(50);
  });
});
```

---

### 3. Influence Map ⏱️ 5-6 days

**Files to create:**
```
app/mirrors/influence/page.tsx               # Main visualization
components/visualizations/NetworkGraph.tsx   # SVG network renderer
lib/analysis/homophily.ts                   # Diversity scoring
types/sources.ts                            # Source type definitions
```

**Key features:**
- [x] Source input form (name, type, perspective, influence)
- [x] Network visualization (you at center, sources radiating)
- [x] Homophily score calculation
- [x] Diversity metrics (type + ideological)
- [x] Suggestions for bridge sources

**Integration points:**
- SA score → Progress Dashboard
- High homophily (>60%) → Micro-explainer: "Echo Chambers"
- Completion → Badge: "Source Sleuth" (15+ sources)

**Advanced feature:**
```typescript
// Suggest procedurally diverse sources

export function suggestBridgeSources(
  currentSources: Source[]
): Suggestion[] {
  const underrepresented = perspectives.filter(
    p => !currentSources.find(s => s.perspective === p.id)
  );
  
  // Don't suggest partisan sources to fill gaps
  // Suggest neutral/procedural diversity instead
  
  return [
    {
      type: 'academic',
      reason: 'Peer-reviewed research uses different standards than journalism',
      examples: ['Google Scholar alerts', 'Arxiv.org', 'JSTOR']
    },
    {
      type: 'international',
      reason: 'Non-US perspectives reveal domestic blind spots',
      examples: ['BBC', 'Al Jazeera English', 'The Economist']
    }
  ];
}
```

**Testing:**
```typescript
describe('Homophily Detection', () => {
  it('detects echo chambers', () => {
    const sources = [
      { perspective: 'left', ... },
      { perspective: 'left', ... },
      { perspective: 'left', ... },
      { perspective: 'center-left', ... }
    ];
    
    const score = calculateHomophily(sources);
    expect(score).toBeGreaterThan(60);
  });
  
  it('rewards diversity', () => {
    const sources = [
      { perspective: 'left', ... },
      { perspective: 'center', ... },
      { perspective: 'right', ... },
      { perspective: 'non-political', ... }
    ];
    
    const score = calculateHomophily(sources);
    expect(score).toBeLessThan(40);
  });
});
```

---

## Week 9: Retention Infrastructure

### 4. Daily Reflection System ⏱️ 2-3 days

**Files to create:**
```
app/reflect/page.tsx                        # Daily prompt interface
lib/reflections/prompt-engine.ts            # Smart prompt rotation
components/reflection/VoiceInput.tsx        # Optional voice-to-text
lib/storage/reflections-db.ts              # IndexedDB storage
```

**Key features:**
- [x] Daily prompt based on recent activity
- [x] Text entry (with optional voice)
- [x] "Aha moment" flag checkbox
- [x] Streak counter visibility
- [x] Save to local storage

**Prompt rotation logic:**
```typescript
export function selectDailyPrompt(
  history: Reflection[],
  lastModule: string,
  streak: Streak
): string {
  // Milestone prompts override rotation
  if (streak.currentStreak === 7) {
    return "You're 7 days in. What's shifted?";
  }
  
  if (streak.currentStreak === 21) {
    return "Three weeks of reflection. What pattern are you noticing?";
  }
  
  // Follow-up to last module
  if (lastModule === 'disconfirm') {
    return disconfirmPrompts[random()];
  }
  
  // Balance categories (don't repeat same category 3x)
  const recentCategories = history.slice(-3).map(h => h.category);
  if (recentCategories.every(c => c === 'emotion')) {
    return selectFrom(['source', 'disconfirm', 'meta']);
  }
  
  return selectWeightedRandom(allPrompts);
}
```

---

### 5. Streak System ⏱️ 2 days

**Files to create:**
```
lib/gamification/streak-tracker.ts          # Streak calculation
components/streaks/StreakCounter.tsx        # UI component
lib/notifications/streak-reminders.ts       # Push notification logic
```

**Key features:**
- [x] Calculate current/longest streak
- [x] Allow 1 missed day (48hr grace)
- [x] Milestone detection (7/21/60)
- [x] Gentle reminder notifications
- [x] Celebration animations

**Grace period logic:**
```typescript
export function calculateStreak(reflections: Reflection[]): Streak {
  const sorted = reflections.sort((a, b) => b.date - a.date);
  let current = 0;
  let prev = new Date();
  
  for (const r of sorted) {
    const hoursSince = (prev - r.date) / 3600000;
    
    // Allow 1 missed day (48hr window)
    if (hoursSince <= 48) {
      current++;
    } else {
      break;
    }
    
    prev = r.date;
  }
  
  return { current, longest: Math.max(current, getLongest(sorted)) };
}
```

---

### 6. Badge System ⏱️ 1-2 days

**Files to create:**
```
lib/gamification/badges.ts                  # Badge definitions + unlock logic
components/badges/BadgeUnlock.tsx           # Unlock animation
app/badges/page.tsx                        # Badge gallery
```

**Key features:**
- [x] Badge definitions (12 total)
- [x] Unlock conditions
- [x] Unlock animation (confetti + modal)
- [x] Badge gallery (earned + locked)
- [x] Share image generation (optional)

**Badge unlock check:**
```typescript
export function checkBadgeUnlocks(userData: UserData): Badge[] {
  const newlyUnlocked: Badge[] = [];
  
  for (const badge of badges) {
    const alreadyHas = userData.badges.includes(badge.id);
    const meetsCondition = badge.unlockCondition(userData);
    
    if (!alreadyHas && meetsCondition) {
      newlyUnlocked.push(badge);
    }
  }
  
  return newlyUnlocked;
}

// Run after every module completion and reflection save
```

---

## Week 10: Export & Polish

### 7. PDF Export ⏱️ 2-3 days

**Files to create:**
```
lib/export/pdf-generator.ts                 # jsPDF implementation
lib/export/chart-renderer.ts                # Chart.js → image conversion
app/progress/export/route.ts                # Download endpoint
```

**Key features:**
- [x] Multi-page PDF with sections
- [x] Radar chart visualization
- [x] Module history table
- [x] Flagged insights (user-selected)
- [x] Streak/badge summary

**PDF structure:**
```typescript
export async function generateReport(data: UserData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Page 1: Summary + Radar
  addHeader(doc, 'Your Autonomy Report');
  addScoreSummary(doc, data.scores);
  await addRadarChart(doc, data.scores);
  
  // Page 2: Module History
  doc.addPage();
  addModuleHistory(doc, data.moduleHistory);
  
  // Page 3: Key Insights
  doc.addPage();
  addInsights(doc, data.reflections.filter(r => r.insightFlagged));
  
  // Page 4: Badges + Streaks
  doc.addPage();
  addGamificationSummary(doc, data.badges, data.streak);
  
  return doc.output('blob');
}
```

---

### 8. PWA Enhancements ⏱️ 1-2 days

**Files to create/update:**
```
public/manifest.json                        # PWA manifest
public/sw.js                               # Service worker (if custom)
lib/notifications/permission.ts            # Push notification setup
app/install/page.tsx                       # Install prompt
```

**Key features:**
- [x] Install prompt (after 2+ sessions)
- [x] Offline mode (cache critical pages)
- [x] Push notifications (daily reminder)
- [x] App shortcuts (Reflect, Progress)

**Install prompt:**
```typescript
// Show after user has completed 2+ modules

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      trackEvent('pwa_installed');
    }
  };
  
  return { canInstall: !!prompt, install };
}
```

---

## Week 11-12: Testing & Iteration

### 9. Analytics Setup ⏱️ 1 day

**Files to create:**
```
lib/analytics/plausible.ts                 # Privacy-preserving analytics
lib/analytics/events.ts                    # Event schema
```

**Events to track:**
```typescript
export const events = {
  // Engagement
  module_started: { module: string },
  module_completed: { module: string, duration: number },
  module_abandoned: { module: string, stage: string },
  
  // Reflections
  reflection_completed: { category: string },
  insight_flagged: { category: string },
  
  // Scores
  score_improved: { construct: string, delta: number },
  
  // Gamification
  streak_milestone: { days: number },
  badge_unlocked: { badge: string },
  
  // Exports
  data_exported: { format: string },
  
  // PWA
  pwa_installed: {},
  notification_enabled: {}
};
```

**Privacy guarantees:**
- ❌ No raw text from reflections
- ❌ No specific belief statements
- ❌ No source names (only types)
- ✅ Aggregate metrics only
- ✅ No cross-site tracking
- ✅ No user identification

---

### 10. A/B Testing Framework ⏱️ 1 day

**Files to create:**
```
lib/experiments/variant-selector.ts         # Variant assignment
lib/experiments/configs.ts                  # Experiment definitions
hooks/useExperiment.ts                     # React hook
```

**Example experiment:**
```typescript
export const experiments = {
  dailyPromptTone: {
    id: 'daily_prompt_tone_v1',
    variants: ['curiosity', 'autonomy', 'growth'],
    defaultVariant: 'curiosity',
    traffic: 1.0, // 100% in experiment
    
    samples: {
      curiosity: "Curious what shifted today?",
      autonomy: "Notice any outsourced thinking?",
      growth: "What did you learn about your mind?"
    },
    
    metric: 'reflection_completion_rate',
    duration: 14 // days
  }
};

// Usage
const variant = useExperiment('dailyPromptTone');
const prompt = experiments.dailyPromptTone.samples[variant];
```

---

### 11. User Testing ⏱️ Ongoing

**Recruit n=50-100 testers**

**Testing protocol:**
1. **Baseline**: Complete Baseline Mirror
2. **Usage**: Use app for 14 days minimum
3. **Check-ins**: 
   - Day 3 (friction points?)
   - Day 7 (first impressions?)
   - Day 21 (sustained value?)
4. **Post-assessment**: Re-take Baseline to measure EAI change
5. **Interview**: 30-min qualitative feedback

**Questions to ask:**
- "Which module had the biggest impact?"
- "What almost made you quit?"
- "Did you notice any real-world application?"
- "Would you recommend this? To whom?"
- "What's missing?"

**Success metrics:**
- 7-day retention >40%
- 21-day retention >20%
- Pre/post EAI improvement ≥5 points
- NPS ≥30 (promoters minus detractors)

---

## Integration Checklist

### Data Flow Verification

```
✅ Module completion → Score update → Progress Dashboard
✅ Reflection save → Streak update → Badge check → Notification schedule
✅ Score improvement → Badge unlock → Celebration animation
✅ Milestone reached → Special reflection prompt
✅ High homophily → Explainer suggestion
✅ Low RF score → Disconfirm Game recommendation
```

### Cross-Module Navigation

```
Home
├─ Resume last module
├─ Today's reflection prompt
├─ Streak counter (tappable → calendar view)
└─ Suggested next module (based on lowest score)

Module completion
├─ Score update animation
├─ Badge unlock (if triggered)
├─ Related explainer
└─ Next module suggestion
```

### Error States

```typescript
// Handle edge cases

if (userData.reflections.length === 0) {
  // First time: show onboarding
  return <ReflectionOnboarding />;
}

if (streak.currentStreak === 0 && streak.longestStreak > 7) {
  // Lapsed user: welcoming re-engagement
  return <WelcomeBack longestStreak={streak.longestStreak} />;
}

if (calculateScores(userData).EAI < 20 && showedCrisisScreen === false) {
  // Very low autonomy + distress indicators
  return <ResourcesScreen />;
}
```

---

## Launch Readiness Checklist

### Technical

- [ ] All modules functional on mobile (responsive)
- [ ] Offline mode works (PWA)
- [ ] Data export (JSON/CSV/PDF) tested
- [ ] Analytics integration verified
- [ ] A/B testing framework operational
- [ ] Performance: Lighthouse score >90

### Content

- [ ] 8+ micro-explainers published
- [ ] Daily reflection prompts (20+ unique)
- [ ] Badge descriptions finalized
- [ ] Privacy policy clear
- [ ] Crisis resources listed

### UX

- [ ] Onboarding flow (<3 min to first module)
- [ ] Module completion time <10 min each
- [ ] Progress dashboard loads <2 sec
- [ ] Install prompt appears appropriately
- [ ] Notifications are opt-in and respectful

### Research

- [ ] Pre-launch user testing (n≥10)
- [ ] Feedback incorporated
- [ ] Baseline validity confirmed (test-retest reliability)
- [ ] IRB approval (if academic study)

---

## Post-Launch (Week 13+)

### Monitoring

- **Daily**: Check completion rates, drop-off points
- **Weekly**: Review A/B test results, adjust variants
- **Monthly**: Analyze retention cohorts, measure EAI improvement

### Iteration Priorities

1. **Fix friction**: Where do users abandon?
2. **Content expansion**: Add 10+ more explainers
3. **Social proof**: Testimonials, case studies
4. **Academic validation**: Publish findings

### Roadmap Preview (Phase 3)

- Argument Flip module (steelman practice)
- Source Audit journaling
- Cohort comparison (anonymous benchmarking)
- Community features (insight sharing, opt-in)
- API for therapist/coach integration

---

**Phase 2 is now fully specified. Build order, integration points, testing criteria, and launch checklist complete. Ship it. 🚀**
