// Test script to demonstrate the dyslexia risk calculation system
// This shows how the comprehensive risk assessment works

import { calculateDyslexiaRisk, collectAllTestResults } from './riskCalculator.js'

// Example test results for demonstration
const exampleTestResults = {
  questionnaire: {
    score: 15,
    level: 'Medium Risk',
    group: '6-8',
    maxPoints: 40
  },
  phoneme: {
    score: 1,
    total: 3
  },
  pattern: {
    score: 7,
    total: 10
  },
  reading: {
    wpm: 45,
    errorCount: 8,
    correctWords: 12
  }
}

const demographics = {
  age: 7,
  sex: 'Male'
}

// Calculate risk assessment
console.log('=== Dyslexia Risk Assessment Demo ===')
console.log('Test Results:', exampleTestResults)
console.log('Demographics:', demographics)

const riskAssessment = calculateDyslexiaRisk(exampleTestResults, demographics)

console.log('\n=== Risk Assessment Results ===')
console.log('Risk Level:', riskAssessment.riskLevel)
console.log('Composite Score:', riskAssessment.compositeScore)
console.log('Confidence:', riskAssessment.confidence)
console.log('Breakdown:', riskAssessment.breakdown)
console.log('Recommendations:', riskAssessment.recommendations)

// Demonstrate different scenarios
console.log('\n=== Different Risk Scenarios ===')

// High Risk Scenario
const highRiskResults = {
  questionnaire: { score: 35, level: 'High Risk', group: '6-8', maxPoints: 40 },
  phoneme: { score: 0, total: 3 },
  reading: { wpm: 25, errorCount: 15, correctWords: 5 }
}

const highRiskAssessment = calculateDyslexiaRisk(highRiskResults, demographics)
console.log('High Risk Scenario:', highRiskAssessment.riskLevel, '- Score:', highRiskAssessment.compositeScore)

// Low Risk Scenario
const lowRiskResults = {
  questionnaire: { score: 5, level: 'Low Risk', group: '6-8', maxPoints: 40 },
  phoneme: { score: 3, total: 3 },
  reading: { wpm: 80, errorCount: 2, correctWords: 18 }
}

const lowRiskAssessment = calculateDyslexiaRisk(lowRiskResults, demographics)
console.log('Low Risk Scenario:', lowRiskAssessment.riskLevel, '- Score:', lowRiskAssessment.compositeScore)

// Age-specific differences
console.log('\n=== Age-Specific Weighting ===')
const age3Results = { questionnaire: { score: 20, level: 'High Risk', group: '3-5', maxPoints: 36 } }
const age9Results = { questionnaire: { score: 20, level: 'High Risk', group: '9-12', maxPoints: 40 } }

const age3Assessment = calculateDyslexiaRisk(age3Results, { age: 4, sex: 'Female' })
const age9Assessment = calculateDyslexiaRisk(age9Results, { age: 10, sex: 'Female' })

console.log('Age 3-5 Assessment:', age3Assessment.riskLevel, '- Score:', age3Assessment.compositeScore)
console.log('Age 9-12 Assessment:', age9Assessment.riskLevel, '- Score:', age9Assessment.compositeScore)

export { exampleTestResults, riskAssessment }








