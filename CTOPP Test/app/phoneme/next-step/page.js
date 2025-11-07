"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function PhonemeNextStepPage() {
  const router = useRouter()
  const params = useSearchParams()
  const first = params.get("first") || ""
  const last = params.get("last") || ""
  const age = params.get("age") || ""
  const sex = params.get("sex") || ""
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

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
          className={`flex items-center space-x-3 transition-all duration-1000 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dyscover
          </span>
        </div>
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
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div
            className={`backdrop-blur-lg rounded-3xl p-12 shadow-2xl border transition-all duration-500 text-center max-w-xl ${
              isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
            }`}
          >
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Phoneme Test Complete
            </h1>
            <p className={`text-lg mb-4 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Thanks, {first} {last}. Your responses have been saved.
            </p>
            <p className={`text-lg mb-8 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Next, we will do a short pattern recognition task.
            </p>
            <button
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105"
              onClick={() => {
                const a = Number(age)
                if (a >= 9 && a <= 12) {
                  router.push(
                    `/pretest/pattern-fill?${new URLSearchParams({
                      first,
                      last,
                      age,
                      sex,
                    }).toString()}`,
                  )
                } else if (a >= 6 && a <= 8) {
                  router.push(
                    `/pretest/pattern?${new URLSearchParams({
                      first,
                      last,
                      age,
                      sex,
                    }).toString()}`,
                  )
                } else {
                  router.push(
                    `/nonsense?${new URLSearchParams({
                      first,
                      last,
                      age,
                      sex,
                    }).toString()}`,
                  )
                }
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-6 lg:p-8">
        <div
          className={`flex items-center justify-between transition-all duration-1000 delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>© 2025 Dyscover</div>
        </div>
      </footer>
    </div>
  )
}
