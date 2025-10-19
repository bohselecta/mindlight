# Phase 2: Integration Guide & Retention Systems

## Overview
Phase 2 adds depth modules (Disconfirm, Schema Reclaim, Influence Map) plus retention infrastructure (streaks, daily reflections, badges, PDF export). This document shows how everything connects.

---

## Architecture: How Modules Connect

```
┌─────────────────────────────────────────────────────────┐
│                    Progress Dashboard                    │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────┐  │
│  │   EAI   │   RF    │   SA    │   ARD   │  Streak  │  │
│  └─────────┴─────────┴─────────┴─────────┴──────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────┴────────┐ ┌──────┴──────┐ ┌───────┴────────┐
│  Disconfirm    │ │   Schema    │ │   Influence    │
│     Game       │ │   Reclaim   │ │      Map       │
│                │ │             │ │                │
│  Updates: RF   │ │ Updates:ARD │ │  Updates: SA   │
└────────────────┘ └─────────────┘ └────────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                  Daily Reflections
```

---

## 1. Daily Reflection System

### Purpose
Micro-journaling prompts (3-5 min) that:
- Maintain engagement between deep modules
- Track real-world application of skills
- Generate qualitative data for insight patterns
- Build habit loops (cue → routine → reward)

### Prompt Categories

#### **Disconfirmation Awareness**
```typescript
const disconfirmPrompts = [
  "Today I noticed myself dismissing an idea because...",
  "One belief I reconsidered this week:",
  "What evidence would change my mind about [recent opinion]?",
  "I caught myself in confirmation bias when..."
];
```

#### **Emotional Regulation**
```typescript
const emotionPrompts = [
  "When my belief was challenged today, I felt:",
  "I practiced emotional distance by:",
  "My certainty about [topic] shifted when...",
  "Schema trigger I noticed: [Approval/Dependence/Punitiveness/Defectiveness]"
];
```

#### **Source Awareness**
```typescript
const sourcePrompts = [
  "Today's strongest opinion came from:",
  "I diversified my information diet by:",
  "I noticed homophily when:",
  "New perspective I explored:"
];
```

#### **Meta-Reflection**
```typescript
const metaPrompts = [
  "This week, I feel [more/less] autonomous because:",
  "One pattern I'm noticing about my thinking:",
  "Progress I'm proud of:",
  "One area to focus on next:"
];
```

### Implementation Pattern

```typescript
// /lib/reflections/prompt-engine.ts

interface DailyReflection {
  id: string;
  date: Date;
  prompt: string;
  category: 'disconfirm' | 'emotion' | 'source' | 'meta';
  response: string;
  timeSpent: number; // seconds
  insightFlagged: boolean;
}

export function getTodaysPrompt(
  userHistory: DailyReflection[],
  recentModules: string[]
): string {
  // Smart rotation based on:
  // 1. Last completed module (relevant follow-up)
  // 2. Least-visited category (ensure balance)
  // 3. Streak context (milestone prompts at 7/21/60)
  
  const lastModule = recentModules[0];
  const lastCategory = userHistory[userHistory.length - 1]?.category;
  
  if (lastModule === 'disconfirm') {
    return selectPrompt(disconfirmPrompts);
  }
  
  // Rotate through underrepresented categories
  const categoryCounts = countCategories(userHistory.slice(-7));
  const leastUsed = Object.entries(categoryCounts)
    .sort((a, b) => a[1] - b[1])[0][0];
    
  return selectPrompt(getPromptsForCategory(leastUsed));
}

function selectPrompt(prompts: string[]): string {
  // Weighted random: prefer prompts not used in last 14 days
  return prompts[Math.floor(Math.random() * prompts.length)];
}
```

### UX Flow

1. **Notification**: Daily at user-selected time (default 8pm)
2. **Quick Entry**: Text area + optional voice-to-text
3. **Insight Flag**: "Was this an aha moment?" checkbox
4. **Streak Acknowledgment**: "+1 day" micro-celebration
5. **Optional Deep Dive**: "Explore this in [relevant module]" CTA

---

## 2. Streak System

### Mechanics

