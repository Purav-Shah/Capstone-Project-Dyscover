"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AGE_GROUPS, RESPONSE_POINTS, ageToGroup, categorizeRisk } from "../data"

export default function QuestionnaireQuestionsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const first = params.get("first") || ""
  const last = params.get("last") || ""
  const age = params.get("age") || ""
  const sex = params.get("sex") || ""

  const groupKey = useMemo(() => ageToGroup(age), [age])
  const group = groupKey ? AGE_GROUPS[groupKey] : null
  const [answers, setAnswers] = useState(() => Array(group?.questions.length || 0).fill(""))
  const [index, setIndex] = useState(0)

  const total = group?.questions.length || 0
  const current = index + 1
  const percent = Math.round((answers.filter(Boolean).length / total) * 100)

  const options = [
    { key: "Yes", label: "Yes 😊", color: "bg-green-600 hover:bg-green-700" },
    { key: "Sometimes", label: "Sometimes 🤔", color: "bg-yellow-500 hover:bg-yellow-600" },
    { key: "No", label: "No 🙅", color: "bg-red-600 hover:bg-red-700" },
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  function setAnswer(idx, value) {
    setAnswers((prev) => {
      const copy = [...prev]
      copy[idx] = value
      return copy
    })
  }

  function handleSubmit() {
    const score = answers.reduce((sum, a) => sum + (RESPONSE_POINTS[a] ?? 0), 0)
    const result = categorizeRisk(groupKey, score)

    try {
      const payload = {
        first,
        last,
        age: Number(age),
        sex,
        group: groupKey,
        score,
        level: result.level,
        answers,
        savedAt: new Date().toISOString(),
      }
      const key = "questionnaireResult"
      window.localStorage.setItem(key, JSON.stringify(payload))
    } catch {}

    const qp = new URLSearchParams({ first, last, age: String(age), sex })
    router.push(`/questionnaire/next-step?${qp.toString()}`)
  }

  function choose(option) {
    setAnswer(index, option)
    setTimeout(() => {
      if (index < total - 1) setIndex((i) => i + 1)
      else handleSubmit()
    }, 200)
  }

  function next() {
    if (index < total - 1) setIndex(index + 1)
    else handleSubmit()
  }

  function prev() {
    if (index > 0) setIndex(index - 1)
  }

  if (!group) {
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
            className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse ${
              // Decreased opacity from 70 to 60
              isDarkMode ? "bg-blue-500" : "bg-blue-200"
            }`}
          ></div>
          <div
            className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-2000 ${
              // Decreased opacity from 70 to 60
              isDarkMode ? "bg-purple-500" : "bg-purple-200"
            }`}
          ></div>
          <div
            className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000 ${
              // Decreased opacity from 70 to 60
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
          <div
            className={`flex items-center space-x-6 transition-all duration-1000 delay-200 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
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
            className={`w-full max-w-3xl backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
              isDarkMode ? "bg-slate-800/70 border-slate-700/50" : "bg-white/70 border-white/20" // Decreased opacity from 80 to 70
            }`}
          >
            <div className="mb-4">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(0, percent)}%` }}
                />
              </div>
              <div className={`text-xs mt-2 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {answers.filter(Boolean).length} / {total} answered
              </div>
            </div>
            <div className="text-center mb-8">
              <div className={`text-sm mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
                {group?.label} – Parent Questionnaire
              </div>
              <h1 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Question {current} of {total}
              </h1>
            </div>

            <div className="space-y-6">
              <div className={`text-lg md:text-xl font-medium ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                {group?.questions[index]}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {options.map((o) => (
                  <button
                    key={o.key}
                    className={`px-5 py-3 rounded-full text-white shadow transition-transform active:scale-95 ${
                      o.color
                    } ${answers[index] === o.key ? "ring-4 ring-offset-2 ring-blue-300" : ""}`}
                    onClick={() => choose(o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                className={`px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-offset-2 transform active:scale-95 ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400"
                }`}
                onClick={prev}
                disabled={index === 0}
              >
                ← Back
              </button>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform active:scale-95 disabled:opacity-50"
                onClick={next}
                disabled={!answers[index]}
              >
                {index === total - 1 ? "Finish" : "Next →"}
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
          className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse ${
            // Decreased opacity from 70 to 60
            isDarkMode ? "bg-blue-500" : "bg-blue-200"
          }`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-2000 ${
            // Decreased opacity from 70 to 60
            isDarkMode ? "bg-purple-500" : "bg-purple-200"
          }`}
        ></div>
        <div
          className={`absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000 ${
            // Decreased opacity from 70 to 60
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
        <div
          className={`flex items-center space-x-6 transition-all duration-1000 delay-200 ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
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
          className={`w-full max-w-3xl backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
            isDarkMode ? "bg-slate-800/70 border-slate-700/50" : "bg-white/70 border-white/20" // Decreased opacity from 80 to 70
          }`}
        >
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(0, percent)}%` }}
              />
            </div>
            <div className={`text-xs mt-2 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {answers.filter(Boolean).length} / {total} answered
            </div>
          </div>
          <div className="text-center mb-8">
            <div className={`text-sm mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
              {group?.label} – Parent Questionnaire
            </div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Question {current} of {total}
            </h1>
          </div>

          <div className="space-y-6">
            <div className={`text-lg md:text-xl font-medium ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              {group?.questions[index]}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {options.map((o) => (
                <button
                  key={o.key}
                  className={`px-5 py-3 rounded-full text-white shadow transition-transform active:scale-95 ${
                    o.color
                  } ${answers[index] === o.key ? "ring-4 ring-offset-2 ring-blue-300" : ""}`}
                  onClick={() => choose(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              className={`px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-offset-2 transform active:scale-95 ${
                isDarkMode
                  ? "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
                  : "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400"
              }`}
              onClick={prev}
              disabled={index === 0}
            >
              ← Back
            </button>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform active:scale-95 disabled:opacity-50"
              onClick={next}
              disabled={!answers[index]}
            >
              {index === total - 1 ? "Finish" : "Next →"}
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
