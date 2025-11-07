// Test the risk calculation for a 5-year-old
// This demonstrates the preliminary assessment flow

// Simulate questionnaire results for a 5-year-old
const testResults5yo = {
  questionnaire: {
    score: 12, // Medium risk score
    level: 'Medium Risk',
    group: '3-5',
    maxPoints: 36
  }
  // No other tests completed yet (preliminary assessment)
}

const demographics5yo = {
  age: 5,
  sex: 'Female'
}

console.log('=== 5-Year-Old Preliminary Assessment Test ===')
console.log('Test Results:', testResults5yo)
console.log('Demographics:', demographics5yo)

// Test the preliminary assessment logic
const questionnaireData = testResults5yo.questionnaire
const preliminaryAssessment = {
  compositeScore: questionnaireData ? Math.round((questionnaireData.score / (questionnaireData.maxPoints || 40)) * 100) : 0,
  riskLevel: questionnaireData?.level || 'Unknown',
  confidence: 'preliminary',
  details: { 
    indicators: ['Preliminary assessment based on questionnaire only'],
    note: 'Complete additional tests for comprehensive assessment'
  },
  breakdown: {
    questionnaire: questionnaireData ? Math.round((questionnaireData.score / (questionnaireData.maxPoints || 40)) * 100) : 0
  },
  recommendations: [
    'This is a preliminary assessment based on questionnaire responses',
    'Complete phoneme, pattern, and reading tests for accurate risk evaluation',
    'Return to view comprehensive results after completing all tests'
  ],
  isPreliminary: true
}

console.log('\n=== Preliminary Assessment Results ===')
console.log('Risk Level:', preliminaryAssessment.riskLevel)
console.log('Score:', preliminaryAssessment.compositeScore + '/100')
console.log('Confidence:', preliminaryAssessment.confidence)
console.log('Is Preliminary:', preliminaryAssessment.isPreliminary)
console.log('Recommendations:', preliminaryAssessment.recommendations)

// Test what happens when more tests are completed
const comprehensiveResults5yo = {
  questionnaire: {
    score: 12,
    level: 'Medium Risk',
    group: '3-5',
    maxPoints: 36
  },
  pattern: {
    score: 8, // Good pattern recognition
    total: 10
  },
  phoneme: {
    score: 1, // Poor phoneme performance
    total: 3
  }
}

console.log('\n=== Comprehensive Assessment (with additional tests) ===')
console.log('Additional Test Results:', comprehensiveResults5yo)

// This would trigger comprehensive assessment
const hasMultipleTests = Object.keys(comprehensiveResults5yo).length > 1
console.log('Has Multiple Tests:', hasMultipleTests)
console.log('Would trigger comprehensive assessment:', hasMultipleTests)

export { testResults5yo, preliminaryAssessment, comprehensiveResults5yo }








