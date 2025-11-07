"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState, useRef } from "react"

const SEQUENCES = [
  ["2", "4", "6", "8", "10"],
  ["3", "6", "9", "12", "15"],
  ["A", "C", "E", "G", "I"],
  ["5", "10", "15", "20", "25"],
  ["M", "N", "O", "P", "Q"],
  ["1", "4", "9", "16", "25"],
  ["B", "D", "F", "H", "J"],
  ["10", "20", "30", "40", "50"],
  ["X", "Y", "Z", "A", "B"],
  ["100", "90", "80", "70", "60"],
]

function maskTwo(seq) {
  const n = seq.length
  if (n < 2) return { masked: [...seq], missing: [] }
  const i = Math.floor(Math.random() * n)
  let j = Math.floor(Math.random() * n)
  while (j === i) j = Math.floor(Math.random() * n)
  const idxA = Math.min(i, j)
  const idxB = Math.max(i, j)
  const masked = seq.map((v, idx) => (idx === idxA || idx === idxB ? "___" : v))
  return { masked, missing: [seq[idxA], seq[idxB]] }
}

export default function PatternFillPretestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [a1, setA1] = useState("")
  const [a2, setA2] = useState("")
  const [showing, setShowing] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sequence = SEQUENCES[index]
  const { masked, missing } = useMemo(() => maskTwo(sequence), [index])
  const total = SEQUENCES.length

  useEffect(() => {
    setShowing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowing(false), 5000)
    return () => clearTimeout(timerRef.current)
  }, [index])

  function submit() {
    if (showing) return
    const isA = String(a1).trim().toUpperCase()
    const isB = String(a2).trim().toUpperCase()
    const [m0, m1] = missing
    const correct = (isA === m0 && isB === m1) || (isA === m1 && isB === m0)
    const nextScore = correct ? score + 1 : score
    if (correct) setScore((s) => s + 1)
    setA1("")
    setA2("")
    if (index < total - 1) setIndex((i) => i + 1)
    else finish(nextScore)
  }

  async function finish(currentScore) {
    const finalScore = typeof currentScore === 'number' ? currentScore : score
    const payload = { type: "pretest-9-12", score: finalScore, total, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem(
        "pretest_9_12",
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
    router.push(`/pretest/pattern-fill/next-step?${params.toString()}`)
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
                className={`h-2 rounded-full transition-all ${isDarkMode ? "bg-fuchsia-400" : "bg-fuchsia-600"}`}
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
              Pattern Fill
            </h1>
            {showing ? (
              <div className="space-y-6">
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Memorize this pattern
                </div>
                <div className={`text-3xl font-bold tracking-wide ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                  {sequence.join(" ")}
                </div>
                <div className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  You will be asked to fill missing items
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`text-3xl font-bold tracking-wide mb-6 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
                >
                  {masked.join(" ")}
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <input
                    value={a1}
                    onChange={(e) => setA1(e.target.value.toUpperCase())}
                    placeholder="First missing"
                    className={`border rounded px-3 py-2 w-40 text-center uppercase transition-all ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                  />
                  <input
                    value={a2}
                    onChange={(e) => setA2(e.target.value.toUpperCase())}
                    placeholder="Second missing"
                    className={`border rounded px-3 py-2 w-40 text-center uppercase transition-all ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                  />
                </div>
                <button
                  onClick={submit}
                  className="px-5 py-3 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-all"
                >
                  Submit
                </button>
              </>
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
