"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState, useMemo, useEffect } from "react"

const WORDS = [
  "Adventure",
  "Bicycle",
  "Calendar",
  "Capture",
  "Climate",
  "Courage",
  "Delicious",
  "Electricity",
  "Furniture",
]

export default function SpeakingAdvancedPhonemePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const playlist = useMemo(() => {
    return [...WORDS].sort(() => Math.random() - 0.5).slice(0, 3)
  }, [])
  const [isRecording, setIsRecording] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [lastTranscript, setLastTranscript] = useState("")
  const queueRef = useRef([])
  const isUploadingRef = useRef(false)
  const resultsRef = useRef([])
  const isActiveRef = useRef(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    return () => {
      isActiveRef.current = false
    }
  }, [])

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    let mimeType = "audio/webm;codecs=opus"
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/webm"
    }
    const rec = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    rec.onstop = () => {
      try {
        stream.getTracks().forEach((t) => t.stop())
      } catch {}
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      enqueueTranscription(blob)
      if (idx < playlist.length - 1) setIdx((i) => i + 1)
      else finish()
    }
    mediaRecorderRef.current = rec
    rec.start(1000)
    setIsRecording(true)
  }

  function stop() {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  function processQueue() {
    if (isUploadingRef.current) return
    const task = queueRef.current.shift()
    if (!task) return
    isUploadingRef.current = true
    task()
      .then((score) => {
        resultsRef.current.push(Number(score) || 0)
      })
      .catch(() => {
        resultsRef.current.push(0)
      })
      .finally(() => {
        isUploadingRef.current = false
        processQueue()
      })
  }

  function enqueueTranscription(blob) {
    const currentTarget = playlist[idx].toLowerCase()
    const task = async () => {
      try {
        const form = new FormData()
        form.append("audio", blob, "clip.webm")
        form.append("target", currentTarget)
        const res = await fetch("http://localhost:5000/check_pronunciation", { method: "POST", body: form })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (isActiveRef.current) setLastTranscript(data?.transcript || "")
        return data && data.score === 1 ? 1 : 0
      } catch (e) {
        return 0
      }
    }
    queueRef.current.push(task)
    processQueue()
  }

  function finish() {
    ;(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms))
      while (isUploadingRef.current || queueRef.current.length) {
        await delay(100)
      }
      const totalScore = resultsRef.current.reduce((sum, v) => sum + (Number(v) || 0), 0)
      const payload = { score: totalScore, total: playlist.length, savedAt: new Date().toISOString() }
      try {
        localStorage.setItem(
          "phoneme_9_12",
          JSON.stringify(payload),
        )
        const assessmentId = localStorage.getItem("assessmentId")
        if (assessmentId) {
          await fetch(`http://localhost:5000/api/assessments/${assessmentId}/results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "phoneme", payload }),
          })
        }
      } catch {}
    })()
    router.push(`/phoneme/next-step?${params.toString()}`)
  }

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
          <div
            className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 text-center ${isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"}`}
          >
            <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Difficult Words
            </h1>
            <div className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
              {playlist[idx]}
            </div>
            <div className="flex gap-3 justify-center">
              {!isRecording && (
                <button
                  onClick={start}
                  className="px-5 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
                >
                  Start
                </button>
              )}
              {isRecording && (
                <button
                  onClick={stop}
                  className="px-5 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  Stop
                </button>
              )}
            </div>

            <div className={`mt-6 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {idx + 1} / {playlist.length}
            </div>
            {lastTranscript && (
              <div className={`mt-4 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                Heard: <span className="font-semibold">{lastTranscript}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
