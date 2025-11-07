"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

export default function ReadingTestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const ageParam = params.get("age") || ""
  const [isVisible, setIsVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribedText, setTranscribedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [canContinue, setCanContinue] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  const passage_6_8 = [
    "The sun is big and yellow. I like to play outside when it is sunny.",
    "I see a red car. The car is small and fast.",
    "My dog likes to run in the park. He chases the ball.",
    "We have a big blue kite. It flies high in the sky.",
    "I can ride my bike. My bike is green and has a bell.",
  ]
  const passage_9_12 = [
    "Last Saturday, our school organized a large and lively science fair that brought together students, parents, and teachers from across all grades. Excited participants displayed their projects, proudly explaining the details to curious visitors. The exhibits ranged from bubbling homemade volcanoes to sleek, solar-powered cars that rolled smoothly across the tables. Parents and teachers moved slowly between the displays, stopping to ask thoughtful questions and offer praise. By the end of the day, the room was filled with an inspiring mix of learning, laughter, and discovery",
    "In the early hours of the morning, the small fishing village began to stir as the first boats returned from the sea. Fishermen hauled in nets heavy with the day's fresh catches, their voices carrying across the cool, salty air. The scent of the ocean mingled with the sound of seagulls circling overhead, searching for scraps. Along the shore, children ran barefoot, chasing one another across the wet sand. Others crouched down to collect seashells, their hands full of colorful treasures from the tide.",
    "On her birthday, Neha was thrilled to receive a beautiful telescope from her uncle, who knew about her love for the night sky. That evening, she carefully set it up in the backyard, adjusting the stand until it was perfectly steady. Pointing the lens toward the glowing moon, she gasped at the sight of craters and dark shadows she had never seen before. The cool night air and the quiet surroundings made the moment feel magical. For the first time, she felt as if she were touching the mysteries of space with her own eyes.",
    "During the summer holidays, our family set out on a long journey to the mountains, eager to escape the heat of the city. The winding roads took us past forests, rivers, and valleys filled with fresh, cool air. A gentle roar of a nearby waterfall echoed through the hills, making the scenery even more peaceful. We hiked along narrow trails that twisted and turned between wildflowers in full bloom. Every few steps, we stopped to watch colorful birds dart through the branches above.",
    "The city park was completely transformed into a bright and bustling festival ground by the afternoon. Cheerful music played from large speakers, mixing with the sounds of laughter and conversation. Food stalls filled the air with the scent of popcorn, grilled snacks, and sweet desserts. Families gathered around open spaces to watch performers sing, dance, and tell stories. As the sun dipped below the horizon, fairy lights strung across the trees lit up the night, turning the park into a glowing wonderland.",
  ]

  const group = useMemo(() => {
    const a = Number(ageParam)
    if (a >= 3 && a <= 5) return "3-5"
    if (a >= 6 && a <= 8) return "6-8"
    if (a >= 9 && a <= 12) return "9-12"
    return null
  }, [ageParam])

  const [originalPassage, setOriginalPassage] = useState("")

  useEffect(() => {
    setIsVisible(true)
    if (group === "6-8") {
      const pick = passage_6_8[Math.floor(Math.random() * passage_6_8.length)]
      setOriginalPassage(pick)
    } else if (group === "9-12") {
      const pick = passage_9_12[Math.floor(Math.random() * passage_9_12.length)]
      setOriginalPassage(pick)
    } else {
      setOriginalPassage("")
    }
  }, [group])

  useEffect(() => {
    if (group === "3-5") {
      router.replace(`/reading/results?${params.toString()}`)
    }
  }, [group, router, params])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      let mimeType = "audio/wav"
      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/webm;codecs=opus"
      }
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
      }
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      recordingIntervalRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000)
    } catch (e) {
      alert("Microphone access error. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setIsRecording(false)
    clearInterval(recordingIntervalRef.current)
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
    try {
      sendAudioForTranscription(audioBlob)
    } catch (e) {}
  }

  const sendAudioForTranscription = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      const response = await fetch("http://localhost:5000/transcribe", { method: "POST", body: formData })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setTranscribedText(data.transcribed_text)
      calculateResults(data.transcribed_text)
      setCanContinue(true)
    } catch (e) {
      alert("Transcription failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  function calculateResults(transcribed) {
    const cleanOriginal = originalPassage.toLowerCase().replace(/[.,!?;:]/g, "")
    const cleanTranscribed = (transcribed || "").toLowerCase().replace(/[.,!?;:]/g, "")

    const originalWords = cleanOriginal.split(/\s+/)
    const transcribedWords = cleanTranscribed.split(/\s+/)

    const durationMinutes = Math.max(0.001, recordingTime / 60)
    const wpm = transcribedWords.length / durationMinutes

    let errorCount = 0
    let correctWords = 0
    let omittedWords = 0
    let addedWords = 0

    const maxLength = Math.max(originalWords.length, transcribedWords.length)

    for (let i = 0; i < maxLength; i++) {
      if (i < originalWords.length && i < transcribedWords.length) {
        if (originalWords[i] === transcribedWords[i]) {
          correctWords++
        } else {
          errorCount++
        }
      } else if (i < originalWords.length) {
        omittedWords++
        errorCount++
      } else {
        addedWords++
        errorCount++
      }
    }

    const computed = {
      wpm: Math.round(wpm * 100) / 100,
      errorCount,
      correctWords,
      omittedWords,
      addedWords,
      duration: recordingTime,
      originalWords: originalWords,
      transcribedWords: transcribedWords,
    }

    setResults(computed)

    try {
      localStorage.setItem(
        "readingResult",
        JSON.stringify({
          wpm: computed.wpm,
          errorCount: computed.errorCount,
          correctWords: computed.correctWords,
        }),
      )
      const assessmentId = localStorage.getItem("assessmentId")
      if (assessmentId) {
        fetch(`http://localhost:5000/api/assessments/${assessmentId}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "reading", payload: { wpm: computed.wpm, errorCount: computed.errorCount, correctWords: computed.correctWords, savedAt: new Date().toISOString() } }),
        })
      }
    } catch (_) {
      // ignore storage errors
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (group === "3-5") return null

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
            onClick={() => router.push("/")}
            className={`hover:text-blue-600 transition-colors font-medium ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Home
          </button>
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
        </div>
      </nav>

      <div className="relative z-10 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div
              className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl border transition-all duration-500 ${
                isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
              }`}
            >
              <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Audio Reading Test
              </h1>
              <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                Reading Passage
              </h2>
              <div
                className={`rounded-2xl p-6 text-sm leading-relaxed whitespace-pre-line mb-6 ${
                  isDarkMode ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-800"
                }`}
              >
                {originalPassage}
              </div>

              <div className="space-y-3">
                {!isRecording && (
                  <button
                    onClick={startRecording}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition"
                  >
                    Start Recording
                  </button>
                )}
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl transition"
                  >
                    Stop Recording ({recordingTime}s)
                  </button>
                )}
                {isProcessing && (
                  <div className={`text-center py-3 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Processing...
                  </div>
                )}
                {transcribedText && (
                  <div className="mt-4">
                    <h3 className={`font-medium mb-3 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                      Transcription
                    </h3>
                    <div
                      className={`rounded-xl p-4 text-sm ${
                        isDarkMode ? "bg-slate-700/50 text-slate-300" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {transcribedText}
                    </div>
                  </div>
                )}
                {canContinue && (
                  <button
                    onClick={() => router.push(`/reading/results?${params.toString()}`)}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition"
                  >
                    See Results
                  </button>
                )}
              </div>
            </div>

            {results && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`backdrop-blur-lg rounded-3xl p-6 shadow-2xl border transition-all duration-500 ${
                    isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
                  }`}
                >
                  <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}>
                        {results.wpm}
                      </div>
                      <div className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                        Words Per Minute
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? "text-red-200" : "text-red-800"}`}>
                        {results.errorCount}
                      </div>
                      <div className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-600"}`}>Total Errors</div>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? "text-green-200" : "text-green-800"}`}>
                        {results.correctWords}
                      </div>
                      <div className={`text-sm ${isDarkMode ? "text-green-300" : "text-green-600"}`}>Correct</div>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                        {results.omittedWords}
                      </div>
                      <div className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Omitted</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`backdrop-blur-lg rounded-3xl p-6 shadow-2xl border transition-all duration-500 ${
                    isDarkMode ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/20"
                  }`}
                >
                  <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Word-by-Word Comparison
                  </h2>
                  <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-100"}`}>
                    <div className="flex flex-wrap gap-1">
                      {originalPassage.split(/\s+/).map((word, index) => {
                        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "")
                        const cleanTranscribedWords = (transcribedText || "")
                          .toLowerCase()
                          .replace(/[.,!?;:]/g, "")
                          .split(/\s+/)
                        let wordClass = isDarkMode ? "bg-slate-600 text-slate-200" : "bg-slate-300 text-slate-800"
                        if (index < cleanTranscribedWords.length) {
                          wordClass =
                            cleanWord === cleanTranscribedWords[index]
                              ? isDarkMode
                                ? "bg-green-500/40 text-green-200"
                                : "bg-green-200 text-green-800"
                              : isDarkMode
                                ? "bg-red-500/40 text-red-200"
                                : "bg-red-200 text-red-800"
                        } else {
                          wordClass = isDarkMode ? "bg-yellow-500/40 text-yellow-200" : "bg-yellow-200 text-yellow-800"
                        }
                        return (
                          <span key={index} className={`px-2 py-1 rounded text-sm font-medium ${wordClass}`}>
                            {word}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-6 lg:p-8">
        <div
          className={`flex items-center justify-between transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <span>© 2025 Dyscover</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
