// Comprehensive Dyslexia Risk Calculator
// Combines all test results to calculate overall risk score

import { enhancedRiskCalculator } from "./decisionTree.js"

/**
 * Calculate comprehensive dyslexia risk score from all available test results
 * @param {Object} testResults - Object containing all test results
 * @param {Object} demographics - User demographics (age, sex)
 * @returns {Object} Risk assessment with score, level, and details
 */
export function calculateDyslexiaRisk(testResults, demographics) {
  // Use enhanced decision tree calculator
  return enhancedRiskCalculator(testResults, demographics);
}

/**
 * Normalize test scores to 0-100 scale
 */
function normalizeTestScores(testResults, ageGroup) {
  const normalized = {};
  
  // Questionnaire score (already 0-maxPoints, convert to percentage)
  if (testResults.questionnaire) {
    const maxPoints = getMaxQuestionnairePoints(ageGroup);
    normalized.questionnaire = Math.min(100, (testResults.questionnaire.score / maxPoints) * 100);
  } else {
    normalized.questionnaire = 0;
  }
  
  // Phoneme score (correct/total, convert to percentage)
  if (testResults.phoneme) {
    normalized.phoneme = (testResults.phoneme.score / testResults.phoneme.total) * 100;
  } else {
    normalized.phoneme = 0;
  }
  
  // Pattern recognition score (correct/total, convert to percentage)
  if (testResults.pattern) {
    normalized.pattern = (testResults.pattern.score / testResults.pattern.total) * 100;
  } else {
    normalized.pattern = 0;
  }
  
  // Reading test - WPM and error rate combined
  if (testResults.reading) {
    const { wpm, errorCount, correctWords } = testResults.reading;
    const totalWords = correctWords + errorCount;
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
    
    // Normalize WPM based on age expectations
    const expectedWPM = getExpectedWPM(ageGroup);
    const wpmScore = Math.min(100, (wpm / expectedWPM) * 100);
    
    // Combine accuracy and speed (70% accuracy, 30% speed)
    normalized.reading = (accuracy * 0.7) + (wpmScore * 0.3);
  } else {
    normalized.reading = 0;
  }
  
  // Nonsense word test (if available)
  if (testResults.nonsense) {
    normalized.nonsense = (testResults.nonsense.score / testResults.nonsense.total) * 100;
  } else {
    normalized.nonsense = 0;
  }
  
  return normalized;
}

/**
 * Get age-appropriate weights for different test components
 */
function getWeightsForAgeGroup(ageGroup) {
  const weightProfiles = {
    // Emphasize skill measures; reduce questionnaire influence
    '3-5': { questionnaire: 0.2, phoneme: 0.4, pattern: 0.4, reading: 0.0, nonsense: 0.0 },
    '6-8': { questionnaire: 0.15, phoneme: 0.35, pattern: 0.2, reading: 0.3, nonsense: 0.0 },
    '9-12': { questionnaire: 0.1, phoneme: 0.3, pattern: 0.1, reading: 0.45, nonsense: 0.05 }
  };
  
  return weightProfiles[ageGroup] || weightProfiles['6-8'];
}

/**
 * Calculate weighted composite score
 */
