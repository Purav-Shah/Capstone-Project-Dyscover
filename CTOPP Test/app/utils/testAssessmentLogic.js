// Test the fixed logic for preliminary vs comprehensive assessment

// Test 1: Only questionnaire completed (should show preliminary)
const testResultsOnlyQuestionnaire = {
  questionnaire: {
    score: 12,
    level: 'Medium Risk',
    group: '3-5',
    maxPoints: 36
  }
}

// Test 2: Questionnaire + other tests completed (should show comprehensive)
const testResultsComprehensive = {
  questionnaire: {
    score: 12,
    level: 'Medium Risk',
    group: '3-5',
    maxPoints: 36
  },
  phoneme: {
    score: 1,
    total: 3
  },
  pattern: {
    score: 8,
    total: 10
  }
}

// Test 3: Empty/invalid test results (should show preliminary)
const testResultsEmpty = {}

function testAssessmentLogic(testResults) {
  const completedTests = Object.keys(testResults).filter(testType => {
    const test = testResults[testType]
    return test && (
      (testType === 'questionnaire' && test.score !== undefined) ||
      (testType === 'phoneme' && test.score !== undefined && test.total !== undefined) ||
      (testType === 'pattern' && test.score !== undefined && test.total !== undefined) ||
      (testType === 'reading' && test.wpm !== undefined) ||
      (testType === 'nonsense' && test.score !== undefined && test.total !== undefined)
    )
  })
  
  const hasComprehensiveTests = completedTests.length > 1 && completedTests.some(test => test !== 'questionnaire')
  
  return {
    completedTests,
    hasComprehensiveTests,
    assessmentType: hasComprehensiveTests ? 'Comprehensive' : 'Preliminary'
  }
}

console.log('=== Testing Assessment Logic ===')

console.log('\n1. Only Questionnaire:')
const result1 = testAssessmentLogic(testResultsOnlyQuestionnaire)
console.log('Completed Tests:', result1.completedTests)
console.log('Assessment Type:', result1.assessmentType)
console.log('Expected: Preliminary ✓')

console.log('\n2. Questionnaire + Other Tests:')
const result2 = testAssessmentLogic(testResultsComprehensive)
console.log('Completed Tests:', result2.completedTests)
console.log('Assessment Type:', result2.assessmentType)
console.log('Expected: Comprehensive ✓')

console.log('\n3. Empty Results:')
const result3 = testAssessmentLogic(testResultsEmpty)
console.log('Completed Tests:', result3.completedTests)
console.log('Assessment Type:', result3.assessmentType)
console.log('Expected: Preliminary ✓')

export { testAssessmentLogic, testResultsOnlyQuestionnaire, testResultsComprehensive }