```typescript
// /lib/gamification/streaks.ts

interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActiveDate: Date;
  milestones: number[]; // [7, 21, 60]
}

export function calculateStreak(
  reflections: DailyReflection[]
): Streak {
  // Count consecutive days with at least 1 reflection
  // Reset if >48 hours gap (allows 1 missed day)
  
  const sorted = reflections.sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );
  
  let current = 0;
  let longest = 0;
  let prev = new Date();
  
  for (const reflection of sorted) {
    const gap = daysBetween(reflection.date, prev);
    
    if (gap <= 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
    
    prev = reflection.date;
  }
  
  return {
    currentStreak: current,
    longestStreak: longest,
    totalDays: reflections.length,
    lastActiveDate: sorted[0]?.date || new Date(),
    milestones: [7, 21, 60].filter(m => current >= m)
  };
}
```

### Milestone Celebrations

**7-Day Streak:**
- Badge: "Week of Reflection 🌟"
- Unlock: Argument Flip module
- Message: "You're building metacognitive fitness. Notice any shifts?"

**21-Day Streak:**
- Badge: "Habit Builder 🔥"
- Unlock: Advanced visualizations (radar overlays, delta charts)
- Message: "Neural pathways are forming. This is real change."

**60-Day Streak:**
- Badge: "Autonomy Architect 💎"
- Unlock: Cohort comparison (anonymous, opt-in)
- Message: "You're in the top 5% of users. Export your journey?"

### Smart Notifications

```typescript
// Don't spam. Be encouraging, not guilt-tripping.

export function getStreakNotification(
  streak: Streak,
  lastReflection: Date
): Notification | null {
  const hoursSince = (Date.now() - lastReflection.getTime()) / 3600000;
  
  // Grace period: no nag for first 20 hours
  if (hoursSince < 20) return null;
  
  // Approaching streak break (22-24 hours)
  if (hoursSince > 22 && streak.currentStreak > 3) {
    return {
      title: "Quick reflection to keep your streak?",
      body: `${streak.currentStreak} days and counting.`,
      tone: 'gentle'
    };
  }
  
  // Streak broken (48+ hours)
  if (hoursSince > 48 && streak.currentStreak > 7) {
    return {
      title: "Welcome back",
      body: "Ready to restart your reflection practice?",
      tone: 'welcoming' // NOT punitive
    };
  }
  
  return null;
}
```

---

## 3. Badge System

### Badge Taxonomy

```typescript
// /lib/gamification/badges.ts

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
  unlockCondition: (userData: UserData) => boolean;
}

export const badges: Badge[] = [
  // EPISTEMIC VIRTUE BADGES
  {
    id: 'changed-mind',
    name: 'Changed My Mind',
    description: 'Revised a belief after disconfirm exercise',
    icon: '🔄',
    rarity: 'rare',
    unlockCondition: (data) => 
      data.disconfirmGames.some(g => g.postCertainty < g.preCertainty - 2)
  },
  
  {
    id: 'source-sleuth',
    name: 'Source Sleuth',
    description: 'Mapped 15+ information sources',
    icon: '🔍',
    rarity: 'common',
    unlockCondition: (data) => 
      data.influenceMap?.sources.length >= 15
  },
  
  {
    id: 'steelman-star',
    name: 'Steelman Star',
    description: 'Generated 5 high-quality opposing arguments',
    icon: '⚖️',
    rarity: 'epic',
    unlockCondition: (data) => 
      data.argumentFlips?.filter(a => a.charityScore > 80).length >= 5
  },
  
  {
    id: 'calm-fire',
    name: 'Calm Under Fire',
    description: 'ARD score >80 in Schema Reclaim',
    icon: '🧘',
    rarity: 'rare',
    unlockCondition: (data) => 
      data.schemaReclaims?.some(s => s.ardScore > 80)
  },
  
  // META BADGES
  {
    id: 'polymath',
    name: 'Cognitive Polymath',
    description: 'Completed all core modules',
    icon: '🎓',
    rarity: 'epic',
    unlockCondition: (data) => 
      data.completedModules.includes('baseline', 'identity', 
        'echo', 'disconfirm', 'schema', 'influence')
  },
  
  {
    id: 'streak-7',
    name: 'Week of Reflection',
    description: '7-day reflection streak',
    icon: '🌟',
    rarity: 'common',
    unlockCondition: (data) => data.streak.currentStreak >= 7
  }
];
```

### Badge UX

- **Unlock Animation**: Confetti + sound (subtle)
- **Badge Gallery**: View all earned + locked badges
- **Share**: "I earned [badge]" → generates shareable image (opt-in)
- **No FOMO**: Locked badges show "How to unlock" not "You're missing out"

---

