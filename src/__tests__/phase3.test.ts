/**
 * Phase 3 Unit Tests
 * 
 * Tests for Argument Flip, Source Audit, EH/II scoring, and Phase 3 badges
 */

import { calculateEH, calculateII, analyzeAuditPatterns } from '@/lib/scoring/scoring-engine';
import { BadgeEngine } from '@/lib/badges/badge-engine';
import { ArgumentFlip, SourceAudit } from '@/types';

describe('Phase 3 Scoring Functions', () => {
  describe('calculateEH', () => {
    it('should return 0 for empty array', () => {
      expect(calculateEH([])).toBe(0);
    });

    it('should calculate average of charity and accuracy scores', () => {
      const flips: ArgumentFlip[] = [
        {
          id: '1',
          userId: 'user1',
          userBelief: 'Test belief',
          generatedCounter: 'Counter argument',
          userRestatement: 'Restatement',
          charityScore: 80,
          accuracyScore: 70,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        },
        {
          id: '2',
          userId: 'user1',
          userBelief: 'Test belief 2',
          generatedCounter: 'Counter argument 2',
          userRestatement: 'Restatement 2',
          charityScore: 60,
          accuracyScore: 80,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      // Average charity: (80 + 60) / 2 = 70
      // Average accuracy: (70 + 80) / 2 = 75
      // EH: (70 + 75) / 2 = 72.5 -> 73
      expect(calculateEH(flips)).toBe(73);
    });

    it('should round to nearest integer', () => {
      const flips: ArgumentFlip[] = [
        {
          id: '1',
          userId: 'user1',
          userBelief: 'Test belief',
          generatedCounter: 'Counter argument',
          userRestatement: 'Restatement',
          charityScore: 75,
          accuracyScore: 76,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      // EH: (75 + 76) / 2 = 75.5 -> 76
      expect(calculateEH(flips)).toBe(76);
    });
  });

  describe('calculateII', () => {
    it('should return 0 for less than 7 audits', () => {
      const audits: SourceAudit[] = Array(6).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: 'Source A',
        whoHeardFrom: 'Person A',
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Not checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      expect(calculateII(audits)).toBe(0);
    });

    it('should calculate II score based on dependency and evidence patterns', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: i < 3 ? 'Source A' : `Source ${String.fromCharCode(66 + i)}`, // First 3 from Source A, rest diverse
        whoHeardFrom: i < 3 ? 'Person A' : `Person ${String.fromCharCode(66 + i)}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: i < 2 ? 'Not checked' : 'Checked thoroughly', // 2 unchecked, 8 checked
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const score = calculateII(audits);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize high dependency', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: 'Same Source', // All from same source = high dependency
        whoHeardFrom: 'Same Person',
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked thoroughly',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const score = calculateII(audits);
      expect(score).toBeLessThan(70); // Should be penalized for high dependency
    });

    it('should penalize evidence gaps', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`, // Diverse sources
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Not checked', // All unchecked = high evidence gaps
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const score = calculateII(audits);
      expect(score).toBeLessThan(50); // Should be heavily penalized for evidence gaps
    });
  });

  describe('analyzeAuditPatterns', () => {
    it('should return default values for empty array', () => {
      const patterns = analyzeAuditPatterns([]);
      expect(patterns.dependencyLevel).toBe('low');
      expect(patterns.topSources).toEqual([]);
      expect(patterns.beneficiaryPatterns).toEqual([]);
      expect(patterns.evidenceGaps).toBe(0);
    });

    it('should detect high dependency when >60% from <3 sources', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: i < 7 ? 'Source A' : `Source ${String.fromCharCode(66 + i)}`, // 7 from Source A
        whoHeardFrom: i < 7 ? 'Person A' : `Person ${String.fromCharCode(66 + i)}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const patterns = analyzeAuditPatterns(audits);
      expect(patterns.dependencyLevel).toBe('high');
      expect(patterns.topSources).toContain('source a');
    });

    it('should detect moderate dependency when 40-60% from top sources', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: i < 5 ? 'Source A' : `Source ${String.fromCharCode(66 + i)}`, // 5 from Source A
        whoHeardFrom: i < 5 ? 'Person A' : `Person ${String.fromCharCode(66 + i)}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const patterns = analyzeAuditPatterns(audits);
      expect(patterns.dependencyLevel).toBe('moderate');
    });

    it('should calculate evidence gaps percentage', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`,
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: i < 3 ? 'Not checked' : 'Checked thoroughly', // 3 unchecked = 30%
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const patterns = analyzeAuditPatterns(audits);
      expect(patterns.evidenceGaps).toBe(30);
    });

    it('should identify top beneficiary patterns', () => {
      const audits: SourceAudit[] = Array(10).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`,
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: i < 6 ? ['Me', 'My Party'] : ['Company A'], // 6 with 'My Party', 4 with 'Company A'
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      const patterns = analyzeAuditPatterns(audits);
      expect(patterns.beneficiaryPatterns).toContain('my party');
      expect(patterns.beneficiaryPatterns).toContain('company a');
    });
  });
});

describe('Phase 3 Badge Engine', () => {
  const mockStore = {
    getStreak: jest.fn().mockResolvedValue({ current: 10, longest: 20, milestones: { seven: true, twentyOne: true, sixty: false, hundred: false } }),
    getDailyReflections: jest.fn().mockResolvedValue([]),
    getDisconfirmGames: jest.fn().mockResolvedValue([]),
    getSchemaReclaims: jest.fn().mockResolvedValue([]),
    getInfluenceSources: jest.fn().mockResolvedValue([]),
    getMilestones: jest.fn().mockResolvedValue([]),
    getArgumentFlips: jest.fn().mockResolvedValue([]),
    getSourceAudits: jest.fn().mockResolvedValue([]),
    getBadges: jest.fn().mockResolvedValue([]),
    unlockBadge: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Steelman Initiate Badge', () => {
    it('should unlock when user completes first Argument Flip with 60+ charity score', async () => {
      const argumentFlips: ArgumentFlip[] = [
        {
          id: '1',
          userId: 'user1',
          userBelief: 'Test belief',
          generatedCounter: 'Counter argument',
          userRestatement: 'Restatement',
          charityScore: 65,
          accuracyScore: 70,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      mockStore.getArgumentFlips.mockResolvedValue(argumentFlips);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          badgeId: 'steelman_initiate',
          name: 'Steelman Initiate',
          description: 'Completed first Argument Flip with 60+ charity score'
        })
      );
    });

    it('should not unlock when charity score is below 60', async () => {
      const argumentFlips: ArgumentFlip[] = [
        {
          id: '1',
          userId: 'user1',
          userBelief: 'Test belief',
          generatedCounter: 'Counter argument',
          userRestatement: 'Restatement',
          charityScore: 55,
          accuracyScore: 70,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      mockStore.getArgumentFlips.mockResolvedValue(argumentFlips);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).not.toHaveBeenCalledWith(
        expect.objectContaining({ badgeId: 'steelman_initiate' })
      );
    });
  });

  describe('Intellectual Honesty Badge', () => {
    it('should unlock when user completes 5 Argument Flips with 70+ average charity', async () => {
      const argumentFlips: ArgumentFlip[] = Array(5).fill(null).map((_, i) => ({
        id: `flip-${i}`,
        userId: 'user1',
        userBelief: `Belief ${i}`,
        generatedCounter: `Counter ${i}`,
        userRestatement: `Restatement ${i}`,
        charityScore: 75, // All 75, average = 75
        accuracyScore: 70,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      }));

      mockStore.getArgumentFlips.mockResolvedValue(argumentFlips);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          badgeId: 'intellectual_honesty',
          name: 'Intellectual Honesty',
          description: 'Completed 5 Argument Flips with 70+ average charity'
        })
      );
    });

    it('should not unlock when average charity is below 70', async () => {
      const argumentFlips: ArgumentFlip[] = Array(5).fill(null).map((_, i) => ({
        id: `flip-${i}`,
        userId: 'user1',
        userBelief: `Belief ${i}`,
        generatedCounter: `Counter ${i}`,
        userRestatement: `Restatement ${i}`,
        charityScore: 65, // All 65, average = 65
        accuracyScore: 70,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      }));

      mockStore.getArgumentFlips.mockResolvedValue(argumentFlips);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).not.toHaveBeenCalledWith(
        expect.objectContaining({ badgeId: 'intellectual_honesty' })
      );
    });
  });

  describe('Source Detective Badge', () => {
    it('should unlock when user completes 7 Source Audits', async () => {
      const sourceAudits: SourceAudit[] = Array(7).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`,
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      mockStore.getSourceAudits.mockResolvedValue(sourceAudits);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          badgeId: 'source_detective',
          name: 'Source Detective',
          description: 'Completed 7 consecutive days of Source Audits'
        })
      );
    });

    it('should not unlock when user has fewer than 7 audits', async () => {
      const sourceAudits: SourceAudit[] = Array(6).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`,
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      mockStore.getSourceAudits.mockResolvedValue(sourceAudits);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).not.toHaveBeenCalledWith(
        expect.objectContaining({ badgeId: 'source_detective' })
      );
    });
  });

  describe('Independent Thinker Badge', () => {
    it('should unlock when user has low dependency and high evidence checking (II > 75)', async () => {
      const sourceAudits: SourceAudit[] = Array(15).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`, // Diverse sources
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me', 'Company A', 'Group B'], // Diverse beneficiaries
        evidenceChecked: 'Checked thoroughly', // All checked
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      mockStore.getSourceAudits.mockResolvedValue(sourceAudits);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          badgeId: 'independent_thinker',
          name: 'Independent Thinker',
          description: 'Low source dependency + high evidence checking (II > 75)'
        })
      );
    });

    it('should not unlock when user has fewer than 14 audits', async () => {
      const sourceAudits: SourceAudit[] = Array(13).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        date: new Date(),
        belief: `Belief ${i}`,
        firstHeard: `Source ${i}`,
        whoHeardFrom: `Person ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Me'],
        evidenceChecked: 'Checked',
        certaintyBefore: 7,
        certaintyAfter: 6,
        insightNotes: 'Test insight'
      }));

      mockStore.getSourceAudits.mockResolvedValue(sourceAudits);

      const badges = await BadgeEngine.checkAndUnlockBadges('user1', mockStore);
      
      expect(mockStore.unlockBadge).not.toHaveBeenCalledWith(
        expect.objectContaining({ badgeId: 'independent_thinker' })
      );
    });
  });
});
