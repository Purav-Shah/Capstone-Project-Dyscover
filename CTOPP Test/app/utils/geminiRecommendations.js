// Gemini API integration for personalized recommendations

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Analyze test results to identify weak areas
 */
function analyzeWeakAreas(testResults, normalizedScores, ageGroup) {
  const weakAreas = [];
  const strongAreas = [];
  
  // Questionnaire analysis
  if (testResults.questionnaire) {
    const score = normalizedScores.questionnaire || 0;
    if (score > 70) {
      weakAreas.push('Questionnaire responses indicate significant concerns');
    } else if (score < 30) {
      strongAreas.push('Questionnaire responses show minimal concerns');
    }
  }
  
  // Phoneme awareness analysis
  if (testResults.phoneme) {
    const score = normalizedScores.phoneme || 0;
    if (score < 50) {
      weakAreas.push(`Phoneme awareness (${Math.round(score)}% accuracy)`);
    } else {
      strongAreas.push(`Phoneme awareness (${Math.round(score)}% accuracy)`);
    }
  }
  
  // Pattern recognition analysis
  if (testResults.pattern) {
    const score = normalizedScores.pattern || 0;
    if (score < 50) {
      weakAreas.push(`Pattern recognition (${Math.round(score)}% accuracy)`);
    } else {
      strongAreas.push(`Pattern recognition (${Math.round(score)}% accuracy)`);
    }
  }
  
  // Reading fluency analysis
  if (testResults.reading) {
    const { wpm, errorCount, correctWords } = testResults.reading;
    const totalWords = correctWords + errorCount;
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
    const readingScore = normalizedScores.reading || 0;
    
    if (readingScore < 50 || accuracy < 50) {
      weakAreas.push(`Reading fluency (${wpm} WPM, ${Math.round(accuracy)}% accuracy, ${errorCount} errors)`);
    } else {
      strongAreas.push(`Reading fluency (${wpm} WPM, ${Math.round(accuracy)}% accuracy)`);
    }
  }
  
  // Nonsense word decoding analysis
  if (testResults.nonsense) {
    const score = normalizedScores.nonsense || 0;
    if (score < 50) {
      weakAreas.push(`Nonsense word decoding (${Math.round(score)}% accuracy)`);
    } else {
      strongAreas.push(`Nonsense word decoding (${Math.round(score)}% accuracy)`);
    }
  }
  
  // Pretest analysis (for age 3-5 and 9-12)
  if (testResults.pretest) {
    const score = normalizedScores.pretest || 0;
    if (score < 50) {
      weakAreas.push(`Pretest performance (${Math.round(score)}% accuracy)`);
    } else {
      strongAreas.push(`Pretest performance (${Math.round(score)}% accuracy)`);
    }
  }
  
  return { weakAreas, strongAreas };
}

/**
 * Generate personalized recommendations using Gemini API
 */
export async function generatePersonalizedRecommendations(testResults, riskAssessment, demographics) {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
      console.warn('Gemini API key not configured. Skipping personalized recommendations.');
      return null;
    }

    const age = demographics.age;
    const ageGroup = getAgeGroup(age);
    const normalizedScores = riskAssessment.breakdown || {};
    
    // Analyze weak areas
    const { weakAreas, strongAreas } = analyzeWeakAreas(testResults, normalizedScores, ageGroup);
    
    // Build the prompt
    const prompt = buildRecommendationPrompt(
      demographics,
      ageGroup,
      riskAssessment.riskLevel,
      riskAssessment.compositeScore,
      weakAreas,
      strongAreas,
      testResults
    );
    
    // Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract recommendations from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts[0] && parts[0].text) {
        const text = parts[0].text;
        const recommendations = parseRecommendations(text);
        return recommendations.length > 0 ? recommendations : null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return null; // Return null to fall back to default recommendations
  }
}

/**
 * Build the prompt for Gemini API
 */
