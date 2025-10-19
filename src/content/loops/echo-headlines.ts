/**
 * Echo-Loop Game Content
 * 
 * Headline pairs for bias detection training
 */

export interface HeadlinePair {
  id: string;
  topic: string;
  emotional: string;
  neutral: string;
  category: 'politics' | 'science' | 'economics' | 'social' | 'technology';
}

export const ECHO_HEADLINES: HeadlinePair[] = [
  {
    id: 'climate_01',
    topic: 'Climate Change',
    emotional: 'Climate Deniers Are Destroying Our Children\'s Future',
    neutral: 'New Study Shows Climate Change Impact on Future Generations',
    category: 'science'
  },
  {
    id: 'economy_01',
    topic: 'Economic Policy',
    emotional: 'Corporate Greed Is Crushing Working Families',
    neutral: 'Economic Analysis Shows Wage Growth Trends',
    category: 'economics'
  },
  {
    id: 'tech_01',
    topic: 'Technology',
    emotional: 'Big Tech Is Spying on You and Selling Your Data',
    neutral: 'Tech Companies Update Privacy Policy Terms',
    category: 'technology'
  },
  {
    id: 'health_01',
    topic: 'Healthcare',
    emotional: 'Pharmaceutical Companies Are Profiting Off Your Pain',
    neutral: 'New Drug Pricing Regulations Take Effect',
    category: 'social'
  },
  {
    id: 'education_01',
    topic: 'Education',
    emotional: 'Schools Are Failing Our Children with Woke Ideology',
    neutral: 'Education Department Releases New Curriculum Guidelines',
    category: 'social'
  },
  {
    id: 'immigration_01',
    topic: 'Immigration',
    emotional: 'Illegal Immigrants Are Overwhelming Our Border',
    neutral: 'Border Patrol Reports Monthly Statistics',
    category: 'politics'
  },
  {
    id: 'vaccine_01',
    topic: 'Public Health',
    emotional: 'Anti-Vaxxers Are Putting Everyone at Risk',
    neutral: 'CDC Updates Vaccination Recommendations',
    category: 'science'
  },
  {
    id: 'housing_01',
    topic: 'Housing',
    emotional: 'Landlords Are Exploiting Renters in This Crisis',
    neutral: 'Housing Market Shows Continued Price Increases',
    category: 'economics'
  },
  {
    id: 'social_media_01',
    topic: 'Social Media',
    emotional: 'Social Media Is Addicting Our Kids to Screens',
    neutral: 'Study Examines Social Media Usage Patterns',
    category: 'technology'
  },
  {
    id: 'crime_01',
    topic: 'Crime',
    emotional: 'Soft-on-Crime Policies Are Making Streets Unsafe',
    neutral: 'Police Department Releases Crime Statistics',
    category: 'politics'
  },
  {
    id: 'energy_01',
    topic: 'Energy',
    emotional: 'Fossil Fuel Companies Are Poisoning Our Planet',
    neutral: 'Energy Sector Reports Quarterly Earnings',
    category: 'science'
  },
  {
    id: 'tax_01',
    topic: 'Taxation',
    emotional: 'The Rich Are Avoiding Taxes While You Pay More',
    neutral: 'IRS Releases Annual Tax Collection Data',
    category: 'economics'
  },
  {
    id: 'ai_01',
    topic: 'Artificial Intelligence',
    emotional: 'AI Will Steal All Our Jobs and Control Our Lives',
    neutral: 'AI Research Shows Progress in Machine Learning',
    category: 'technology'
  },
  {
    id: 'gun_01',
    topic: 'Gun Control',
    emotional: 'Gun Violence Is Tearing Apart Our Communities',
    neutral: 'Legislature Considers Firearm Regulation Bill',
    category: 'politics'
  },
  {
    id: 'abortion_01',
    topic: 'Reproductive Rights',
    emotional: 'Pro-Choice Activists Are Fighting for Women\'s Rights',
    neutral: 'Supreme Court Hears Arguments on Reproductive Health',
    category: 'social'
  }
];

export function getRandomHeadlines(count: number = 10): HeadlinePair[] {
  const shuffled = [...ECHO_HEADLINES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
