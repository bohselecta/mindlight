/**
 * Reflector Assessment Item Bank
 * 
 * 36 items balanced across 4 constructs:
 * - EAI (Epistemic Autonomy Index): 12 items
 * - RF (Reflective Flexibility): 8 items  
 * - SA (Source Awareness): 8 items
 * - ARD (Affect Regulation in Debate): 8 items
 * 
 * Each construct includes reverse-coded items for acquiescence bias detection.
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

export const BASELINE_MIRROR_ITEMS: AssessmentItem[] = [
  // ========================================
  // EPISTEMIC AUTONOMY INDEX (EAI) - 12 items
  // ========================================
  {
    id: 'eai_01',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'Before sharing an opinion, I scan for whether it\'s truly mine.',
    reverse: false
  },
  {
    id: 'eai_02',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'When my favorite commentator changes their view, I usually update mine too.',
    reverse: true,
    schema_tag: 'dependence'
  },
  {
    id: 'eai_03',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'If my group stopped agreeing with a belief, I'd keep my view if the evidence still supports it.',
    reverse: false
  },
  {
    id: 'eai_04',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'I find it hard to hold an opinion that my community would disapprove of.',
    reverse: true,
    schema_tag: 'approval_seeking'
  },
  {
    id: 'eai_05',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'I can tell when an idea is mine versus something I absorbed from others.',
    reverse: false
  },
  {
    id: 'eai_06',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'My beliefs mostly match those of people I admire.',
    reverse: true,
    schema_tag: 'dependence'
  },
  {
    id: 'eai_07',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'When evaluating information, I prioritize whether it's true over whether it supports my side.',
    reverse: false
  },
  {
    id: 'eai_08',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'If everyone around me believes something, I assume it's probably correct.',
    reverse: true
  },
  {
    id: 'eai_09',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'I regularly check whether my positions come from my own reasoning or from tribal loyalty.',
    reverse: false
  },
  {
    id: 'eai_10',
    construct: 'EAI',
    type: 'likert7',
    prompt: 'Disagreeing with authority figures makes me feel anxious or guilty.',
    reverse: true,
    schema_tag: 'punitive_parent'
  },
  {
    id: 'eai_11',
    construct: 'EAI',
    type: 'vignette',
    prompt: 'A highly respected leader in your community takes a position you initially disagreed with.',
    options: [
      {
        id: 'a',
        text: 'I reconsider—they probably see something I don't',
        score: 2,
        mechanism: 'authority_deference'
      },
      {
        id: 'b',
        text: 'I investigate their reasoning while maintaining my initial doubt',
        score: 7,
        mechanism: 'autonomous_inquiry'
      },
      {
        id: 'c',
        text: 'I assume they've been captured by bad incentives',
        score: 4,
        mechanism: 'defensive_certainty'
      },
      {
        id: 'd',
        text: 'I check if this changes my respect for them before evaluating the claim',
        score: 3,
        mechanism: 'identity_first_reasoning'
      }
    ]
  },
  {
    id: 'eai_12',
    construct: 'EAI',
    type: 'vignette',
    prompt: 'You realize a belief you hold is unpopular with both your in-group and people you respect.',
    options: [
      {
        id: 'a',
        text: 'I quietly drop it—the social cost isn't worth it',
        score: 1,
        mechanism: 'social_pressure_capitulation'
      },
      {
        id: 'b',
        text: 'I keep it but stop mentioning it publicly',
        score: 4,
        mechanism: 'private_autonomy'
      },
      {
        id: 'c',
        text: 'I double-check my reasoning, then keep or revise based on evidence alone',
        score: 7,
        mechanism: 'evidence_primary'
      },
      {
        id: 'd',
        text: 'I get more vocal about it—consensus is often wrong',
        score: 5,
        mechanism: 'contrarian_identity'
      }
    ]
  },

  // ========================================
  // REFLECTIVE FLEXIBILITY (RF) - 8 items
  // ========================================
  {
    id: 'rf_01',
    construct: 'RF',
    type: 'likert7',
    prompt: 'I can list specific evidence that would change my mind about my strongest beliefs.',
    reverse: false
  },
  {
    id: 'rf_02',
    construct: 'RF',
    type: 'likert7',
    prompt: 'Once I've formed a strong opinion, new evidence rarely shifts it.',
    reverse: true
  },
  {
    id: 'rf_03',
    construct: 'RF',
    type: 'likert7',
    prompt: 'I enjoy listing what could prove me wrong about a belief I hold.',
    reverse: false
  },
  {
    id: 'rf_04',
    construct: 'RF',
    type: 'likert7',
    prompt: 'Changing my mind feels like weakness or failure.',
    reverse: true,
    schema_tag: 'unrelenting_standards'
  },
  {
    id: 'rf_05',
    construct: 'RF',
    type: 'likert7',
    prompt: 'I've meaningfully updated at least one major belief in the past year.',
    reverse: false
  },
  {
    id: 'rf_06',
    construct: 'RF',
    type: 'likert7',
    prompt: 'When I encounter strong counter-evidence, I look for flaws in it before considering its merit.',
    reverse: true
  },
  {
    id: 'rf_07',
    construct: 'RF',
    type: 'vignette',
    prompt: 'A trusted friend presents compelling evidence against one of your core positions.',
    options: [
      {
        id: 'a',
        text: 'I immediately point out weaknesses in their evidence',
        score: 2,
        mechanism: 'defensive_refutation'
      },
      {
        id: 'b',
        text: 'I acknowledge it's interesting and say I'll think about it',
        score: 5,
        mechanism: 'polite_deflection'
      },
      {
        id: 'c',
        text: 'I ask them to help me understand what I might be missing',
        score: 7,
        mechanism: 'genuine_inquiry'
      },
      {
        id: 'd',
        text: 'I feel hurt that they'd challenge something important to me',
        score: 1,
        mechanism: 'emotional_fusion'
      }
    ]
  },
  {
    id: 'rf_08',
    construct: 'RF',
    type: 'vignette',
    prompt: 'You discover data that contradicts a position you've publicly defended.',
    options: [
      {
        id: 'a',
        text: 'I look for methodological flaws in the data',
        score: 2,
        mechanism: 'motivated_skepticism'
      },
      {
        id: 'b',
        text: 'I revise my view and publicly acknowledge the update',
        score: 7,
        mechanism: 'intellectual_honesty'
      },
      {
        id: 'c',
        text: 'I privately update but don't mention it—too embarrassing',
        score: 4,
        mechanism: 'private_revision'
      },
      {
        id: 'd',
        text: 'I seek out data that re-confirms my original position',
        score: 1,
        mechanism: 'confirmation_seeking'
      }
    ]
  },

  // ========================================
  // SOURCE AWARENESS (SA) - 8 items
  // ========================================
  {
    id: 'sa_01',
    construct: 'SA',
    type: 'likert7',
    prompt: 'I can name the first three places I heard the claims I repeat most often.',
    reverse: false
  },
  {
    id: 'sa_02',
    construct: 'SA',
    type: 'likert7',
    prompt: 'I rarely think about where my information comes from—I just know it.',
    reverse: true
  },
  {
    id: 'sa_03',
    construct: 'SA',
    type: 'likert7',
    prompt: 'Before sharing a claim, I trace it back to a primary source.',
    reverse: false
  },
  {
    id: 'sa_04',
    construct: 'SA',
    type: 'likert7',
    prompt: 'Most of my news and information comes from 3 or fewer sources.',
    reverse: true
  },
  {
    id: 'sa_05',
    construct: 'SA',
    type: 'likert7',
    prompt: 'I actively seek out sources that disagree with my current views.',
    reverse: false
  },
  {
    id: 'sa_06',
    construct: 'SA',
    type: 'likert7',
    prompt: 'I trust information more when it confirms what I already believe.',
    reverse: true
  },
  {
    id: 'sa_07',
    construct: 'SA',
    type: 'vignette',
    prompt: 'Someone asks you where you learned a fact you just stated.',
    options: [
      {
        id: 'a',
        text: 'I can immediately name the source and approximate date',
        score: 7,
        mechanism: 'high_source_tracking'
      },
      {
        id: 'b',
        text: 'I remember the general source (podcast, article, friend)',
        score: 5,
        mechanism: 'moderate_source_tracking'
      },
      {
        id: 'c',
        text: 'I'm not sure—it's just something I know',
        score: 2,
        mechanism: 'source_amnesia'
      },
      {
        id: 'd',
        text: 'I realize I may have absorbed it without verification',
        score: 4,
        mechanism: 'source_awareness_emerging'
      }
    ]
  },
  {
    id: 'sa_08',
    construct: 'SA',
    type: 'vignette',
    prompt: 'You notice all your information on a topic comes from sources that share your perspective.',
    options: [
      {
        id: 'a',
        text: 'That makes sense—they're the ones who understand it correctly',
        score: 1,
        mechanism: 'epistemic_closure'
      },
      {
        id: 'b',
        text: 'I seek out at least one high-quality dissenting source',
        score: 7,
        mechanism: 'deliberate_diversification'
      },
      {
        id: 'c',
        text: 'I note it but don't change my reading habits',
        score: 3,
        mechanism: 'awareness_without_action'
      },
      {
        id: 'd',
        text: 'I look for a "neutral" source to balance it out',
        score: 5,
        mechanism: 'centrist_correction'
      }
    ]
  },

  // ========================================
  // AFFECT REGULATION IN DEBATE (ARD) - 8 items
  // ========================================
  {
    id: 'ard_01',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'When someone refutes "my side," I can stay curious for at least one minute.',
    reverse: false
  },
  {
    id: 'ard_02',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'Hearing someone praise a figure I dislike makes me feel angry or disgusted.',
    reverse: true
  },
  {
    id: 'ard_03',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'I notice my emotional reaction to information before deciding if it's true.',
    reverse: false
  },
  {
    id: 'ard_04',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'When my values are challenged, I feel it physically (tension, heat, racing heart).',
    reverse: true
  },
  {
    id: 'ard_05',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'I can engage with ideas I find morally repugnant without losing my composure.',
    reverse: false
  },
  {
    id: 'ard_06',
    construct: 'ARD',
    type: 'likert7',
    prompt: 'If someone from "the other side" makes a good point, I feel betrayed or confused.',
    reverse: true,
    schema_tag: 'identity_fusion'
  },
  {
    id: 'ard_07',
    construct: 'ARD',
    type: 'vignette',
    prompt: 'During a discussion, someone misrepresents a position you care deeply about.',
    options: [
      {
        id: 'a',
        text: 'I feel anger rise and immediately correct them with edge in my voice',
        score: 2,
        mechanism: 'reactive_defense'
      },
      {
        id: 'b',
        text: 'I notice my emotion, pause, then offer a clarification',
        score: 7,
        mechanism: 'regulated_response'
      },
      {
        id: 'c',
        text: 'I disengage—this person isn't worth engaging with',
        score: 3,
        mechanism: 'defensive_withdrawal'
      },
      {
        id: 'd',
        text: 'I correct them but feel tense and upset for the next hour',
        score: 4,
        mechanism: 'lingering_dysregulation'
      }
    ]
  },
  {
    id: 'ard_08',
    construct: 'ARD',
    type: 'vignette',
    prompt: 'You read a news headline that triggers strong negative emotion about "the other side."',
    options: [
      {
        id: 'a',
        text: 'I share it immediately with a commentary expressing my outrage',
        score: 1,
        mechanism: 'emotional_contagion'
      },
      {
        id: 'b',
        text: 'I notice the emotional pull and check the source before reacting',
        score: 7,
        mechanism: 'metacognitive_regulation'
      },
      {
        id: 'c',
        text: 'I read it, feel validated, and move on',
        score: 3,
        mechanism: 'confirmation_comfort'
      },
      {
        id: 'd',
        text: 'I check if the headline matches the article content',
        score: 6,
        mechanism: 'critical_verification'
      }
    ]
  }
];

// Metadata for construct interpretation
export const CONSTRUCT_METADATA = {
  EAI: {
    name: 'Epistemic Autonomy Index',
    description: 'Measures independence in belief formation from external identities and authorities',
    interpretation: {
      high: 'You demonstrate strong independence in forming and maintaining beliefs based on evidence rather than social pressure',
      moderate: 'You show some autonomy but may defer to group consensus or authority in certain domains',
      low: 'Your beliefs are substantially shaped by social identity, authority figures, or group expectations'
    }
  },
  RF: {
    name: 'Reflective Flexibility',
    description: 'Measures willingness and ability to revise beliefs in light of counter-evidence',
    interpretation: {
      high: 'You actively seek disconfirmation and update beliefs when evidence warrants',
      moderate: 'You're open to revision in theory but may resist in practice, especially for core beliefs',
      low: 'You tend to defend existing positions and experience belief revision as threatening'
    }
  },
  SA: {
    name: 'Source Awareness',
    description: 'Measures conscious tracking of information provenance and source diversity',
    interpretation: {
      high: 'You actively track where beliefs originate and deliberately diversify information sources',
      moderate: 'You have some awareness of sources but don't consistently track or diversify',
      low: 'You experience beliefs as "just known" without clear memory of their origins'
    }
  },
  ARD: {
    name: 'Affect Regulation in Debate',
    description: 'Measures capacity to manage emotional reactivity when beliefs are challenged',
    interpretation: {
      high: 'You notice emotional triggers and maintain curiosity even when values are challenged',
      moderate: 'You can regulate affect in low-stakes debates but struggle when identity is threatened',
      low: 'Counter-evidence or out-group arguments trigger strong emotional reactivity'
    }
  }
} as const;

// Reliability target: Cronbach's α ≥ .70 for each subscale
export const RELIABILITY_TARGETS = {
  EAI: 0.70,
  RF: 0.70,
  SA: 0.70,
  ARD: 0.70
} as const;
