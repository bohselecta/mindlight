/**
 * Identity Mirror Value Cards
 * 
 * Diverse value domains for the Identity Mirror assessment
 * Used to measure drift between personal values and tribe expectations
 */

import { ValueCard } from '@/types';

export const VALUE_CARDS: ValueCard[] = [
  // Care/Harm domain
  { id: 'compassion', name: 'Compassion', category: 'care' },
  { id: 'community_care', name: 'Community Care', category: 'care' },
  { id: 'equality', name: 'Equality', category: 'care' },
  
  // Liberty/Oppression domain
  { id: 'personal_freedom', name: 'Personal Freedom', category: 'liberty' },
  { id: 'autonomy', name: 'Autonomy', category: 'liberty' },
  { id: 'individual_rights', name: 'Individual Rights', category: 'liberty' },
  
  // Loyalty/Betrayal domain
  { id: 'loyalty', name: 'Loyalty', category: 'loyalty' },
  { id: 'tradition', name: 'Tradition', category: 'loyalty' },
  { id: 'family', name: 'Family', category: 'loyalty' },
  
  // Fairness/Cheating domain
  { id: 'merit', name: 'Merit', category: 'fairness' },
  { id: 'justice', name: 'Justice', category: 'fairness' },
  { id: 'fairness', name: 'Fairness', category: 'fairness' },
  
  // Sanctity/Degradation domain
  { id: 'discipline', name: 'Discipline', category: 'sanctity' },
  { id: 'respect', name: 'Respect', category: 'sanctity' },
  { id: 'honor', name: 'Honor', category: 'sanctity' },
  
  // Other domains
  { id: 'truth_seeking', name: 'Truth-Seeking', category: 'other' },
  { id: 'innovation', name: 'Innovation', category: 'other' },
  { id: 'creativity', name: 'Creativity', category: 'other' },
  { id: 'stability', name: 'Stability', category: 'other' },
  { id: 'growth', name: 'Growth', category: 'other' },
  { id: 'balance', name: 'Balance', category: 'other' },
];

export const VALUE_CATEGORIES = {
  care: {
    name: 'Care/Harm',
    description: 'Values related to protecting others from harm and promoting wellbeing',
    color: 'emerald'
  },
  liberty: {
    name: 'Liberty/Oppression',
    description: 'Values related to individual freedom and resistance to oppression',
    color: 'blue'
  },
  loyalty: {
    name: 'Loyalty/Betrayal',
    description: 'Values related to group membership, tradition, and social bonds',
    color: 'red'
  },
  fairness: {
    name: 'Fairness/Cheating',
    description: 'Values related to justice, merit, and equal treatment',
    color: 'yellow'
  },
  sanctity: {
    name: 'Sanctity/Degradation',
    description: 'Values related to purity, respect, and moral boundaries',
    color: 'purple'
  },
  other: {
    name: 'Other',
    description: 'Values that don\'t fit neatly into the main moral foundations',
    color: 'slate'
  }
} as const;