## 4. PDF Export System

### Export Structure

```
┌─────────────────────────────────────────────────┐
│        REFLECTOR: Your Autonomy Report          │
│                [Generated Date]                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Executive Summary                              │
│  • EAI: 68/100 (+12 since baseline)            │
│  • RF: 54/100 (+8)                             │
│  • SA: 45/100 (+18) ← biggest gain             │
│  • ARD: 61/100 (+6)                            │
│                                                 │
│  [Radar Chart Visualization]                    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Module Completions                             │
│  ✓ Baseline Mirror (Jan 15, 2025)             │
│  ✓ Identity Mirror (Jan 16, 2025)             │
│  ✓ Echo-Loop x12 (avg score: 73)              │
│  ✓ Disconfirm Game x5                          │
│  ✓ Schema Reclaim x3                           │
│  ✓ Influence Map (Jan 22, 2025)               │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Notable Insights (User-Flagged)                │
│  • "I realized my political beliefs came       │
│    almost entirely from one podcast."          │
│  • "Noticing approval-seeking schema helped    │
│    me have a calmer debate with my dad."       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Reflection Highlights (Selected Entries)       │
│  [User's best/most insightful reflections]     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Badges Earned: 8                               │
│  Streak: 21 days (current), 28 days (longest)  │
│  Total Reflection Days: 34                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementation

```typescript
// /lib/export/pdf-generator.ts

import { jsPDF } from 'jspdf';
import { Chart } from 'chart.js';

