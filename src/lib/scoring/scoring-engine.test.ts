/**
 * Unit tests for Reflector Scoring Engine
 * Run with: npm test or vitest
 */

import { describe, it, expect } from 'vitest';
import {
  calculateScores,
  exportScoresCSV,
  generateSummary,
  type UserResponse
} from './scoring-engine';

// Test data generators
function generateMockResponses(
  userId: string = 'test_user_001',
  pattern: 'high' | 'low' | 'mixed' = 'high'
): UserResponse[] {
  const baseTime = new Date('2025-01-15T10:00:00Z');
  
  const responses: UserResponse[] = [];
  
  // Generate responses for all 36 items
  const itemIds = [
    // EAI items (12)
    'eai_01', 'eai_02', 'eai_03', 'eai_04', 'eai_05', 'eai_06',
    'eai_07', 'eai_08', 'eai_09', 'eai_10', 'eai_11', 'eai_12',
    // RF items (8)
    'rf_01', 'rf_02', 'rf_03', 'rf_04', 'rf_05', 'rf_06', 'rf_07', 'rf_08',
    // SA items (8)
    'sa_01', 'sa_02', 'sa_03', 'sa_04', 'sa_05', 'sa_06', 'sa_07', 'sa_08',
    // ARD items (8)
    'ard_01', 'ard_02', 'ard_03', 'ard_04', 'ard_05', 'ard_06', 'ard_07', 'ard_08'
  ];

  itemIds.forEach((itemId, index) => {
    let value: number;
    
    if (pattern === 'high') {
      // High autonomy: 6-7 for forward items, 1-2 for reverse items
      value = itemId.includes('02') || itemId.includes('04') || itemId.includes('06') ? 2 : 6;
    } else if (pattern === 'low') {
      // Low autonomy: 1-2 for forward items, 6-7 for reverse items
      value = itemId.includes('02') || itemId.includes('04') || itemId.includes('06') ? 6 : 2;
    } else {
      // Mixed: moderate scores 3-5
      value = 4;
    }

    responses.push({
      userId,
      assessmentId: 'baseline_mirror_v1',
      itemId,
      value,
      timestamp: new Date(baseTime.getTime() + index * 15000) // 15 sec per item
    });
  });

  return responses;
}

