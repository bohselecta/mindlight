/**
 * Phase 3 Integration Tests
 * 
 * Tests the integration between Phase 3 modules, storage, scoring, and UI components.
 * Ensures data flows correctly from modules through storage to dashboard displays.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { LocalAutonomyStore } from '@/lib/store/indexed-db';
import { calculateEH, calculateII, analyzeAuditPatterns } from '@/lib/scoring/scoring-engine';
import { BadgeEngine } from '@/lib/badges/badge-engine';
import { ArgumentFlip, SourceAudit, AutonomyProfile } from '@/types';

// Mock IndexedDB for testing
const mockDB = {
  argumentFlips: {
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    delete: jest.fn()
  },
  sourceAudits: {
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    delete: jest.fn()
  },
  badges: {
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    toArray: jest.fn()
  },
  profiles: {
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    toArray: jest.fn()
  }
};

// Mock Dexie
jest.mock('dexie', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockDB)
  };
});

describe('Phase 3 Integration Tests', () => {
  let store: LocalAutonomyStore;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    store = new LocalAutonomyStore(testUserId);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Argument Flip Module Integration', () => {
    it('should save argument flip and calculate EH score', async () => {
      const argumentFlip: ArgumentFlip = {
        id: 'flip-1',
        userId: testUserId,
        userBelief: 'Social media is harmful to society',
        generatedCounter: 'Social media enables global connection and democratizes information sharing',
        userRestatement: 'Social media enables global connection and democratizes information sharing, though it may have some negative effects',
        charityScore: 85,
        accuracyScore: 90,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      };

      // Mock successful save
      mockDB.argumentFlips.add.mockResolvedValue(undefined);
      mockDB.argumentFlips.toArray.mockResolvedValue([argumentFlip]);

      // Save the argument flip
      await store.saveArgumentFlip(argumentFlip);

      // Verify save was called
      expect(mockDB.argumentFlips.add).toHaveBeenCalledWith({
        ...argumentFlip,
        userId: testUserId,
        timestamp: argumentFlip.timestamp
      });

      // Retrieve and calculate EH score
      const flips = await store.getArgumentFlips(testUserId);
      const ehScore = calculateEH(flips);

      expect(flips).toHaveLength(1);
      expect(flips[0].charityScore).toBe(85);
      expect(flips[0].accuracyScore).toBe(90);
      expect(ehScore).toBe(87); // Average of 85 and 90
    });

    it('should detect strawmanning and adjust EH score', async () => {
      const strawmanFlip: ArgumentFlip = {
        id: 'flip-2',
        userId: testUserId,
        userBelief: 'Climate change is real',
        generatedCounter: 'Climate change is a hoax perpetrated by scientists for funding',
        userRestatement: 'Climate change is a hoax perpetrated by scientists for funding',
        charityScore: 20,
        accuracyScore: 15,
        strawmanDetected: true,
        missingKeyPoints: ['Scientific consensus', 'Multiple lines of evidence'],
        addedWeakPoints: ['Funding conspiracy'],
        timestamp: new Date()
      };

      mockDB.argumentFlips.add.mockResolvedValue(undefined);
      mockDB.argumentFlips.toArray.mockResolvedValue([strawmanFlip]);

      await store.saveArgumentFlip(strawmanFlip);
      const flips = await store.getArgumentFlips(testUserId);
      const ehScore = calculateEH(flips);

      expect(strawmanFlip.strawmanDetected).toBe(true);
      expect(strawmanFlip.missingKeyPoints).toContain('Scientific consensus');
      expect(ehScore).toBe(17); // Low score due to strawmanning
    });

    it('should unlock steelman_initiate badge after first good flip', async () => {
      const goodFlip: ArgumentFlip = {
        id: 'flip-3',
        userId: testUserId,
        userBelief: 'Exercise is beneficial',
        generatedCounter: 'Exercise can be harmful if overdone or done incorrectly',
        userRestatement: 'Exercise can be harmful if overdone or done incorrectly, though moderate exercise is generally beneficial',
        charityScore: 75,
        accuracyScore: 80,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      };

      mockDB.argumentFlips.add.mockResolvedValue(undefined);
      mockDB.argumentFlips.toArray.mockResolvedValue([goodFlip]);
      mockDB.badges.toArray.mockResolvedValue([]);

      await store.saveArgumentFlip(goodFlip);
      
      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      expect(badges.some(b => b.id === 'steelman_initiate')).toBe(true);
    });
  });

  describe('Source Audit Module Integration', () => {
    it('should save source audit and calculate II score', async () => {
      const sourceAudit: SourceAudit = {
        id: 'audit-1',
        userId: testUserId,
        date: new Date(),
        belief: 'Coffee is good for health',
        firstHeard: 'News article',
        whoHeardFrom: 'Dr. Smith, nutritionist',
        whenHeardIt: 'Last week',
        whoBenefits: ['Coffee industry', 'Health researchers'],
        evidenceChecked: 'Found multiple peer-reviewed studies supporting moderate coffee consumption',
        certaintyBefore: 70,
        certaintyAfter: 85
      };

      mockDB.sourceAudits.add.mockResolvedValue(undefined);
      mockDB.sourceAudits.toArray.mockResolvedValue([sourceAudit]);

      await store.saveSourceAudit(sourceAudit);

      expect(mockDB.sourceAudits.add).toHaveBeenCalledWith({
        ...sourceAudit,
        userId: testUserId,
        date: sourceAudit.date
      });

      const audits = await store.getSourceAudits(testUserId);
      const iiScore = calculateII(audits);

      expect(audits).toHaveLength(1);
      expect(audits[0].evidenceChecked).toContain('peer-reviewed studies');
      expect(iiScore).toBe(0); // Need 7+ audits for meaningful II score
    });

    it('should detect source dependency patterns', async () => {
      const audits: SourceAudit[] = [
        {
          id: 'audit-1',
          userId: testUserId,
          date: new Date('2024-01-01'),
          belief: 'Belief 1',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-2',
          userId: testUserId,
          date: new Date('2024-01-02'),
          belief: 'Belief 2',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-3',
          userId: testUserId,
          date: new Date('2024-01-03'),
          belief: 'Belief 3',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-4',
          userId: testUserId,
          date: new Date('2024-01-04'),
          belief: 'Belief 4',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-5',
          userId: testUserId,
          date: new Date('2024-01-05'),
          belief: 'Belief 5',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-6',
          userId: testUserId,
          date: new Date('2024-01-06'),
          belief: 'Belief 6',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        },
        {
          id: 'audit-7',
          userId: testUserId,
          date: new Date('2024-01-07'),
          belief: 'Belief 7',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Yesterday',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        }
      ];

      mockDB.sourceAudits.toArray.mockResolvedValue(audits);

      const patterns = analyzeAuditPatterns(audits);
      const iiScore = calculateII(audits);

      expect(patterns.dependencyLevel).toBe('high');
      expect(patterns.topSources).toContain('john doe');
      expect(patterns.evidenceGaps).toBe(100); // All unchecked
      expect(iiScore).toBeLessThan(30); // Low due to high dependency and no evidence checking
    });

    it('should unlock source_detective badge after 7 audits', async () => {
      const audits: SourceAudit[] = Array.from({ length: 7 }, (_, i) => ({
        id: `audit-${i}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i}`,
        firstHeard: 'Various sources',
        whoHeardFrom: `Source ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Various groups'],
        evidenceChecked: 'Checked multiple sources',
        certaintyBefore: 70,
        certaintyAfter: 75
      }));

      mockDB.sourceAudits.toArray.mockResolvedValue(audits);
      mockDB.badges.toArray.mockResolvedValue([]);

      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      expect(badges.some(b => b.id === 'source_detective')).toBe(true);
    });
  });

  describe('Progress Dashboard Integration', () => {
    it('should display EH and II scores in dashboard', async () => {
      const argumentFlips: ArgumentFlip[] = [
        {
          id: 'flip-1',
          userId: testUserId,
          userBelief: 'Test belief',
          generatedCounter: 'Counter argument',
          userRestatement: 'Fair restatement',
          charityScore: 80,
          accuracyScore: 85,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      const sourceAudits: SourceAudit[] = Array.from({ length: 10 }, (_, i) => ({
        id: `audit-${i}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i}`,
        firstHeard: 'Various sources',
        whoHeardFrom: `Source ${i}`,
        whenHeardIt: 'Recently',
        whoBenefits: ['Various groups'],
        evidenceChecked: 'Checked multiple sources',
        certaintyBefore: 70,
        certaintyAfter: 75
      }));

      mockDB.argumentFlips.toArray.mockResolvedValue(argumentFlips);
      mockDB.sourceAudits.toArray.mockResolvedValue(sourceAudits);

      const [flips, audits] = await Promise.all([
        store.getArgumentFlips(testUserId),
        store.getSourceAudits(testUserId)
      ]);

      const ehScore = calculateEH(flips);
      const iiScore = calculateII(audits);

      expect(ehScore).toBe(82); // Average of 80 and 85
      expect(iiScore).toBeGreaterThan(70); // Good II score due to diverse sources and evidence checking
    });

    it('should handle empty Phase 3 data gracefully', async () => {
      mockDB.argumentFlips.toArray.mockResolvedValue([]);
      mockDB.sourceAudits.toArray.mockResolvedValue([]);

      const [flips, audits] = await Promise.all([
        store.getArgumentFlips(testUserId),
        store.getSourceAudits(testUserId)
      ]);

      const ehScore = calculateEH(flips);
      const iiScore = calculateII(audits);

      expect(ehScore).toBe(0);
      expect(iiScore).toBe(0);
    });
  });

  describe('Data Export Integration', () => {
    it('should include Phase 3 data in export', async () => {
      const argumentFlip: ArgumentFlip = {
        id: 'flip-1',
        userId: testUserId,
        userBelief: 'Test belief',
        generatedCounter: 'Counter argument',
        userRestatement: 'Fair restatement',
        charityScore: 80,
        accuracyScore: 85,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      };

      const sourceAudit: SourceAudit = {
        id: 'audit-1',
        userId: testUserId,
        date: new Date(),
        belief: 'Test belief',
        firstHeard: 'News',
        whoHeardFrom: 'Expert',
        whenHeardIt: 'Recently',
        whoBenefits: ['Public'],
        evidenceChecked: 'Checked',
        certaintyBefore: 70,
        certaintyAfter: 80
      };

      mockDB.argumentFlips.toArray.mockResolvedValue([argumentFlip]);
      mockDB.sourceAudits.toArray.mockResolvedValue([sourceAudit]);
      mockDB.profiles.toArray.mockResolvedValue([]);

      const exportedData = await store.exportData();

      expect(exportedData.argumentFlips).toHaveLength(1);
      expect(exportedData.sourceAudits).toHaveLength(1);
      expect(exportedData.version).toBe('3.0.0');
      expect(exportedData.argumentFlips[0].charityScore).toBe(80);
      expect(exportedData.sourceAudits[0].evidenceChecked).toBe('Checked');
    });
  });

  describe('Badge System Integration', () => {
    it('should unlock intellectual_honesty badge after 5 good flips', async () => {
      const goodFlips: ArgumentFlip[] = Array.from({ length: 5 }, (_, i) => ({
        id: `flip-${i}`,
        userId: testUserId,
        userBelief: `Belief ${i}`,
        generatedCounter: `Counter ${i}`,
        userRestatement: `Fair restatement ${i}`,
        charityScore: 75,
        accuracyScore: 80,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      }));

      mockDB.argumentFlips.toArray.mockResolvedValue(goodFlips);
      mockDB.badges.toArray.mockResolvedValue([]);

      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      expect(badges.some(b => b.id === 'intellectual_honesty')).toBe(true);
    });

    it('should unlock independent_thinker badge with high II score', async () => {
      const diverseAudits: SourceAudit[] = Array.from({ length: 20 }, (_, i) => ({
        id: `audit-${i}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i}`,
        firstHeard: 'Various sources',
        whoHeardFrom: `Source ${i}`, // All different sources
        whenHeardIt: 'Recently',
        whoBenefits: ['Group A', 'Group B', 'Group C'], // Diverse beneficiaries
        evidenceChecked: 'Thoroughly checked multiple sources and studies',
        certaintyBefore: 70,
        certaintyAfter: 75
      }));

      mockDB.sourceAudits.toArray.mockResolvedValue(diverseAudits);
      mockDB.badges.toArray.mockResolvedValue([]);

      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      expect(badges.some(b => b.id === 'independent_thinker')).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle storage errors gracefully', async () => {
      const argumentFlip: ArgumentFlip = {
        id: 'flip-1',
        userId: testUserId,
        userBelief: 'Test belief',
        generatedCounter: 'Counter argument',
        userRestatement: 'Fair restatement',
        charityScore: 80,
        accuracyScore: 85,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      };

      mockDB.argumentFlips.add.mockRejectedValue(new Error('Storage error'));

      await expect(store.saveArgumentFlip(argumentFlip)).rejects.toThrow('Storage error');
    });

    it('should handle missing data in calculations', async () => {
      mockDB.argumentFlips.toArray.mockResolvedValue([]);
      mockDB.sourceAudits.toArray.mockResolvedValue([]);

      const [flips, audits] = await Promise.all([
        store.getArgumentFlips(testUserId),
        store.getSourceAudits(testUserId)
      ]);

      const ehScore = calculateEH(flips);
      const iiScore = calculateII(audits);

      expect(ehScore).toBe(0);
      expect(iiScore).toBe(0);
    });
  });
});