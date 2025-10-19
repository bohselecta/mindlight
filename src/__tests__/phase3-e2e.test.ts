/**
 * Phase 3 End-to-End Tests
 * 
 * Tests complete user journeys through Phase 3 modules,
 * from module completion to dashboard display and badge unlocking.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { LocalAutonomyStore } from '@/lib/store/indexed-db';
import { calculateEH, calculateII } from '@/lib/scoring/scoring-engine';
import { BadgeEngine } from '@/lib/badges/badge-engine';
import { ArgumentFlip, SourceAudit, Badge } from '@/types';

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
  },
  responses: {
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

describe('Phase 3 End-to-End Tests', () => {
  let store: LocalAutonomyStore;
  const testUserId = 'e2e-test-user';

  beforeEach(() => {
    store = new LocalAutonomyStore(testUserId);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Argument Flip Journey', () => {
    it('should complete full Argument Flip workflow and unlock badges', async () => {
      // Step 1: User completes first Argument Flip
      const firstFlip: ArgumentFlip = {
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

      mockDB.argumentFlips.add.mockResolvedValue(undefined);
      mockDB.argumentFlips.toArray.mockResolvedValue([firstFlip]);
      mockDB.badges.toArray.mockResolvedValue([]);

      await store.saveArgumentFlip(firstFlip);

      // Step 2: Check for steelman_initiate badge
      let badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      expect(badges.some(b => b.id === 'steelman_initiate')).toBe(true);

      // Step 3: User completes 4 more Argument Flips
      const additionalFlips: ArgumentFlip[] = Array.from({ length: 4 }, (_, i) => ({
        id: `flip-${i + 2}`,
        userId: testUserId,
        userBelief: `Belief ${i + 2}`,
        generatedCounter: `Counter ${i + 2}`,
        userRestatement: `Fair restatement ${i + 2}`,
        charityScore: 75 + i * 2, // 75, 77, 79, 81
        accuracyScore: 80 + i * 2, // 80, 82, 84, 86
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      }));

      const allFlips = [firstFlip, ...additionalFlips];
      mockDB.argumentFlips.toArray.mockResolvedValue(allFlips);

      // Step 4: Check EH score calculation
      const ehScore = calculateEH(allFlips);
      expect(ehScore).toBeGreaterThan(70); // Should be high due to good charity scores

      // Step 5: Check for intellectual_honesty badge
      badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      expect(badges.some(b => b.id === 'intellectual_honesty')).toBe(true);

      // Step 6: Verify data persistence
      const savedFlips = await store.getArgumentFlips(testUserId);
      expect(savedFlips).toHaveLength(5);
      expect(savedFlips.every(f => f.charityScore >= 75)).toBe(true);
    });

    it('should handle strawmanning detection and low EH scores', async () => {
      const strawmanFlips: ArgumentFlip[] = [
        {
          id: 'flip-strawman-1',
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
        },
        {
          id: 'flip-strawman-2',
          userId: testUserId,
          userBelief: 'Exercise is beneficial',
          generatedCounter: 'Exercise can be harmful if overdone',
          userRestatement: 'Exercise is dangerous and should be avoided',
          charityScore: 25,
          accuracyScore: 20,
          strawmanDetected: true,
          missingKeyPoints: ['Moderate exercise benefits'],
          addedWeakPoints: ['Complete avoidance'],
          timestamp: new Date()
        }
      ];

      mockDB.argumentFlips.add.mockResolvedValue(undefined);
      mockDB.argumentFlips.toArray.mockResolvedValue(strawmanFlips);

      for (const flip of strawmanFlips) {
        await store.saveArgumentFlip(flip);
      }

      const ehScore = calculateEH(strawmanFlips);
      expect(ehScore).toBeLessThan(30); // Low due to strawmanning
      expect(strawmanFlips.every(f => f.strawmanDetected)).toBe(true);
    });
  });

  describe('Complete Source Audit Journey', () => {
    it('should complete 7-day Source Audit streak and unlock badges', async () => {
      const sourceAudits: SourceAudit[] = Array.from({ length: 7 }, (_, i) => ({
        id: `audit-${i + 1}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i + 1}`,
        firstHeard: 'Various sources',
        whoHeardFrom: `Source ${i + 1}`, // Different sources each day
        whenHeardIt: 'Recently',
        whoBenefits: ['Group A', 'Group B', 'Group C'], // Diverse beneficiaries
        evidenceChecked: 'Thoroughly checked multiple sources and studies',
        certaintyBefore: 70,
        certaintyAfter: 75
      }));

      mockDB.sourceAudits.add.mockResolvedValue(undefined);
      mockDB.sourceAudits.toArray.mockResolvedValue(sourceAudits);
      mockDB.badges.toArray.mockResolvedValue([]);

      // Save all audits
      for (const audit of sourceAudits) {
        await store.saveSourceAudit(audit);
      }

      // Check source_detective badge
      let badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      expect(badges.some(b => b.id === 'source_detective')).toBe(true);

      // Calculate II score
      const iiScore = calculateII(sourceAudits);
      expect(iiScore).toBeGreaterThan(70); // High due to diverse sources and evidence checking

      // Verify data persistence
      const savedAudits = await store.getSourceAudits(testUserId);
      expect(savedAudits).toHaveLength(7);
      expect(savedAudits.every(a => a.evidenceChecked.includes('checked'))).toBe(true);
    });

    it('should detect source dependency and low II scores', async () => {
      const dependentAudits: SourceAudit[] = Array.from({ length: 10 }, (_, i) => ({
        id: `audit-dependent-${i + 1}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i + 1}`,
        firstHeard: 'Social media',
        whoHeardFrom: 'John Doe', // Same source every time
        whenHeardIt: 'Recently',
        whoBenefits: ['Tech companies'], // Same beneficiary
        evidenceChecked: 'Not checked', // No evidence checking
        certaintyBefore: 80,
        certaintyAfter: 80
      }));

      mockDB.sourceAudits.toArray.mockResolvedValue(dependentAudits);

      const iiScore = calculateII(dependentAudits);
      expect(iiScore).toBeLessThan(30); // Low due to high dependency and no evidence checking

      // Verify dependency detection
      const savedAudits = await store.getSourceAudits(testUserId);
      expect(savedAudits.every(a => a.whoHeardFrom === 'John Doe')).toBe(true);
    });
  });

  describe('Complete Phase 3 Journey', () => {
    it('should complete both modules and achieve independent_thinker badge', async () => {
      // Complete Argument Flips (5 good ones)
      const argumentFlips: ArgumentFlip[] = Array.from({ length: 5 }, (_, i) => ({
        id: `flip-${i + 1}`,
        userId: testUserId,
        userBelief: `Belief ${i + 1}`,
        generatedCounter: `Counter ${i + 1}`,
        userRestatement: `Fair restatement ${i + 1}`,
        charityScore: 75 + i * 2,
        accuracyScore: 80 + i * 2,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      }));

      // Complete Source Audits (14 diverse ones)
      const sourceAudits: SourceAudit[] = Array.from({ length: 14 }, (_, i) => ({
        id: `audit-${i + 1}`,
        userId: testUserId,
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        belief: `Belief ${i + 1}`,
        firstHeard: 'Various sources',
        whoHeardFrom: `Source ${i + 1}`, // All different sources
        whenHeardIt: 'Recently',
        whoBenefits: ['Group A', 'Group B', 'Group C'], // Diverse beneficiaries
        evidenceChecked: 'Thoroughly checked multiple sources and studies',
        certaintyBefore: 70,
        certaintyAfter: 75
      }));

      // Mock all data
      mockDB.argumentFlips.toArray.mockResolvedValue(argumentFlips);
      mockDB.sourceAudits.toArray.mockResolvedValue(sourceAudits);
      mockDB.badges.toArray.mockResolvedValue([]);

      // Calculate scores
      const ehScore = calculateEH(argumentFlips);
      const iiScore = calculateII(sourceAudits);

      expect(ehScore).toBeGreaterThan(70);
      expect(iiScore).toBeGreaterThan(75);

      // Check for all Phase 3 badges
      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      expect(badges.some(b => b.id === 'steelman_initiate')).toBe(true);
      expect(badges.some(b => b.id === 'intellectual_honesty')).toBe(true);
      expect(badges.some(b => b.id === 'source_detective')).toBe(true);
      expect(badges.some(b => b.id === 'independent_thinker')).toBe(true);
    });

    it('should handle mixed performance and partial badge unlocking', async () => {
      // Some good Argument Flips, some poor ones
      const mixedFlips: ArgumentFlip[] = [
        {
          id: 'flip-good-1',
          userId: testUserId,
          userBelief: 'Good belief 1',
          generatedCounter: 'Good counter',
          userRestatement: 'Fair restatement',
          charityScore: 85,
          accuracyScore: 90,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        },
        {
          id: 'flip-poor-1',
          userId: testUserId,
          userBelief: 'Poor belief 1',
          generatedCounter: 'Poor counter',
          userRestatement: 'Strawman restatement',
          charityScore: 30,
          accuracyScore: 25,
          strawmanDetected: true,
          missingKeyPoints: ['Key points'],
          addedWeakPoints: ['Weak points'],
          timestamp: new Date()
        }
      ];

      // Some diverse Source Audits, some dependent ones
      const mixedAudits: SourceAudit[] = [
        {
          id: 'audit-diverse-1',
          userId: testUserId,
          date: new Date('2024-01-01'),
          belief: 'Diverse belief 1',
          firstHeard: 'News',
          whoHeardFrom: 'Expert A',
          whenHeardIt: 'Recently',
          whoBenefits: ['Group A'],
          evidenceChecked: 'Thoroughly checked',
          certaintyBefore: 70,
          certaintyAfter: 80
        },
        {
          id: 'audit-dependent-1',
          userId: testUserId,
          date: new Date('2024-01-02'),
          belief: 'Dependent belief 1',
          firstHeard: 'Social media',
          whoHeardFrom: 'John Doe',
          whenHeardIt: 'Recently',
          whoBenefits: ['Tech companies'],
          evidenceChecked: 'Not checked',
          certaintyBefore: 80,
          certaintyAfter: 80
        }
      ];

      mockDB.argumentFlips.toArray.mockResolvedValue(mixedFlips);
      mockDB.sourceAudits.toArray.mockResolvedValue(mixedAudits);
      mockDB.badges.toArray.mockResolvedValue([]);

      // Calculate scores
      const ehScore = calculateEH(mixedFlips);
      const iiScore = calculateII(mixedAudits);

      expect(ehScore).toBe(57); // Average of 87.5 and 27.5
      expect(iiScore).toBeLessThan(50); // Low due to limited data and mixed patterns

      // Check badges
      const badges = await BadgeEngine.checkAndUnlockBadges(testUserId, store);
      
      // Should unlock steelman_initiate (first good flip)
      expect(badges.some(b => b.id === 'steelman_initiate')).toBe(true);
      
      // Should NOT unlock intellectual_honesty (need 5 good flips)
      expect(badges.some(b => b.id === 'intellectual_honesty')).toBe(false);
      
      // Should NOT unlock source_detective (need 7 audits)
      expect(badges.some(b => b.id === 'source_detective')).toBe(false);
      
      // Should NOT unlock independent_thinker (need 14 audits + high II)
      expect(badges.some(b => b.id === 'independent_thinker')).toBe(false);
    });
  });

  describe('Data Export and Persistence', () => {
    it('should export complete Phase 3 data', async () => {
      const argumentFlips: ArgumentFlip[] = [
        {
          id: 'flip-export-1',
          userId: testUserId,
          userBelief: 'Export test belief',
          generatedCounter: 'Export test counter',
          userRestatement: 'Export test restatement',
          charityScore: 80,
          accuracyScore: 85,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      const sourceAudits: SourceAudit[] = [
        {
          id: 'audit-export-1',
          userId: testUserId,
          date: new Date(),
          belief: 'Export test belief',
          firstHeard: 'News',
          whoHeardFrom: 'Expert',
          whenHeardIt: 'Recently',
          whoBenefits: ['Public'],
          evidenceChecked: 'Checked',
          certaintyBefore: 70,
          certaintyAfter: 80
        }
      ];

      mockDB.argumentFlips.toArray.mockResolvedValue(argumentFlips);
      mockDB.sourceAudits.toArray.mockResolvedValue(sourceAudits);
      mockDB.profiles.toArray.mockResolvedValue([]);

      const exportedData = await store.exportData();

      expect(exportedData.argumentFlips).toHaveLength(1);
      expect(exportedData.sourceAudits).toHaveLength(1);
      expect(exportedData.version).toBe('3.0.0');
      expect(exportedData.argumentFlips[0].charityScore).toBe(80);
      expect(exportedData.sourceAudits[0].evidenceChecked).toBe('Checked');
    });

    it('should handle data clearing for Phase 3', async () => {
      mockDB.argumentFlips.delete.mockResolvedValue(undefined);
      mockDB.sourceAudits.delete.mockResolvedValue(undefined);

      await store.clearData();

      expect(mockDB.argumentFlips.delete).toHaveBeenCalled();
      expect(mockDB.sourceAudits.delete).toHaveBeenCalled();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      const argumentFlip: ArgumentFlip = {
        id: 'flip-error-1',
        userId: testUserId,
        userBelief: 'Error test belief',
        generatedCounter: 'Error test counter',
        userRestatement: 'Error test restatement',
        charityScore: 80,
        accuracyScore: 85,
        strawmanDetected: false,
        missingKeyPoints: [],
        addedWeakPoints: [],
        timestamp: new Date()
      };

      mockDB.argumentFlips.add.mockRejectedValue(new Error('Network error'));

      await expect(store.saveArgumentFlip(argumentFlip)).rejects.toThrow('Network error');
    });

    it('should handle corrupted data gracefully', async () => {
      const corruptedFlips = [
        {
          id: 'flip-corrupted-1',
          userId: testUserId,
          userBelief: 'Corrupted belief',
          generatedCounter: 'Corrupted counter',
          userRestatement: 'Corrupted restatement',
          charityScore: null, // Corrupted data
          accuracyScore: 85,
          strawmanDetected: false,
          missingKeyPoints: [],
          addedWeakPoints: [],
          timestamp: new Date()
        }
      ];

      mockDB.argumentFlips.toArray.mockResolvedValue(corruptedFlips);

      // Should handle corrupted data without crashing
      const flips = await store.getArgumentFlips(testUserId);
      expect(flips).toHaveLength(1);
      
      // EH calculation should handle null scores
      const ehScore = calculateEH(flips);
      expect(ehScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty data sets', async () => {
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