describe('Scoring Engine', () => {
  describe('calculateScores', () => {
    it('should calculate high autonomy scores correctly', () => {
      const responses = generateMockResponses('user_high', 'high');
      const result = calculateScores(responses);

      expect(result.scores.EAI.raw).toBeGreaterThan(70);
      expect(result.scores.RF.raw).toBeGreaterThan(70);
      expect(result.scores.SA.raw).toBeGreaterThan(70);
      expect(result.scores.ARD.raw).toBeGreaterThan(70);
      expect(result.composite_autonomy).toBeGreaterThan(70);
    });

    it('should calculate low autonomy scores correctly', () => {
      const responses = generateMockResponses('user_low', 'low');
      const result = calculateScores(responses);

      expect(result.scores.EAI.raw).toBeLessThan(30);
      expect(result.scores.RF.raw).toBeLessThan(30);
      expect(result.scores.SA.raw).toBeLessThan(30);
      expect(result.scores.ARD.raw).toBeLessThan(30);
      expect(result.composite_autonomy).toBeLessThan(30);
    });

    it('should calculate moderate scores correctly', () => {
      const responses = generateMockResponses('user_mixed', 'mixed');
      const result = calculateScores(responses);

      expect(result.scores.EAI.raw).toBeGreaterThanOrEqual(40);
      expect(result.scores.EAI.raw).toBeLessThanOrEqual(60);
      expect(result.composite_autonomy).toBeGreaterThanOrEqual(40);
      expect(result.composite_autonomy).toBeLessThanOrEqual(60);
    });

    it('should handle reverse-coded items correctly', () => {
      // Create responses where reverse items get high scores
      const responses: UserResponse[] = [
        {
          userId: 'test',
          assessmentId: 'test',
          itemId: 'eai_01', // forward coded
          value: 7, // high autonomy
          timestamp: new Date()
        },
        {
          userId: 'test',
          assessmentId: 'test',
          itemId: 'eai_02', // reverse coded
          value: 1, // should also indicate high autonomy
          timestamp: new Date()
        }
      ];

      const result = calculateScores(responses);
      
      // Both should contribute to high EAI
      expect(result.scores.EAI.raw).toBeGreaterThan(80);
    });

    it('should calculate confidence intervals', () => {
      const responses = generateMockResponses('user_ci_test', 'high');
      const result = calculateScores(responses);

      // CI should exist
      expect(result.scores.EAI.ci_lower).toBeDefined();
      expect(result.scores.EAI.ci_upper).toBeDefined();
      
      // CI should be reasonable (lower < raw < upper)
      expect(result.scores.EAI.ci_lower).toBeLessThanOrEqual(result.scores.EAI.raw);
      expect(result.scores.EAI.ci_upper).toBeGreaterThanOrEqual(result.scores.EAI.raw);
      
      // CI width should be positive
      expect(result.scores.EAI.ci_width).toBeGreaterThan(0);
    });

    it('should interpret scores into categories', () => {
      const highResponses = generateMockResponses('user_high', 'high');
      const lowResponses = generateMockResponses('user_low', 'low');
      const mixedResponses = generateMockResponses('user_mixed', 'mixed');

      const highResult = calculateScores(highResponses);
      const lowResult = calculateScores(lowResponses);
      const mixedResult = calculateScores(mixedResponses);

      expect(highResult.interpretation.EAI).toBe('high');
      expect(lowResult.interpretation.EAI).toBe('low');
      expect(mixedResult.interpretation.EAI).toBe('moderate');
    });

    it('should calculate completion percentage', () => {
      const fullResponses = generateMockResponses('user_full', 'high');
      const partialResponses = fullResponses.slice(0, 18); // 50%

      const fullResult = calculateScores(fullResponses);
      const partialResult = calculateScores(partialResponses);

      expect(fullResult.completion_percentage).toBe(100);
      expect(partialResult.completion_percentage).toBe(50);
    });
  });

  describe('Response Integrity Checks', () => {
    it('should detect straightlining', () => {
      const straightlineResponses = generateMockResponses('user_straight', 'high').map(r => ({
        ...r,
        value: 4 // all responses are 4
      }));

      const result = calculateScores(straightlineResponses);
      expect(result.response_integrity.straightlining).toBe(true);
    });

    it('should detect acquiescence bias', () => {
      const extremeResponses = generateMockResponses('user_extreme', 'high').map(r => ({
        ...r,
        value: 7 // all strongly agree
      }));

      const result = calculateScores(extremeResponses);
      expect(result.response_integrity.acquiescence_bias).toBeGreaterThan(0.8);
    });

    it('should flag suspiciously fast completion', () => {
      const baseTime = new Date();
      const fastResponses = generateMockResponses('user_fast', 'high').map((r, i) => ({
        ...r,
        timestamp: new Date(baseTime.getTime() + i * 500) // 0.5 sec per item
      }));

      const result = calculateScores(fastResponses);
      expect(result.response_integrity.completion_time_flag).toBe(true);
    });
  });

  describe('Export Functions', () => {
    it('should export scores to CSV format', () => {
      const responses = generateMockResponses('user_export', 'high');
      const result = calculateScores(responses);
      const csv = exportScoresCSV(result);

      expect(csv).toContain('Construct,Score,CI_Lower,CI_Upper');
      expect(csv).toContain('EAI,');
      expect(csv).toContain('RF,');
      expect(csv).toContain('SA,');
      expect(csv).toContain('ARD,');
    });

    it('should generate human-readable summary', () => {
      const responses = generateMockResponses('user_summary', 'high');
      const result = calculateScores(responses);
      const summary = generateSummary(result);

      expect(summary).toContain('REFLECTOR AUTONOMY PROFILE');
      expect(summary).toContain('COMPOSITE AUTONOMY:');
      expect(summary).toContain('EAI:');
      expect(summary).toContain('95% CI:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responses gracefully', () => {
      const result = calculateScores([]);
      
      expect(result.scores.EAI.raw).toBe(0);
      expect(result.composite_autonomy).toBe(0);
      expect(result.completion_percentage).toBe(0);
    });

    it('should handle partial construct completion', () => {
      // Only answer EAI items
      const partialResponses: UserResponse[] = [
        {
          userId: 'test',
          assessmentId: 'test',
          itemId: 'eai_01',
          value: 7,
          timestamp: new Date()
        },
        {
          userId: 'test',
          assessmentId: 'test',
          itemId: 'eai_03',
          value: 6,
          timestamp: new Date()
        }
      ];

      const result = calculateScores(partialResponses);
      
      expect(result.scores.EAI.raw).toBeGreaterThan(0);
      expect(result.scores.RF.raw).toBe(0); // no RF items answered
    });

    it('should be deterministic (same input = same output)', () => {
      const responses = generateMockResponses('user_deterministic', 'high');
      
      const result1 = calculateScores(responses);
      const result2 = calculateScores(responses);

      // Remove timestamp from comparison (it's always new Date())
      const { timestamp: t1, ...rest1 } = result1;
      const { timestamp: t2, ...rest2 } = result2;

      // Scores should be identical
      expect(rest1.scores.EAI.raw).toBe(rest2.scores.EAI.raw);
      expect(rest1.composite_autonomy).toBe(rest2.composite_autonomy);
    });
  });

  describe('Composite Autonomy Calculation', () => {
    it('should weight EAI at 60% and RF at 40%', () => {
      const responses = generateMockResponses('user_composite', 'high');
      const result = calculateScores(responses);

      const expected = Math.round(result.scores.EAI.raw * 0.6 + result.scores.RF.raw * 0.4);
      expect(result.composite_autonomy).toBe(expected);
    });
  });
});
