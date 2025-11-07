"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getInitialDarkMode, setDarkMode } from "../utils/theme"

export default function QuestionnaireIntroPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setIsDarkMode(getInitialDarkMode())
  }, [])

  function handleStart(e) {
    e.preventDefault()
    if (!firstName || !lastName || !age || !sex) return
    try {
      window.localStorage.removeItem("assessmentId")
    } catch {}
    const params = new URLSearchParams({
      first: firstName,
      last: lastName,
      age: String(age),
      sex,
    })
    router.push(`/questionnaire/questions?${params.toString()}`)
  }

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    setDarkMode(next)
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
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
          >
            <div className="space-y-6">
              <h1
                className={`text-5xl lg:text-6xl font-bold leading-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Help your child
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  discover
                </span>
                their potential
              </h1>
              <p className={`text-xl leading-relaxed max-w-lg ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                A comprehensive assessment designed to identify learning patterns and provide personalized insights for
                children aged 3-12.
              </p>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Assessments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">95%</div>
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">24/7</div>
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Support</div>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
          >
            <div
              className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
                isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
              }`}
            >
              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Start Assessment
                </h2>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  Takes about 10-15 minutes to complete
                </p>
              </div>

              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      Child's Name
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm ${
                          isDarkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                            : "bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <input
                        className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm ${
                          isDarkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                            : "bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      Age
                    </label>
                    <select
                      className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm ${
                        isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-white"
                          : "bg-white/50 border-slate-200 text-slate-900"
                      }`}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    >
                      <option value="">Select age (3–12)</option>
                      {Array.from({ length: 10 }, (_, i) => 3 + i).map((n) => (
                        <option key={n} value={n}>
                          {n} years old
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      Sex
                    </label>
                    <select
                      className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm ${
                        isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-white"
                          : "bg-white/50 border-slate-200 text-slate-900"
                      }`}
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform active:scale-95"
                >
                  Begin Assessment →
                </button>
              </form>

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