function buildRecommendationPrompt(demographics, ageGroup, riskLevel, compositeScore, weakAreas, strongAreas, testResults) {
  const { first, last, age, sex } = demographics;
  
  let prompt = `You are an educational specialist providing personalized recommendations for a child's dyslexia risk assessment.

Child Information:
- Name: ${first} ${last}
- Age: ${age} years old (${ageGroup} age group)
- Gender: ${sex}
- Overall Risk Level: ${riskLevel}
- Composite Score: ${compositeScore}/100

Test Results:`;

  if (weakAreas.length > 0) {
    prompt += `\n\nAreas Needing Support:\n${weakAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}`;
  }
  
  if (strongAreas.length > 0) {
    prompt += `\n\nAreas of Strength:\n${strongAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}`;
  }
  
  // Add specific test details
  if (testResults.questionnaire) {
    prompt += `\n\nQuestionnaire Score: ${testResults.questionnaire.score}/${testResults.questionnaire.maxPoints || 40}`;
  }
  
  if (testResults.phoneme) {
    prompt += `\n\nPhoneme Test: ${testResults.phoneme.score}/${testResults.phoneme.total} correct`;
  }
  
  if (testResults.reading) {
    prompt += `\n\nReading Test: ${testResults.reading.wpm} words per minute, ${testResults.reading.errorCount} errors, ${testResults.reading.correctWords} correct words`;
  }
  
  if (testResults.pattern) {
    prompt += `\n\nPattern Recognition: ${testResults.pattern.score}/${testResults.pattern.total} correct`;
  }
  
  if (testResults.nonsense) {
    prompt += `\n\nNonsense Word Decoding: ${testResults.nonsense.score}/${testResults.nonsense.total} correct`;
  }
  
  if (testResults.pretest) {
    prompt += `\n\nPretest: ${testResults.pretest.score}/${testResults.pretest.total} correct`;
  }
  
  prompt += `\n\nPlease provide 4-6 specific, actionable, and age-appropriate recommendations for this child. Focus on:
1. Addressing the specific weak areas identified
2. Building on their strengths
3. Age-appropriate interventions and activities
4. Parent-friendly language
5. Practical steps that can be taken at home or school

Format your response as a numbered list, with each recommendation on a new line starting with a number and period (e.g., "1. ..."). Do not include any additional text or explanations, just the numbered recommendations.`;

  return prompt;
}

/**
 * Parse recommendations from Gemini response text
 */
function parseRecommendations(text) {
  if (!text) return [];
  
  // Clean up the text - remove markdown formatting if present
  let cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '');
  
  // Split by lines and filter out empty lines
  const lines = cleanedText.split('\n').filter(line => line.trim().length > 0);
  
  const recommendations = [];
  
  for (const line of lines) {
    // Match numbered list items (1., 2., etc.) or bullet points
    const numberedMatch = line.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (numberedMatch) {
      const rec = numberedMatch[2].trim();
      if (rec.length > 10) {
        recommendations.push(rec);
      }
    } else {
      // Try bullet points
      const bulletMatch = line.match(/^[-•*]\s*(.+)$/);
      if (bulletMatch) {
        const rec = bulletMatch[1].trim();
        if (rec.length > 10) {
          recommendations.push(rec);
        }
      } else if (line.trim().length > 15 && !line.match(/^(please|format|note|important)/i)) {
        // If no number/bullet, but line is substantial and not a meta instruction
        recommendations.push(line.trim());
      }
    }
  }
  
  // Remove duplicates and limit to 6 recommendations max
  const unique = [...new Set(recommendations)];
  return unique.slice(0, 6);
}

/**
 * Get age group from age
 */
function getAgeGroup(age) {
  const a = Number(age);
  if (a >= 3 && a <= 5) return '3-5';
  if (a >= 6 && a <= 8) return '6-8';
  if (a >= 9 && a <= 12) return '9-12';
  return '6-8';
}

