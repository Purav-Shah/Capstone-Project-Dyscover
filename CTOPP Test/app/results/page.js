"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { collectAllTestResults, calculateDyslexiaRisk, saveRiskAssessment } from "../utils/riskCalculator"
import { DecisionTreeVisualization } from "../utils/decisionTree.js"
import { getInitialDarkMode, setDarkMode } from "../utils/theme"
import { generatePersonalizedRecommendations } from "../utils/geminiRecommendations"

export default function ComprehensiveResultsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const first = params.get("first") || ""
  const last = params.get("last") || ""
  const age = params.get("age") || ""
  const sex = params.get("sex") || ""

  useEffect(() => {
    setIsVisible(true)
    setIsDarkMode(getInitialDarkMode())
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      const assessmentId = typeof window !== 'undefined' ? window.localStorage.getItem('assessmentId') : null
      let results = null
      if (assessmentId) {
        try {
          const res = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`)
          if (res.ok) {
            const doc = await res.json()
            const rawResults = doc?.results || null
            if (rawResults) {
              // Normalize MongoDB results to match expected structure
              results = normalizeMongoResults(rawResults, Number(age))
              console.log('Loaded from MongoDB:', { rawResults, normalized: results })
            }
          }
        } catch (error) {
          console.error('Error loading from MongoDB:', error)
        }
      }

      if (!results) {
        results = collectAllTestResults()
        console.log('Loaded from localStorage:', results)
      } else {
        // Merge localStorage data with MongoDB data to ensure completeness
        // Prioritize MongoDB data, but fill in any missing tests from localStorage
        const localResults = collectAllTestResults()
        // Only merge in localStorage data if MongoDB doesn't have that test
        for (const key in localResults) {
          if (!results[key] && localResults[key]) {
            results[key] = localResults[key]
          }
        }
        console.log('Merged results (MongoDB + localStorage):', results)
      }
      
      setTestResults(results)

      const demographics = { age: Number(age), sex, first, last }
      const computed = calculateDyslexiaRisk(results || {}, demographics)
      saveRiskAssessment(computed)
      setRiskAssessment(computed)
      
      // Fetch personalized recommendations
      if (results && computed) {
        setLoadingRecommendations(true)
        try {
          console.log('Attempting to generate Gemini recommendations...', { 
            hasResults: !!results, 
            hasComputed: !!computed,
            demographics 
          })
          const personalized = await generatePersonalizedRecommendations(
            results,
            computed,
            demographics
          )
          console.log('Gemini recommendations result:', personalized)
          if (personalized && personalized.length > 0) {
            setPersonalizedRecommendations(personalized)
          } else {
            console.warn('No personalized recommendations returned from Gemini')
          }
        } catch (error) {
          console.error('Error fetching personalized recommendations:', error)
        } finally {
          setLoadingRecommendations(false)
        }
      }
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    setDarkMode(next)
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk': return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium Risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Low Risk': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Normalize MongoDB results to match expected structure
  const normalizeMongoResults = (rawResults, age) => {
    const normalized = { ...rawResults }
    const ageGroup = age >= 3 && age <= 5 ? '3-5' : age >= 6 && age <= 8 ? '6-8' : age >= 9 && age <= 12 ? '9-12' : null
    
    // For age 6-8, pretest is stored as 'pretest' in MongoDB but should be 'pattern' in results
    if (ageGroup === '6-8') {
      if (rawResults.pretest && !rawResults.pattern) {
        normalized.pattern = rawResults.pretest
      }
      // Also check if pattern exists directly (for backwards compatibility)
      if (rawResults.pattern && !normalized.pattern) {
        normalized.pattern = rawResults.pattern
      }
    }
    
    // Ensure phoneme data is preserved (it's stored as 'phoneme' in MongoDB)
    // No transformation needed for phoneme - it's already in the correct format
    
    // Log what we have for debugging
    console.log('Normalized MongoDB results:', {
      raw: rawResults,
      normalized: normalized,
      hasPhoneme: !!normalized.phoneme,
      hasPattern: !!normalized.pattern,
      hasReading: !!normalized.reading,
      hasQuestionnaire: !!normalized.questionnaire
    })
    
    return normalized
  }

  // Determine applicable tests by age
  const getApplicableTests = () => {
    const a = Number(age)
    if (a >= 3 && a <= 5) return ['questionnaire', 'pretest', 'phoneme', 'nonsense', 'pattern']
    if (a >= 6 && a <= 8) return ['questionnaire', 'phoneme', 'pattern', 'reading']
    if (a >= 9 && a <= 12) return ['questionnaire', 'pretest', 'phoneme', 'reading', 'nonsense']
    return ['questionnaire']
  }

  const applicableTests = getApplicableTests()

  // Sort test results by savedAt timestamp (chronological order)
  const getSortedTestResults = () => {
    if (!testResults) return []
    
    const testItems = []
    
    // Map test types to their display components
    if (applicableTests.includes('questionnaire') && testResults.questionnaire) {
      testItems.push({
        type: 'questionnaire',
        savedAt: testResults.questionnaire.savedAt || '',
        component: 'questionnaire'
      })
    }
    
    if (applicableTests.includes('pretest') && testResults.pretest) {
      testItems.push({
        type: 'pretest',
        savedAt: testResults.pretest.savedAt || '',
        component: 'pretest'
      })
    }
    
    if (applicableTests.includes('phoneme') && testResults.phoneme) {
      testItems.push({
        type: 'phoneme',
        savedAt: testResults.phoneme.savedAt || '',
        component: 'phoneme'
      })
    }
    
    if (applicableTests.includes('pattern') && testResults.pattern) {
      testItems.push({
        type: 'pattern',
        savedAt: testResults.pattern.savedAt || '',
        component: 'pattern'
      })
    }
    
    if (applicableTests.includes('reading') && testResults.reading) {
      testItems.push({
        type: 'reading',
        savedAt: testResults.reading.savedAt || '',
        component: 'reading'
      })
    }
    
    if (applicableTests.includes('nonsense') && testResults.nonsense) {
      testItems.push({
        type: 'nonsense',
        savedAt: testResults.nonsense.savedAt || '',
        component: 'nonsense'
      })
    }
    
    // Sort by savedAt timestamp (chronological order)
    return testItems.sort((a, b) => {
      const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0
      const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0
      return timeA - timeB
    })
  }

  const sortedTestResults = getSortedTestResults()

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      <div className="absolute inset-0">
        <div
          className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse ${
            isDarkMode ? "bg-blue-500" : "bg-blue-200"
          }`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse animation-delay-2000 ${
            isDarkMode ? "bg-purple-500" : "bg-purple-200"
          }`}
        ></div>
        <div
          className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse animation-delay-4000 ${
            isDarkMode ? "bg-pink-500" : "bg-pink-200"
          }`}
        ></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div
          className={`flex items-center space-x-3 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dyscover
          </span>
        </div>
        <div
          className={`flex items-center space-x-6 transition-all duration-1000 delay-200 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <button
            onClick={() => router.push('/')}
            className={`hover:text-blue-600 transition-colors font-medium ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Home
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkMode
                ? "bg-yellow-500 text-slate-900 hover:bg-yellow-400"
                : "bg-slate-800 text-yellow-400 hover:bg-slate-700"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Comprehensive Assessment Results
            </h1>
            <p className={`text-lg ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              {first} {last} • Age {age} • {sex}
            </p>
          </div>

          {/* Risk Assessment Summary */}
          {riskAssessment && (
            <div className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border mb-8 ${
              isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {riskAssessment.isPreliminary ? "Preliminary Risk Assessment" : "Overall Risk Assessment"}
              </h2>
              
              <div className={`p-6 rounded-2xl border-2 ${getRiskColor(riskAssessment.riskLevel)}`}>
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-2">
                    {riskAssessment.riskLevel}
                    {riskAssessment.isPreliminary && (
                      <span className="text-lg font-normal ml-2 text-gray-600">(Preliminary)</span>
                    )}
                  </h3>
                  <p className="text-lg mb-2">
                    {riskAssessment.isPreliminary ? 'Questionnaire Score' : 'Composite Score'}: {riskAssessment.compositeScore}/100
                  </p>
                  <p className="text-sm opacity-75">Confidence: {riskAssessment.confidence}</p>
                </div>
              </div>

              {/* Preliminary Assessment Notice */}
              {riskAssessment.isPreliminary && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Preliminary Assessment
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>This assessment is based on questionnaire responses only. For a comprehensive evaluation, complete the additional tests (phoneme, pattern recognition, and reading tests).</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {(riskAssessment.recommendations || personalizedRecommendations) && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {personalizedRecommendations ? "Areas of Improvement" : "Recommendations"}
                  </h4>
                  
                  {loadingRecommendations ? (
                    <div className={`flex items-center space-x-2 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Generating personalized recommendations...</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {(personalizedRecommendations || riskAssessment.recommendations || []).map((rec, index) => (
                        <li key={index} className={`text-sm flex items-start ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}>
                          <span className="text-blue-500 mr-2 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Individual Test Results */}
          {testResults && (
            <div className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border mb-8 ${
              isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Individual Test Results
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {sortedTestResults.map((testItem, index) => {
                  const renderTestResult = () => {
                    switch (testItem.type) {
                      case 'questionnaire':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Questionnaire</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Score:</span>
                                <span className={`font-bold ${getScoreColor(testResults.questionnaire.score, testResults.questionnaire.maxPoints || 40)}`}>
                                  {testResults.questionnaire.score}/{testResults.questionnaire.maxPoints || 40}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Risk Level:</span>
                                <span className="font-medium">{testResults.questionnaire.level}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Age Group:</span>
                                <span className="font-medium">{testResults.questionnaire.group}</span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case 'pretest':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Pretest</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Score:</span>
                                <span className={`font-bold ${getScoreColor(testResults.pretest.score, testResults.pretest.total)}`}>
                                  {testResults.pretest.score}/{testResults.pretest.total}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Accuracy:</span>
                                <span className="font-medium">
                                  {Math.round((testResults.pretest.score / testResults.pretest.total) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case 'phoneme':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Phoneme Test</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Score:</span>
                                <span className={`font-bold ${getScoreColor(testResults.phoneme.score, testResults.phoneme.total)}`}>
                                  {testResults.phoneme.score}/{testResults.phoneme.total}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Accuracy:</span>
                                <span className="font-medium">
                                  {Math.round((testResults.phoneme.score / testResults.phoneme.total) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case 'pattern':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Pattern Recognition</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Score:</span>
                                <span className={`font-bold ${getScoreColor(testResults.pattern.score, testResults.pattern.total)}`}>
                                  {testResults.pattern.score}/{testResults.pattern.total}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Accuracy:</span>
                                <span className="font-medium">
                                  {Math.round((testResults.pattern.score / testResults.pattern.total) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case 'reading':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Reading Test</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">WPM:</span>
                                <span className="font-bold">{testResults.reading.wpm}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Errors:</span>
                                <span className="font-bold text-red-600">{testResults.reading.errorCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Correct:</span>
                                <span className="font-bold text-green-600">{testResults.reading.correctWords}</span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case 'nonsense':
                        return (
                          <div className={`p-6 rounded-2xl ${
                            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                            <h3 className="text-lg font-semibold mb-3">Nonsense Words</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Score:</span>
                                <span className={`font-bold ${getScoreColor(testResults.nonsense.score, testResults.nonsense.total)}`}>
                                  {testResults.nonsense.score}/{testResults.nonsense.total}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Accuracy:</span>
                                <span className="font-medium">
                                  {Math.round((testResults.nonsense.score / testResults.nonsense.total) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      
                      default:
                        return null
                    }
                  }
                  
                  return (
                    <div key={`${testItem.type}-${index}`}>
                      {renderTestResult()}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Decision Tree Visualization (hidden for users) */}

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform active:scale-95 mr-4"
            >
              Return Home
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:from-green-700 hover:to-teal-700 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform active:scale-95"
            >
              Print Results
            </button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-6 lg:p-8">
        <div
          className={`flex items-center justify-between transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <span>© 2025 Dyscover</span>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms
            </a>
          </div>
          <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
