"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState, useEffect } from "react"

const QUESTIONS = [
  { type: "mcq", q: 'Which word rhymes with "cat"?', options: ["Hat", "Dog", "Mall"], correctLabel: "Hat" },
  { type: "mcq", q: 'Which word rhymes with "sun"?', options: ["Pen", "Run", "Fan"], correctLabel: "Run" },
  { type: "mcq", q: 'Which word rhymes with "ball"?', options: ["Wall", "Cup", "Hand"], correctLabel: "Wall" },
  { type: "mcq", q: 'Do these rhyme? "Car – Star"', options: ["Yes", "No"], correctLabel: "Yes" },
  { type: "mcq", q: 'Do these rhyme? "Fish – Dish"', options: ["Yes", "No"], correctLabel: "Yes" },
  { type: "mcq", q: 'Do these rhyme? "Dog – Lot"', options: ["Yes", "No"], correctLabel: "No" },
  { type: "mcq", q: 'Find the letter "A"', options: ["A", "C", "B"], correctLabel: "A" },
  { type: "mcq", q: 'Find the letter "M"', options: ["M", "T", "P"], correctLabel: "M" },
  { type: "mcq", q: 'Find the letter "S"', options: ["S", "L", "O"], correctLabel: "S" },
  { type: "mcq", q: 'Find the letter "B"', options: ["B", "D", "P"], correctLabel: "B" },
  { type: "color", q: "Which shape is red?", colors: ["Red", "Blue", "Green"], target: "Red" },
  { type: "color", q: "Which shape is yellow?", colors: ["Yellow", "Red", "Blue"], target: "Yellow" },
  { type: "color", q: "Which shape is green?", colors: ["Green", "Purple", "Orange"], target: "Green" },
  { type: "color", q: "Which shape is blue?", colors: ["Blue", "Pink", "Yellow"], target: "Blue" },
]

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5)
}
const SHAPES = ["circle", "square", "triangle", "diamond"]

function ShapeSVG({ shape, color }) {
  const fill = color.toLowerCase()
  const size = 80
  if (shape === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill={fill} />
      </svg>
    )
  }
  if (shape === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="8" width="48" height="48" rx="6" fill={fill} />
      </svg>
    )
  }
  if (shape === "triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="32,6 58,58 6,58" fill={fill} />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <polygon points="32,6 58,32 32,58 6,32" fill={fill} />
    </svg>
  )
}

export default function EarlyPretestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const q = useMemo(() => QUESTIONS[index], [index])
  const total = QUESTIONS.length

  function chooseByLabel(label) {
    const correct = q.type === "mcq" ? label === q.correctLabel : label === q.target
    const nextScore = correct ? score + 1 : score
    if (correct) setScore((s) => s + 1)
    if (index < total - 1) setIndex((i) => i + 1)
    else finish(nextScore)
  }

  async function finish(currentScore) {
    const finalScore = typeof currentScore === 'number' ? currentScore : score
    const payload = { type: "pretest-3-5", score: finalScore, total, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem("pretest_3_5", JSON.stringify(payload))
      const assessmentId = localStorage.getItem("assessmentId")
      if (assessmentId) {
        await fetch(`http://localhost:5000/api/assessments/${assessmentId}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pretest", payload }),
        })
      }
    } catch {}
    router.push(`/pretest/next-step?${params.toString()}`)
  }

  const percent = Math.round((index / total) * 100)

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
          className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${
            isDarkMode ? "bg-blue-500" : "bg-blue-200"
          }`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000 ${
            isDarkMode ? "bg-purple-500" : "bg-purple-200"
          }`}
        ></div>
        <div
          className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000 ${
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
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
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
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM6.464 14.95l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-3xl">
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${isDarkMode ? "bg-emerald-400" : "bg-emerald-600"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className={`text-xs mt-2 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {index}/{total}
            </div>
          </div>
          <div
            className={`backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center transition-all duration-500 ${isDarkMode ? "bg-slate-800/80" : "bg-white/80"}`}
          >
            <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Early Skills
            </h1>
            <div className={`text-lg md:text-xl font-medium mb-6 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              {q.q}
            </div>
            {q.type === "mcq" ? (
              <div className="flex flex-wrap items-center justify-center gap-4">
                {shuffle(q.options).map((label, i) => (
                  <button
                    key={i}
                    onClick={() => chooseByLabel(label)}
                    className="px-5 py-3 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow active:scale-95 transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-6">
                {shuffle(q.colors).map((color, i) => {
                  const shape = SHAPES[i % SHAPES.length]
                  return (
                    <button
                      key={i}
                      onClick={() => chooseByLabel(color)}
                      className={`p-2 rounded-xl shadow border active:scale-95 transition-all ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}
                      aria-label={color}
                      title={color}
                    >
                      <ShapeSVG shape={shape} color={color} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-6 lg:p-8">
        <div
          className={`text-center transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div
            className={`flex items-center justify-center space-x-6 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            <span>© 2025 Dyscover</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