function calculateWeightedScore(normalizedScores, weights) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(test => {
    if (normalizedScores[test] !== undefined) {
      weightedSum += normalizedScores[test] * weights[test];
      totalWeight += weights[test];
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Apply decision tree logic for risk classification
 */
function applyDecisionTree(testResults, normalizedScores, compositeScore, ageGroup) {
  // High-risk indicators
  const highRiskIndicators = [];
  const mediumRiskIndicators = [];
  
  // Check for high-risk patterns
  if (normalizedScores.questionnaire > 80) {
    highRiskIndicators.push('High questionnaire score');
  }
  
  if (normalizedScores.phoneme < 30) {
    highRiskIndicators.push('Poor phoneme performance');
  }
  
  if (normalizedScores.reading < 40) {
    highRiskIndicators.push('Poor reading performance');
  }
  
  if (normalizedScores.pattern < 30) {
    mediumRiskIndicators.push('Poor pattern recognition');
  }
  
  // Age-specific thresholds
  const thresholds = getRiskThresholds(ageGroup);
  
  let riskLevel;
  let confidence = 'medium';
  
  if (highRiskIndicators.length >= 2 || compositeScore > thresholds.high) {
    riskLevel = 'High Risk';
    confidence = 'high';
  } else if (highRiskIndicators.length >= 1 || mediumRiskIndicators.length >= 2 || compositeScore > thresholds.medium) {
    riskLevel = 'Medium Risk';
    confidence = 'medium';
  } else {
    riskLevel = 'Low Risk';
    confidence = 'high';
  }
  
  return {
    level: riskLevel,
    confidence,
    details: {
      indicators: [...highRiskIndicators, ...mediumRiskIndicators],
      compositeScore,
      thresholds
    }
  };
}

/**
 * Get risk thresholds based on age group
 */
function getRiskThresholds(ageGroup) {
  const thresholds = {
    '3-5': { low: 30, medium: 50, high: 70 },
    '6-8': { low: 25, medium: 45, high: 65 },
    '9-12': { low: 20, medium: 40, high: 60 }
  };
  
  return thresholds[ageGroup] || thresholds['6-8'];
}

/**
 * Get age group from age
 */
function getAgeGroup(age) {
  const a = Number(age);
  if (a >= 3 && a <= 5) return '3-5';
  if (a >= 6 && a <= 8) return '6-8';
  if (a >= 9 && a <= 12) return '9-12';
  return '6-8'; // default
}

/**
 * Get maximum questionnaire points for age group
 */
function getMaxQuestionnairePoints(ageGroup) {
  const maxPoints = {
    '3-5': 36,  // 18 questions * 2 points
    '6-8': 40,  // 20 questions * 2 points
    '9-12': 40  // 20 questions * 2 points
  };
  
  return maxPoints[ageGroup] || 40;
}

/**
 * Get expected WPM for age group
 */
function getExpectedWPM(ageGroup) {
  const expectedWPM = {
    '3-5': 20,   // Very limited reading ability
    '6-8': 60,   // Beginning reader
    '9-12': 120  // Fluent reader
  };
  
  return expectedWPM[ageGroup] || 60;
}

/**
 * Get recommendations based on risk level and age
 */
function getRecommendations(riskLevel, ageGroup) {
  const recommendations = {
    'High Risk': [
      'Consult with a qualified educational psychologist or dyslexia specialist',
      'Consider comprehensive educational assessment',
      'Implement targeted interventions immediately',
      'Monitor progress closely with regular assessments'
    ],
    'Medium Risk': [
      'Continue monitoring with regular assessments',
      'Implement preventive interventions',
      'Consider consultation with educational specialist',
      'Focus on strengthening identified weak areas'
    ],
    'Low Risk': [
      'Continue normal educational activities',
      'Monitor for any emerging difficulties',
      'Maintain supportive learning environment',
      'Regular check-ins recommended'
    ]
  };
  
  return recommendations[riskLevel] || recommendations['Low Risk'];
}

/**
 * Collect all test results from localStorage
 */
export function collectAllTestResults() {
  const results = {};
  
  try {
    // Questionnaire results
    const questionnaireData = localStorage.getItem('questionnaireResult');
    if (questionnaireData) {
      const parsed = JSON.parse(questionnaireData);
      if (parsed && parsed.score !== undefined) {
        results.questionnaire = parsed;
      }
    }
    
    // Pretest results (age 3-5)
    const pretest35 = localStorage.getItem('pretest_3_5');
    if (pretest35) {
      const parsed = JSON.parse(pretest35);
      if (parsed && parsed.score !== undefined && parsed.total !== undefined) {
        results.pattern = parsed;
      }
    }
    
    // Pretest results (age 6-8)
    const pretest68 = localStorage.getItem('pretest_6_8');
    if (pretest68) {
      const parsed = JSON.parse(pretest68);
      if (parsed && parsed.score !== undefined && parsed.total !== undefined) {
        results.pattern = parsed;
      }
    }
    
    // Phoneme results (age 6-8)
    const phoneme68 = localStorage.getItem('phoneme_6_8');
    if (phoneme68) {
      const parsed = JSON.parse(phoneme68);
      if (parsed && parsed.score !== undefined && parsed.total !== undefined) {
        results.phoneme = parsed;
      }
    }
    
    // Phoneme results (age 9-12)
    const phoneme912 = localStorage.getItem('phoneme_9_12');
    if (phoneme912) {
      const parsed = JSON.parse(phoneme912);
      if (parsed && parsed.score !== undefined && parsed.total !== undefined) {
        results.phoneme = parsed;
      }
    }
    
    // Reading results
    const readingData = localStorage.getItem('readingResult');
    if (readingData) {
      const parsed = JSON.parse(readingData);
      if (parsed && parsed.wpm !== undefined) {
        results.reading = parsed;
      }
    }
    
    // Nonsense word results (if available)
    const nonsenseData = localStorage.getItem('nonsenseResult');
    if (nonsenseData) {
      const parsed = JSON.parse(nonsenseData);
      if (parsed && parsed.score !== undefined && parsed.total !== undefined) {
        results.nonsense = parsed;
      }
    }
    
  } catch (error) {
    console.error('Error collecting test results:', error);
  }
  
  return results;
}

/**
 * Save comprehensive risk assessment to localStorage
 */
export function saveRiskAssessment(assessment) {
  try {
    localStorage.setItem('dyslexiaRiskAssessment', JSON.stringify({
      ...assessment,
      calculatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving risk assessment:', error);
  }
}
