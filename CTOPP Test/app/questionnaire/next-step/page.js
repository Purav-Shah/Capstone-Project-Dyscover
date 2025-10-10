"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function QuestionnaireNextStepPage() {
  
  const router = useRouter();
  const params = useSearchParams();
  const first = params.get("first") || "";
  const last = params.get("last") || "";
  const age = params.get("age") || "";
  const sex = params.get("sex") || "";
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    console.log('Questionnaire next-step: Auto-redirecting...', { age, first, last, sex })
    
    // Immediate redirect
    const a = Number(age)
    const qs = new URLSearchParams({ first, last, age, sex }).toString()
    console.log('Redirecting to:', a >= 6 && a <= 8 ? `/phoneme?${qs}` : `/pretest?${qs}`)
    
    if (a >= 6 && a <= 8) {
      router.push(`/phoneme?${qs}`)
    } else {
      router.push(`/pretest?${qs}`)
    }
  }, [age, first, last, sex, router])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleContinue = () => {
    router.push("/")
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
          className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse ${
            // Decreased transparency by 10%
            isDarkMode ? "bg-blue-500" : "bg-blue-200"
          }`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse animation-delay-2000 ${
            // Decreased transparency by 10%
            isDarkMode ? "bg-purple-500" : "bg-purple-200"
          }`}
        ></div>
        <div
          className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse animation-delay-4000 ${
            // Decreased transparency by 10%
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
          <a
            href="#"
            className={`hover:text-blue-600 transition-colors font-medium ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            About
          </a>
          <a
            href="#"
            className={`hover:text-blue-600 transition-colors font-medium ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Contact
          </a>
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

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div
          className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
            isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
          }`}
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Questionnaire Complete!
            </h2>
            <p className={`text-lg mb-6 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Preparing next assessment...
            </p>
            
            <div className="text-sm text-gray-500 mb-4">
              Redirecting automatically...
            </div>
            
            <button
              onClick={() => {
                const a = Number(age)
                const qs = new URLSearchParams({ first, last, age, sex }).toString()
                if (a >= 6 && a <= 8) {
                  router.push(`/phoneme?${qs}`)
                } else {
                  router.push(`/pretest?${qs}`)
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105"
            >
              Continue to Next Test →
            </button>
          </div>

          <div className={`mt-8 pt-6 border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
            <div
              className={`flex items-center justify-center space-x-6 text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Secure & Private
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                GDPR Compliant
              </span>
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
          <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
