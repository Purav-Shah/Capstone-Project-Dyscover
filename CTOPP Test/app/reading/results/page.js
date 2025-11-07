"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReadingResultsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const first = params.get("first") || ""
  const last = params.get("last") || ""
  const age = params.get("age") || ""
  const sex = params.get("sex") || ""

  const [readingResult, setReadingResult] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    try {
      const data = localStorage.getItem("readingResult")
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed && parsed.wpm !== undefined) {
          setReadingResult(parsed)
        }
      }
    } catch (e) {
      // noop: keep empty state
    } finally {
      setLoaded(true)
    }
  }, [])

  const handleGoToComprehensive = () => {
    const query = new URLSearchParams({ first, last, age, sex }).toString()
    router.push(`/results?${query}`)
  }

  const handleGoHome = () => router.push("/")

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
          className={`flex items-center space-x-4 transition-all duration-1000 delay-200 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
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

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-6 py-8">
        <div className="w-full max-w-2xl">
          <div
            className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div
              className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
                isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
              }`}
            >
              <div className="text-center mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Reading Results
                </h1>
                <p className={`text-lg ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Thank you, {first} {last}.
                </p>
              </div>

              {!loaded && (
                <p className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Loading your results…
                </p>
              )}

              {loaded && !readingResult && (
                <div className="text-center space-y-4">
                  <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                    No reading results were found on this device.
                  </p>
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Please complete the reading task first, then return here.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={handleGoHome}
                      className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition font-medium"
                    >
                      Go to Home
                    </button>
                    <button
                      onClick={handleGoToComprehensive}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition font-medium"
                    >
                      View Comprehensive Results
                    </button>
                  </div>
                </div>
              )}

              {loaded && readingResult && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      <div className="flex items-center justify-between">
                        <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>Words per Minute (WPM)</span>
                        <span className={`font-semibold text-lg ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>
                          {readingResult.wpm}
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                      <div className="flex items-center justify-between">
                        <span className={isDarkMode ? "text-green-300" : "text-green-600"}>Correct Words</span>
                        <span className={`font-semibold text-lg ${isDarkMode ? "text-green-200" : "text-green-900"}`}>
                          {readingResult.correctWords ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                      <div className="flex items-center justify-between">
                        <span className={isDarkMode ? "text-red-300" : "text-red-600"}>Errors</span>
                        <span className={`font-semibold text-lg ${isDarkMode ? "text-red-200" : "text-red-900"}`}>
                          {readingResult.errorCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={handleGoToComprehensive}
                      className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                    >
                      View Comprehensive Results
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="px-6 py-2 rounded-2xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition font-medium"
                    >
                      Home
                    </button>
                  </div>
                </div>
              )}
            </div>
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
        </div>
      </footer>
    </div>
  )
}
