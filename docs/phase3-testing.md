# Phase 3 Testing Documentation

## Overview

Phase 3 testing ensures the reliability and correctness of the advanced metacognitive modules (Argument Flip and Source Audit) and their integration with the existing Reflector system.

## Test Structure

### 1. Unit Tests (`src/__tests__/phase3.test.ts`)
**Purpose:** Test individual functions and components in isolation.

**Coverage:**
- EH (Epistemic Honesty) scoring calculations
- II (Intellectual Independence) scoring calculations
- Source audit pattern analysis
- Badge condition validation
- Edge case handling

**Key Test Cases:**
```typescript
// EH Scoring
calculateEH(argumentFlips) // Returns average of charity and accuracy scores
calculateEH([]) // Returns 0 for empty array
calculateEH([strawmanFlip]) // Returns low score for strawmanning

// II Scoring  
calculateII(sourceAudits) // Returns score based on source diversity and evidence checking
calculateII([]) // Returns 0 for empty array
calculateII(dependentAudits) // Returns low score for high dependency

// Pattern Analysis
analyzeAuditPatterns(audits) // Returns dependency level, top sources, beneficiary patterns
```

### 2. Integration Tests (`src/__tests__/phase3-integration.test.ts`)
**Purpose:** Test the interaction between Phase 3 modules and the existing system.

**Coverage:**
- Argument Flip module integration with storage
- Source Audit module integration with storage
- Progress Dashboard integration
- Data export integration
- Badge system integration
- Error handling integration

**Key Test Scenarios:**
```typescript
// Module Integration
store.saveArgumentFlip(flip) // Saves to IndexedDB
store.getArgumentFlips(userId) // Retrieves from IndexedDB
calculateEH(flips) // Calculates score from stored data

// Dashboard Integration
loadPhase3Data() // Loads EH/II scores for display
updateConstructRadar(scores) // Updates radar chart with new constructs

// Badge Integration
BadgeEngine.checkAndUnlockBadges(userId, store) // Checks Phase 3 badge conditions
```

### 3. End-to-End Tests (`src/__tests__/phase3-e2e.test.ts`)
**Purpose:** Test complete user journeys through Phase 3 modules.

**Coverage:**
- Complete Argument Flip workflow
- Complete Source Audit workflow
- Complete Phase 3 journey (both modules)
- Data export and persistence
- Error recovery and edge cases

**Key User Journeys:**
```typescript
// Argument Flip Journey
1. User inputs belief
2. System generates counter-argument
3. User restates counter-argument
4. System scores charity and accuracy
5. System detects strawmanning
6. System saves to storage
7. System unlocks badges
8. Dashboard displays EH score

// Source Audit Journey
1. User answers provenance questions
2. System saves audit entry
3. System analyzes patterns after 7+ entries
4. System calculates II score
5. System unlocks badges
6. Dashboard displays II score
```

## Test Data

### Mock Argument Flips
```typescript
const goodFlip: ArgumentFlip = {
  id: 'flip-1',
  userId: 'test-user',
  userBelief: 'Social media is harmful',
  generatedCounter: 'Social media enables global connection',
  userRestatement: 'Social media enables global connection, though it may have negative effects',
  charityScore: 85,
  accuracyScore: 90,
  strawmanDetected: false,
  missingKeyPoints: [],
  addedWeakPoints: [],
  timestamp: new Date()
};

const strawmanFlip: ArgumentFlip = {
  id: 'flip-2',
  userId: 'test-user',
  userBelief: 'Climate change is real',
  generatedCounter: 'Climate change is a hoax perpetrated by scientists',
  userRestatement: 'Climate change is a hoax perpetrated by scientists',
  charityScore: 20,
  accuracyScore: 15,
  strawmanDetected: true,
  missingKeyPoints: ['Scientific consensus'],
  addedWeakPoints: ['Funding conspiracy'],
  timestamp: new Date()
};
```

### Mock Source Audits
```typescript
const diverseAudit: SourceAudit = {
  id: 'audit-1',
  userId: 'test-user',
  date: new Date(),
  belief: 'Coffee is good for health',
  firstHeard: 'News article',
  whoHeardFrom: 'Dr. Smith, nutritionist',
  whenHeardIt: 'Last week',
  whoBenefits: ['Coffee industry', 'Health researchers'],
  evidenceChecked: 'Found multiple peer-reviewed studies',
  certaintyBefore: 70,
  certaintyAfter: 85
};

const dependentAudit: SourceAudit = {
  id: 'audit-2',
  userId: 'test-user',
  date: new Date(),
  belief: 'Belief from social media',
  firstHeard: 'Social media',
  whoHeardFrom: 'John Doe',
  whenHeardIt: 'Yesterday',
  whoBenefits: ['Tech companies'],
  evidenceChecked: 'Not checked',
  certaintyBefore: 80,
  certaintyAfter: 80
};
```

## Running Tests

### All Phase 3 Tests
```bash
npm run test:phase3
```

### Specific Test Suites
```bash
npm run test:phase3:unit          # Unit tests only
npm run test:phase3:integration   # Integration tests only
npm run test:phase3:e2e          # End-to-end tests only
```

### Test Utilities
```bash
npm run test:phase3:check         # Check test files exist
npm run test:phase3:report        # Generate test report
```

### Individual Test Files
```bash
npx jest src/__tests__/phase3.test.ts --verbose
npx jest src/__tests__/phase3-integration.test.ts --verbose
npx jest src/__tests__/phase3-e2e.test.ts --verbose
```

## Test Coverage

### Expected Coverage
- **Unit Tests:** 100% function coverage
- **Integration Tests:** 90%+ integration coverage
- **E2E Tests:** 80%+ user journey coverage

