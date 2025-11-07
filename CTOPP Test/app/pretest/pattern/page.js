"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

const SEQUENCES = [
  ["1", "2", "3", "4", "5"],
  ["2", "4", "6", "8", "10"],
  ["A", "B", "C", "D", "E"],
  ["5", "10", "15", "20", "25"],
  ["C", "E", "G", "I", "K"],
  ["1", "3", "5", "7", "9"],
  ["X", "Y", "Z", "A", "B"],
  ["10", "9", "8", "7", "6"],
  ["D", "E", "F", "G", "H"],
  ["2", "4", "8", "16", "32"],
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function makeQuestion(seq) {
  const correct = seq.join(" ")
  const var1 = [...seq].reverse().join(" ")
  const var2 = [...seq].slice(1).concat(seq[0]).join(" ")
  const var3 = shuffle(seq).join(" ")
  const opts = shuffle([correct, var1, var2, var3])
  const correctIndex = opts.indexOf(correct)
  return { display: correct, options: opts, correctIndex }
}

export default function PatternPretestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showing, setShowing] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const questions = useMemo(() => SEQUENCES.map(makeQuestion), [])
  const q = questions[index]
  const total = questions.length
  const timerRef = useRef(null)

  useEffect(() => {
    setShowing(true)
    timerRef.current = setTimeout(() => setShowing(false), 5000)
    return () => clearTimeout(timerRef.current)
  }, [index])

  function choose(optIdx) {
    if (showing) return
    const correct = optIdx === q.correctIndex
    const nextScore = correct ? score + 1 : score
    if (correct) setScore((s) => s + 1)
    if (index < total - 1) setIndex((i) => i + 1)
    else finish(nextScore)
  }

  async function finish(currentScore) {
    const finalScore = typeof currentScore === 'number' ? currentScore : score
    const payload = { type: "pretest-6-8", score: finalScore, total, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem(
        "pretest_6_8",
        JSON.stringify(payload),
      )
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
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

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
          className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDarkMode ? "bg-blue-500" : "bg-blue-200"}`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000 ${isDarkMode ? "bg-purple-500" : "bg-purple-200"}`}
        ></div>
        <div
          className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000 ${isDarkMode ? "bg-pink-500" : "bg-pink-200"}`}
        ></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dyscover
          </span>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${isDarkMode ? "bg-yellow-500 text-slate-900 hover:bg-yellow-400" : "bg-slate-800 text-yellow-400 hover:bg-slate-700"}`}
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
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
            <div className={`text-xs mt-2 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {index}/{total}
            </div>
          </div>
          <div
            className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 text-center ${isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"}`}
          >
            <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Pattern Identification
            </h1>
            {showing ? (
              <div className={`text-3xl font-bold tracking-wide ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                {q.display}
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Which pattern was shown?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      className="px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
