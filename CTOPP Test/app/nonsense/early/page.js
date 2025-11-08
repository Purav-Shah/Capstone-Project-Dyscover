"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

const QUESTIONS = [
  { prompt: 'Which is "baf"?', options: ["baf", "mep", "teg"], correct: "baf" },
  { prompt: 'Which is "mip"?', options: ["mep", "baf", "tog"], correct: "mep" },
  { prompt: 'Which is "teg"?', options: ["teg", "mip", "baf"], correct: "teg" },
  { prompt: 'Which is "nop"?', options: ["nop", "baf", "lun"], correct: "nop" },
  { prompt: 'Which is "lun"?', options: ["lun", "tog", "mep"], correct: "lun" },
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function EarlyNonsensePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const audioRef = useRef(null)
  const item = useMemo(() => QUESTIONS[index], [index])
  const total = QUESTIONS.length
  const [opts, setOpts] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setOpts(shuffle(item.options))
  }, [index, item])

  async function speak(text) {
    try {
      const url = new URL("http://localhost:5000/tts_offline")
      url.searchParams.set("text", text)
      const res = await fetch(url.toString())
      const blob = await res.blob()
      const obj = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      audioRef.current = new Audio(obj)
      audioRef.current.play()
    } catch {}
  }

  function choose(opt) {
    const correct = opt === item.correct
    const nextScore = correct ? score + 1 : score
    if (correct) setScore((s) => s + 1)
    if (index < total - 1) setIndex((i) => i + 1)
    else finish(nextScore)
  }

  async function finish(currentScore) {
    const finalScore = typeof currentScore === 'number' ? currentScore : score
    const payload = { score: finalScore, total, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem("nonsense_3_5", JSON.stringify(payload))
      const assessmentId = localStorage.getItem("assessmentId")
      if (assessmentId) {
        await fetch(`http://localhost:5000/api/assessments/${assessmentId}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "nonsense", payload }),
        })
      }
    } catch {}
    router.push(`/nonsense/next-step?${params.toString()}`)
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
              <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
            <div className={`text-xs mt-2 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {index}/{total}
            </div>
          </div>
          <div
            className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 text-center ${isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"}`}
          >
            <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Nonsense Words
            </h1>
            <div className={`text-lg md:text-xl font-medium mb-8 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              Listen to the word and select the most appropriate one
            </div>
            
            {/* Speaker Button */}
            <div className="mb-8">
              <button
                onClick={() => speak(item.correct)}
                className={`px-8 py-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
                  isDarkMode 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
              </button>
            </div>

            {/* Selection Options */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(opt)}
                  className="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium text-lg"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