### Coverage Reports
```bash
npm run test:phase3 --coverage
```

## Test Scenarios

### 1. Argument Flip Module

#### Happy Path
1. User inputs belief
2. System generates counter-argument
3. User restates counter-argument charitably
4. System scores high charity and accuracy
5. System saves to storage
6. System unlocks steelman_initiate badge
7. Dashboard displays EH score

#### Strawmanning Detection
1. User inputs belief
2. System generates counter-argument
3. User restates counter-argument as strawman
4. System detects strawmanning
5. System scores low charity and accuracy
6. System records missing key points
7. System records added weak points

#### Error Handling
1. User inputs belief
2. System generates counter-argument
3. Storage save fails
4. System handles error gracefully
5. User sees error message
6. Data is not lost

### 2. Source Audit Module

#### Diverse Sources
1. User completes 7+ audits
2. Each audit has different source
3. Each audit has evidence checking
4. System calculates high II score
5. System unlocks source_detective badge
6. System unlocks independent_thinker badge

#### Source Dependency
1. User completes 7+ audits
2. All audits from same source
3. No evidence checking
4. System calculates low II score
5. System detects high dependency
6. System provides feedback

#### Error Handling
1. User completes audit
2. Storage save fails
3. System handles error gracefully
4. User sees error message
5. Data is not lost

### 3. Progress Dashboard

#### EH Score Display
1. User completes Argument Flips
2. System calculates EH score
3. Dashboard displays EH score
4. Dashboard shows progress bar
5. Dashboard shows flip count

#### II Score Display
1. User completes Source Audits
2. System calculates II score
3. Dashboard displays II score
4. Dashboard shows progress bar
5. Dashboard shows audit count

#### Empty Data Handling
1. User has no Phase 3 data
2. Dashboard handles gracefully
3. Dashboard shows 0 scores
4. Dashboard shows 0 counts

### 4. Badge System

#### Badge Unlocking
1. User meets badge conditions
2. System checks badge conditions
3. System unlocks badge
4. System saves badge to storage
5. Dashboard displays badge

#### Badge Conditions
- **steelman_initiate:** First Argument Flip with 60+ charity score
- **intellectual_honesty:** 5 Argument Flips with 70+ average charity
- **source_detective:** 7 consecutive days of Source Audits
- **independent_thinker:** Low source dependency + high evidence checking (II > 75)

### 5. Data Export

#### Complete Export
1. User has Phase 3 data
2. User requests export
3. System exports all data
4. System includes Phase 3 data
5. System sets version to 3.0.0

#### Empty Export
1. User has no Phase 3 data
2. User requests export
3. System exports empty arrays
4. System sets version to 3.0.0

## Test Assertions

### EH Scoring Assertions
```typescript
expect(ehScore).toBeGreaterThan(70); // Good charity
expect(ehScore).toBeLessThan(30);    // Poor charity
expect(ehScore).toBe(0);             // No data
```

### II Scoring Assertions
```typescript
expect(iiScore).toBeGreaterThan(75); // High independence
expect(iiScore).toBeLessThan(30);    // Low independence
expect(iiScore).toBe(0);             // No data
```

### Badge Assertions
```typescript
expect(badges.some(b => b.id === 'steelman_initiate')).toBe(true);
expect(badges.some(b => b.id === 'intellectual_honesty')).toBe(true);
expect(badges.some(b => b.id === 'source_detective')).toBe(true);
expect(badges.some(b => b.id === 'independent_thinker')).toBe(true);
```

### Data Persistence Assertions
```typescript
expect(savedFlips).toHaveLength(5);
expect(savedAudits).toHaveLength(7);
expect(exportedData.version).toBe('3.0.0');
expect(exportedData.argumentFlips).toHaveLength(5);
expect(exportedData.sourceAudits).toHaveLength(7);
```

## Debugging Tests

### Common Issues

#### Mock Setup
```typescript
// Ensure mocks are properly configured
mockDB.argumentFlips.add.mockResolvedValue(undefined);
mockDB.argumentFlips.toArray.mockResolvedValue(mockData);
```

#### Async/Await
```typescript
// Use proper async/await patterns
const result = await store.saveArgumentFlip(flip);
expect(result).toBeDefined();
```

#### Data Validation
```typescript
// Validate data structure
expect(flip.charityScore).toBeGreaterThanOrEqual(0);
expect(flip.charityScore).toBeLessThanOrEqual(100);
```

### Debug Commands
```bash
# Run with debug output
npx jest src/__tests__/phase3.test.ts --verbose --no-cache

# Run specific test
npx jest src/__tests__/phase3.test.ts -t "should calculate EH score"

# Run with coverage
npx jest src/__tests__/phase3.test.ts --coverage
```

## Continuous Integration

### GitHub Actions
```yaml
name: Phase 3 Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:phase3
```

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
echo "npm run test:phase3" > .husky/pre-commit
chmod +x .husky/pre-commit
```

## Test Maintenance

### Regular Updates
- Update test data monthly
- Review test coverage quarterly
- Update mock data when APIs change
- Add new test cases for new features

### Performance Monitoring
- Monitor test execution time
- Optimize slow tests
- Remove redundant tests
- Update test data size

### Documentation Updates
- Update test documentation with new features
- Document new test scenarios
- Update debugging guides
- Maintain test data examples

## Conclusion

Phase 3 testing ensures the reliability and correctness of the advanced metacognitive modules. The comprehensive test suite covers unit tests, integration tests, and end-to-end tests, providing confidence in the system's functionality and data integrity.

The test suite is designed to be maintainable, debuggable, and comprehensive, ensuring that Phase 3 modules work correctly both in isolation and as part of the larger Reflector system.