export async function generateAutonomyReport(
  userData: UserData
): Promise<Blob> {
  const doc = new jsPDF();
  
  // Page 1: Summary + Radar
  doc.setFontSize(24);
  doc.text('Your Autonomy Report', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Generate radar chart as image
  const radarImg = await generateRadarChart(userData.scores);
  doc.addImage(radarImg, 'PNG', 20, 40, 170, 170);
  
  // Page 2: Module history
  doc.addPage();
  doc.setFontSize(18);
  doc.text('Module Completions', 20, 20);
  
  userData.moduleHistory.forEach((module, i) => {
    doc.setFontSize(10);
    doc.text(
      `✓ ${module.name} (${module.date.toLocaleDateString()})`,
      20,
      35 + (i * 10)
    );
  });
  
  // Page 3: Flagged insights
  doc.addPage();
  doc.setFontSize(18);
  doc.text('Notable Insights', 20, 20);
  
  const insights = userData.reflections
    .filter(r => r.insightFlagged)
    .slice(0, 10);
    
  insights.forEach((insight, i) => {
    doc.setFontSize(9);
    doc.text(
      `• ${insight.response}`,
      20,
      35 + (i * 15),
      { maxWidth: 170 }
    );
  });
  
  return doc.output('blob');
}
```

---

## 5. Data Layer Updates

### Extend Storage Schema

```typescript
// /lib/store/schema.ts

interface UserData {
  // Existing from Phase 1
  baselineResponses: Response[];
  identityValues: string[];
  echoLoopScores: number[];
  
  // New in Phase 2
  disconfirmGames: DisconfirmGameResult[];
  schemaReclaims: SchemaReclaimResult[];
  influenceMap: {
    sources: Source[];
    lastUpdated: Date;
  };
  reflections: DailyReflection[];
  streak: Streak;
  badges: string[]; // Array of earned badge IDs
  
  // Derived/Computed
  scores: {
    EAI: ScoreHistory;
    RF: ScoreHistory;
    SA: ScoreHistory;
    ARD: ScoreHistory;
  };
}

interface ScoreHistory {
  current: number;
  baseline: number;
  delta: number;
  trend: DataPoint[]; // Over time
  confidenceInterval: number;
}
```

### Score Aggregation Logic

```typescript
// /lib/scoring/aggregator.ts

export function aggregateScores(userData: UserData): Scores {
  // EAI: Baseline + Identity exercises
  const eai = calculateEAI(
    userData.baselineResponses,
    userData.identityValues
  );
  
  // RF: Disconfirm Game performance
  const rf = calculateRF(
    userData.disconfirmGames,
    userData.reflections.filter(r => r.category === 'disconfirm')
  );
  
  // SA: Influence Map + Source Audit
  const sa = calculateSA(
    userData.influenceMap,
    userData.reflections.filter(r => r.category === 'source')
  );
  
  // ARD: Schema Reclaim results
  const ard = calculateARD(
    userData.schemaReclaims,
    userData.reflections.filter(r => r.category === 'emotion')
  );
  
  return { EAI: eai, RF: rf, SA: sa, ARD: ard };
}
```

---

## 6. Phase 2 Navigation Flow

```
Home
├─ Today's Prompt (Daily Reflection)
├─ Streak Counter
├─ Quick Resume (last uncompleted module)
└─ Module Grid
   ├─ Mirrors
   │  ├─ Baseline ✓
   │  └─ Identity ✓
   ├─ Games/Loops
   │  ├─ Echo-Loop ✓
   │  ├─ Disconfirm 🆕
   │  └─ Argument Flip 🔒 (unlock at 7-day streak)
   ├─ Deep Dives
   │  ├─ Schema Reclaim 🆕
   │  └─ Influence Map 🆕
   ├─ Progress
   │  ├─ Dashboard
   │  ├─ Trends
   │  └─ Export PDF
   └─ Settings
      ├─ Notification Schedule
      ├─ Data Export (JSON/CSV)
      └─ Privacy
```

---

## 7. A/B Testing Framework

### Experiments to Run

```typescript
// /lib/experiments/variants.ts

export const experiments = {
  'daily-prompt-tone': {
    variants: ['curiosity', 'autonomy', 'growth'],
    metric: 'completionRate',
    samples: {
      curiosity: "Curious what shifted today?",
      autonomy: "Notice any outsourced thinking?",
      growth: "What did you learn about your mind?"
    }
  },
  
  'streak-celebration': {
    variants: ['minimal', 'celebratory', 'data-focused'],
    metric: '7dayRetention',
    samples: {
      minimal: "+1 day",
      celebratory: "🔥 Day 5! You're building momentum",
      dataFocused: "Day 5 | Top 40% of users"
    }
  },
  
  'badge-unlock': {
    variants: ['immediate', 'delayed', 'batch'],
    metric: 'engagementIncrease'
  }
};
```

---

## 8. PWA Enhancements

### Manifest Updates

```json
{
  "name": "Reflector",
  "short_name": "Reflector",
  "description": "Notice influence. Choose your stance.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#22d3ee",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Today's Reflection",
      "url": "/reflect",
      "icons": [{ "src": "/icons/reflect.png", "sizes": "96x96" }]
    },
    {
      "name": "Progress",
      "url": "/progress",
      "icons": [{ "src": "/icons/progress.png", "sizes": "96x96" }]
    }
  ]
}
```

### Push Notification Permission

```typescript
// /lib/notifications/setup.ts

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    // Schedule daily reflection reminder
    scheduleNotification({
      title: "Time for reflection",
      body: "3 minutes to check in with your mind",
      time: getUserPreferredTime() // e.g., 8pm
    });
  }
  
  return permission === 'granted';
}
```

---

## 9. Analytics (Privacy-Preserving)

### Event Schema

```typescript
// Use Plausible or TelemetryDeck (no cookies, no PII)

interface AnalyticsEvent {
  // Module engagement
  'module_started': { module: string };
  'module_completed': { module: string; duration: number };
  
  // Scores
  'score_improved': { construct: 'EAI' | 'RF' | 'SA' | 'ARD'; delta: number };
  
  // Reflections
  'reflection_completed': { category: string; insightFlagged: boolean };
  'streak_milestone': { days: 7 | 21 | 60 };
  
  // Exports
  'data_exported': { format: 'json' | 'csv' | 'pdf' };
  
  // Drop-off points
  'module_abandoned': { module: string; stage: string };
}
```

### What NOT to Track

- Raw reflection text (local-only)
- Specific beliefs stated
- Source names (anonymize to types only)
- Individual assessment responses

---

## 10. Next Steps After Phase 2

1. **User Testing** (n=50-100)
   - Qualitative interviews at day 7, 21
   - Measure actual EAI improvement (pre/post)
   - Identify friction points

2. **Content Expansion**
   - Argument Flip full implementation
   - Source Audit module
   - 20+ micro-explainers

3. **Community (Optional)**
   - Anonymous cohort comparison
   - "Insight of the week" (user-submitted)
   - NO social features that gamify tribal identity

4. **Research Publication**
   - Anonymized dataset → academic study
   - "Efficacy of digital metacognitive training"
   - Collaborate with ICSA, CAMeRA Lab, etc.

---

**Phase 2 is now fully spec'd. Time to ship. 🚀**
