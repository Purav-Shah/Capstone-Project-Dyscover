"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function getAgeGroup(age) {
  const a = Number(age)
  if (a >= 3 && a <= 5) return "3-5"
  if (a >= 6 && a <= 8) return "6-8"
  if (a >= 9 && a <= 12) return "9-12"
  return null
}

export default function PretestRouterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const age = params.get("age") || ""
  const group = useMemo(() => getAgeGroup(age), [age])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!group) {
      setTimeout(() => {
        router.push("/")
      }, 2000)
      return
    }

    if (group === "3-5") router.replace(`/pretest/early?${params.toString()}`)
    else if (group === "6-8") router.replace(`/pretest/pattern?${params.toString()}`)
    else router.replace(`/phoneme/speaking-advanced?${params.toString()}`)
  }, [group, router, params])

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
          className={`text-center space-y-8 transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <h1 className={`text-4xl lg:text-5xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Loading your assessment...
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-bounce ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`}></div>
            <div
              className={`w-3 h-3 rounded-full animate-bounce animation-delay-200 ${isDarkMode ? "bg-purple-500" : "bg-purple-600"}`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full animate-bounce animation-delay-400 ${isDarkMode ? "bg-pink-500" : "bg-pink-600"}`}
            ></div>
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
