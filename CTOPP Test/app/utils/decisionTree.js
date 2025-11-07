// Decision Tree Visualization Component
// Shows the decision-making process for dyslexia risk assessment

export function DecisionTreeVisualization({ testResults, riskAssessment, applicableTests }) {
  if (!testResults || !riskAssessment) return null;

  const include = (id) => {
    if (!applicableTests || applicableTests.length === 0) return true;
    return applicableTests.includes(id);
  };

  const baseNodes = [
    {
      id: 'root',
      title: 'Dyslexia Risk Assessment',
      description: 'Comprehensive evaluation based on multiple test results',
      type: 'root',
      condition: ''
    },
    {
      id: 'questionnaire',
      title: 'Questionnaire Score',
      condition: testResults.questionnaire ? `${testResults.questionnaire.score}/${testResults.questionnaire.maxPoints || 40}` : 'Not completed',
      threshold: 'High if >80%',
      type: 'test'
    },
    {
      id: 'phoneme',
      title: 'Phoneme Performance',
      condition: testResults.phoneme ? `${Math.round((testResults.phoneme.score / testResults.phoneme.total) * 100)}%` : 'Not completed',
      threshold: 'High risk if <30%',
      type: 'test'
    },
    {
      id: 'reading',
      title: 'Reading Performance',
      condition: testResults.reading ? `${testResults.reading.wpm} WPM, ${testResults.reading.errorCount} errors` : 'Not completed',
      threshold: 'High risk if <40%',
      type: 'test'
    },
    {
      id: 'pattern',
      title: 'Pattern Recognition',
      condition: testResults.pattern ? `${Math.round((testResults.pattern.score / testResults.pattern.total) * 100)}%` : 'Not completed',
      threshold: 'Medium risk if <30%',
      type: 'test'
    },
    {
      id: 'composite',
      title: 'Composite Score',
      condition: `${riskAssessment.compositeScore}/100`,
      threshold: 'Age-specific thresholds',
      type: 'calculation'
    },
    {
      id: 'decision',
      title: 'Final Risk Level',
      condition: riskAssessment.riskLevel,
      threshold: 'Based on indicators and composite score',
      type: 'result'
    }
  ];

  // Filter out inapplicable test nodes
  const decisionNodes = baseNodes.filter(node => {
    if (['root', 'composite', 'decision'].includes(node.id)) return true;
    return include(node.id);
  });

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'root': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'test': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'calculation': return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'result': 
        return riskAssessment.riskLevel === 'High Risk' ? 'bg-red-100 border-red-300 text-red-800' :
               riskAssessment.riskLevel === 'Medium Risk' ? 'bg-orange-100 border-orange-300 text-orange-800' :
               'bg-green-100 border-green-300 text-green-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  };

  const getRiskIndicators = () => {
    const indicators = [];
    
    if (testResults.questionnaire && testResults.questionnaire.score > (testResults.questionnaire.maxPoints || 40) * 0.8) {
      indicators.push('High questionnaire score');
    }
    
    if (testResults.phoneme && (testResults.phoneme.score / testResults.phoneme.total) < 0.3) {
      indicators.push('Poor phoneme performance');
    }
    
    if (testResults.reading && testResults.reading.wpm < 40) {
      indicators.push('Poor reading performance');
    }
    
    if (testResults.pattern && (testResults.pattern.score / testResults.pattern.total) < 0.3) {
      indicators.push('Poor pattern recognition');
    }
    
    return indicators;
  };

  // Generate HTML string instead of JSX
  const generateDecisionTreeHTML = () => {
    const nodesHTML = decisionNodes.map((node, index) => {
      const connectionLine = index > 0 ? '<div class="absolute -top-2 left-6 w-0.5 h-4 bg-gray-300"></div>' : '';
      const nodeColor = getNodeColor(node);
      
      return `
        <div class="relative">
          ${connectionLine}
          <div class="p-4 rounded-lg border-2 ${nodeColor}">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold">${node.title}</h4>
                <p class="text-sm opacity-75">${node.description || node.condition}</p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold">${node.condition}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const indicators = getRiskIndicators();
    const indicatorsHTML = indicators.length > 0 
      ? indicators.map(indicator => `
          <div class="text-sm text-red-600 flex items-center">
            <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            ${indicator}
          </div>
        `).join('')
      : `
        <div class="text-sm text-green-600 flex items-center">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          No high-risk indicators detected
        </div>
      `;

    return `
      <div class="bg-white rounded-2xl p-6 shadow-lg">
        <h3 class="text-xl font-bold mb-6 text-gray-800">Decision Tree Process</h3>
        
        <div class="space-y-4">
          ${nodesHTML}
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-semibold mb-2 text-gray-800">Risk Indicators Detected:</h4>
          <div class="space-y-1">
            ${indicatorsHTML}
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold mb-2 text-blue-800">Decision Logic:</h4>
          <div class="text-sm text-blue-700 space-y-1">
            <p>• High Risk: 2+ high-risk indicators OR composite score > threshold</p>
            <p>• Medium Risk: 1+ high-risk indicators OR 2+ medium-risk indicators</p>
            <p>• Low Risk: No significant indicators detected</p>
            <p>• Weights adjusted by age group (3-5, 6-8, 9-12)</p>
          </div>
        </div>
      </div>
    `;
  };

  // Return an object with HTML string and data for React components to use
  return {
    html: generateDecisionTreeHTML(),
    data: {
      decisionNodes,
      riskIndicators: getRiskIndicators(),
      riskAssessment
    }
  };
}

// Enhanced Risk Calculator with Decision Tree Logic
export function enhancedRiskCalculator(testResults, demographics) {
  const { age, sex } = demographics;
  const ageGroup = getAgeGroup(age);
  
  // Step 1: Collect and normalize scores
  const normalizedScores = normalizeTestScores(testResults, ageGroup);
  
  // Step 2: Apply decision tree logic
  const decisionTreeResult = applyDecisionTreeLogic(testResults, normalizedScores, ageGroup);
  
  // Step 3: Calculate weighted composite score
  const weights = getWeightsForAgeGroup(ageGroup);
  const compositeScore = calculateWeightedScore(normalizedScores, weights);
  
  // Step 4: Final risk classification
  const finalRisk = classifyFinalRisk(decisionTreeResult, compositeScore, ageGroup);
  
  return {
    compositeScore: Math.round(compositeScore * 100) / 100,
    riskLevel: finalRisk.level,
    confidence: finalRisk.confidence,
    details: finalRisk.details,
    decisionTree: decisionTreeResult,
    breakdown: {
      questionnaire: normalizedScores.questionnaire,
      phoneme: normalizedScores.phoneme,
      pattern: normalizedScores.pattern,
      reading: normalizedScores.reading,
      nonsense: normalizedScores.nonsense
    },
    recommendations: getRecommendations(finalRisk.level, ageGroup)
  };
}

function applyDecisionTreeLogic(testResults, normalizedScores, ageGroup) {
  const highRiskIndicators = [];
  const mediumRiskIndicators = [];
  const lowRiskIndicators = [];
  
  const applicable = getApplicableTests(ageGroup);
  const has = (key) => Boolean(testResults && testResults[key] !== undefined);

  // High-risk indicators
  if (has('questionnaire') && normalizedScores.questionnaire > 80) {
    highRiskIndicators.push('High questionnaire score (>80%)');
  }
  
  if (applicable.includes('phoneme') && has('phoneme') && normalizedScores.phoneme < 30) {
    highRiskIndicators.push('Poor phoneme performance (<30%)');
  }
  
  if (applicable.includes('reading') && has('reading') && normalizedScores.reading < 40) {
    highRiskIndicators.push('Poor reading performance (<40%)');
  }
  
  // Medium-risk indicators
  if (applicable.includes('pattern') && has('pattern') && normalizedScores.pattern < 30) {
    mediumRiskIndicators.push('Poor pattern recognition (<30%)');
  }
  
  if (has('questionnaire') && normalizedScores.questionnaire > 60 && normalizedScores.questionnaire <= 80) {
    mediumRiskIndicators.push('Moderate questionnaire score (60-80%)');
  }
  
  // Low-risk indicators
  if (has('questionnaire') && normalizedScores.questionnaire < 30) {
    lowRiskIndicators.push('Low questionnaire score (<30%)');
  }
  
  if (applicable.includes('phoneme') && has('phoneme') && normalizedScores.phoneme > 70) {
    lowRiskIndicators.push('Good phoneme performance (>70%)');
  }
  
  if (applicable.includes('reading') && has('reading') && normalizedScores.reading > 70) {
    lowRiskIndicators.push('Good reading performance (>70%)');
  }
  
  return {
    highRiskIndicators,
    mediumRiskIndicators,
    lowRiskIndicators,
    totalHighRisk: highRiskIndicators.length,
    totalMediumRisk: mediumRiskIndicators.length,
    totalLowRisk: lowRiskIndicators.length
  };
}

function classifyFinalRisk(decisionTreeResult, compositeScore, ageGroup) {
  const thresholds = getRiskThresholds(ageGroup);
  
  let riskLevel;
  let confidence = 'medium';
  
  // Decision tree logic (higher composite => lower risk)
  if (decisionTreeResult.totalHighRisk >= 2) {
    riskLevel = 'High Risk';
    confidence = 'high';
  } else if (decisionTreeResult.totalHighRisk >= 1 || decisionTreeResult.totalMediumRisk >= 2) {
    riskLevel = 'Medium Risk';
    confidence = 'medium';
  } else if (compositeScore >= thresholds.high) {
    riskLevel = 'Low Risk';
    confidence = 'high';
  } else if (compositeScore >= thresholds.medium) {
    riskLevel = 'Medium Risk';
    confidence = 'medium';
  } else {
    riskLevel = 'High Risk';
    confidence = 'medium';
  }
  
  return {
    level: riskLevel,
    confidence,
    details: {
      indicators: [...decisionTreeResult.highRiskIndicators, ...decisionTreeResult.mediumRiskIndicators],
      compositeScore,
      thresholds,
      decisionTreeResult
    }
  };
}

// Helper functions (reused from main risk calculator)
function getAgeGroup(age) {
  const a = Number(age);
  if (a >= 3 && a <= 5) return '3-5';
  if (a >= 6 && a <= 8) return '6-8';
  if (a >= 9 && a <= 12) return '9-12';
  return '6-8';
}

function normalizeTestScores(testResults, ageGroup) {
  const normalized = {};
  
  if (testResults.questionnaire) {
    const maxPoints = getMaxQuestionnairePoints(ageGroup);
    normalized.questionnaire = Math.min(100, (testResults.questionnaire.score / maxPoints) * 100);
  } else {
    normalized.questionnaire = 0;
  }
  
  if (testResults.pretest) {
    normalized.pretest = (testResults.pretest.score / testResults.pretest.total) * 100;
  } else {
    normalized.pretest = 0;
  }
  
  if (testResults.phoneme) {
    normalized.phoneme = (testResults.phoneme.score / testResults.phoneme.total) * 100;
  } else {
    normalized.phoneme = 0;
  }
  
  if (testResults.pattern) {
    normalized.pattern = (testResults.pattern.score / testResults.pattern.total) * 100;
  } else {
    normalized.pattern = 0;
  }
  
  if (testResults.reading) {
    const { wpm, errorCount, correctWords } = testResults.reading;
    const totalWords = correctWords + errorCount;
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
    const expectedWPM = getExpectedWPM(ageGroup);
    const wpmScore = Math.min(100, (wpm / expectedWPM) * 100);
    normalized.reading = (accuracy * 0.7) + (wpmScore * 0.3);
  } else {
    normalized.reading = 0;
  }
  
  if (testResults.nonsense) {
    normalized.nonsense = (testResults.nonsense.score / testResults.nonsense.total) * 100;
  } else {
    normalized.nonsense = 0;
  }
  
  return normalized;
}

function getWeightsForAgeGroup(ageGroup) {
  const weightProfiles = {
    // Emphasize age-appropriate skills; reduce questionnaire influence
    // 3-5: use pretest + phoneme + nonsense; pattern/reading not applicable
    '3-5': { questionnaire: 0.2, pretest: 0.4, phoneme: 0.25, nonsense: 0.15, pattern: 0.0, reading: 0.0 },
    '6-8': { questionnaire: 0.15, phoneme: 0.35, pattern: 0.2, reading: 0.3, nonsense: 0.0 },
    '9-12': { questionnaire: 0.1, phoneme: 0.3, pattern: 0.1, reading: 0.45, nonsense: 0.05 }
  };
  return weightProfiles[ageGroup] || weightProfiles['6-8'];
}

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

function getRiskThresholds(ageGroup) {
  const thresholds = {
    '3-5': { low: 30, medium: 50, high: 70 },
    '6-8': { low: 25, medium: 45, high: 65 },
    '9-12': { low: 20, medium: 40, high: 60 }
  };
  return thresholds[ageGroup] || thresholds['6-8'];
}

function getApplicableTests(ageGroup) {
  if (ageGroup === '3-5') return ['questionnaire', 'pretest', 'phoneme', 'nonsense'];
  if (ageGroup === '6-8') return ['questionnaire', 'phoneme', 'pattern', 'reading'];
  if (ageGroup === '9-12') return ['questionnaire', 'pretest', 'phoneme', 'reading', 'nonsense'];
  return ['questionnaire'];
}

function getMaxQuestionnairePoints(ageGroup) {
  const maxPoints = { '3-5': 36, '6-8': 40, '9-12': 40 };
  return maxPoints[ageGroup] || 40;
}

function getExpectedWPM(ageGroup) {
  const expectedWPM = { '3-5': 20, '6-8': 60, '9-12': 120 };
  return expectedWPM[ageGroup] || 60;
}

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





