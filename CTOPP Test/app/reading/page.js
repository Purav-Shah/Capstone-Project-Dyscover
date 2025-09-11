"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function ReadingTestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const ageParam = params.get('age') || ''
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribedText, setTranscribedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  const passage_6_8 = [
    "The sun is big and yellow. I like to play outside when it is sunny.",
    "I see a red car. The car is small and fast.",
    "My dog likes to run in the park. He chases the ball.",
    "We have a big blue kite. It flies high in the sky.",
    "I can ride my bike. My bike is green and has a bell."
  ]
  const passage_9_12 = [
    "Last Saturday, our school organized a large and lively science fair that brought together students, parents, and teachers from across all grades. Excited participants displayed their projects, proudly explaining the details to curious visitors. The exhibits ranged from bubbling homemade volcanoes to sleek, solar-powered cars that rolled smoothly across the tables. Parents and teachers moved slowly between the displays, stopping to ask thoughtful questions and offer praise. By the end of the day, the room was filled with an inspiring mix of learning, laughter, and discovery",
    "In the early hours of the morning, the small fishing village began to stir as the first boats returned from the sea. Fishermen hauled in nets heavy with the day’s fresh catches, their voices carrying across the cool, salty air. The scent of the ocean mingled with the sound of seagulls circling overhead, searching for scraps. Along the shore, children ran barefoot, chasing one another across the wet sand. Others crouched down to collect seashells, their hands full of colorful treasures from the tide.",
    "On her birthday, Neha was thrilled to receive a beautiful telescope from her uncle, who knew about her love for the night sky. That evening, she carefully set it up in the backyard, adjusting the stand until it was perfectly steady. Pointing the lens toward the glowing moon, she gasped at the sight of craters and dark shadows she had never seen before. The cool night air and the quiet surroundings made the moment feel magical. For the first time, she felt as if she were touching the mysteries of space with her own eyes.",
    "During the summer holidays, our family set out on a long journey to the mountains, eager to escape the heat of the city. The winding roads took us past forests, rivers, and valleys filled with fresh, cool air. A gentle roar of a nearby waterfall echoed through the hills, making the scenery even more peaceful. We hiked along narrow trails that twisted and turned between wildflowers in full bloom. Every few steps, we stopped to watch colorful birds dart through the branches above.",
    "The city park was completely transformed into a bright and bustling festival ground by the afternoon. Cheerful music played from large speakers, mixing with the sounds of laughter and conversation. Food stalls filled the air with the scent of popcorn, grilled snacks, and sweet desserts. Families gathered around open spaces to watch performers sing, dance, and tell stories. As the sun dipped below the horizon, fairy lights strung across the trees lit up the night, turning the park into a glowing wonderland."
  ]

  const group = useMemo(() => {
    const a = Number(ageParam)
    if (a >= 3 && a <= 5) return '3-5'
    if (a >= 6 && a <= 8) return '6-8'
    if (a >= 9 && a <= 12) return '9-12'
    return null
  }, [ageParam])

  const [originalPassage, setOriginalPassage] = useState('')

  useEffect(() => {
    if (group === '6-8') {
      const pick = passage_6_8[Math.floor(Math.random() * passage_6_8.length)]
      setOriginalPassage(pick)
    } else if (group === '9-12') {
      const pick = passage_9_12[Math.floor(Math.random() * passage_9_12.length)]
      setOriginalPassage(pick)
    } else {
      setOriginalPassage('')
    }
  }, [group])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      })
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/webm;codecs=opus'
      }
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data) }
      mediaRecorderRef.current.onstop = () => { stream.getTracks().forEach(t => t.stop()) }
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
    } catch (e) {
      alert('Microphone access error. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setIsRecording(false)
    clearInterval(recordingIntervalRef.current)
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    sendAudioForTranscription(audioBlob)
  }

  const sendAudioForTranscription = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const response = await fetch('http://localhost:5000/transcribe', { method: 'POST', body: formData })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setTranscribedText(data.transcribed_text)
      calculateResults(data.transcribed_text)
    } catch (e) {
      alert('Transcription failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  function calculateResults(transcribed) {
    const cleanOriginal = originalPassage.toLowerCase().replace(/[.,!?;:]/g, '')
    const cleanTranscribed = (transcribed || '').toLowerCase().replace(/[.,!?;:]/g, '')
    const originalWords = cleanOriginal.split(/\s+/)
    const transcribedWords = cleanTranscribed.split(/\s+/)

    const durationMinutes = Math.max(1, recordingTime) / 60
    const wpm = Math.round((transcribedWords.length / durationMinutes) * 100) / 100

    let errorCount = 0
    let correctWords = 0
    let omittedWords = 0
    let addedWords = 0
    const maxLength = Math.max(originalWords.length, transcribedWords.length)
    for (let i = 0; i < maxLength; i++) {
      if (i < originalWords.length && i < transcribedWords.length) {
        if (originalWords[i] === transcribedWords[i]) correctWords++
        else errorCount++
      } else if (i < originalWords.length) {
        omittedWords++; errorCount++
      } else {
        addedWords++; errorCount++
      }
    }

    setResults({ wpm, errorCount, correctWords, omittedWords, addedWords, originalWords, transcribedWords, duration: recordingTime })
  }

  if (group === '3-5') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-semibold mb-2">Audio Reading Test</h1>
            <p className="text-slate-700">This test is not applicable for ages 3–5.</p>
            <div className="mt-6">
              <button className="px-5 py-3 rounded-full bg-blue-600 text-white" onClick={() => router.push('/')}>Go Home</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Audio Reading Test</h1>
          <button className="text-blue-600" onClick={() => router.push('/')}>Home</button>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-medium mb-3">Reading Passage</h2>
          <div className="bg-slate-100 rounded p-4 text-slate-800 whitespace-pre-line">{originalPassage}</div>
          <div className="mt-6 space-y-3">
            {!isRecording && (
              <button onClick={startRecording} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">Start Recording</button>
            )}
            {isRecording && (
              <button onClick={stopRecording} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg">Stop Recording</button>
            )}
            {isProcessing && <div className="text-center text-slate-600">Processing...</div>}
            {transcribedText && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Transcription</h3>
                <div className="bg-slate-100 rounded p-3 text-sm text-slate-700">{transcribedText}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {results && (
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <div className="text-2xl font-bold text-blue-800">{results.wpm}</div>
                <div className="text-sm text-blue-600">Words Per Minute</div>
              </div>
              <div className="bg-red-100 p-4 rounded text-center">
                <div className="text-2xl font-bold text-red-800">{results.errorCount}</div>
                <div className="text-sm text-red-600">Total Errors</div>
              </div>
              <div className="bg-green-100 p-4 rounded text-center">
                <div className="text-2xl font-bold text-green-800">{results.correctWords}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded text-center">
                <div className="text-2xl font-bold text-yellow-800">{results.omittedWords}</div>
                <div className="text-sm text-yellow-700">Omitted</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Word-by-Word Comparison</h2>
            <div className="bg-slate-100 p-4 rounded">
              <div className="flex flex-wrap gap-1">
                {originalPassage.split(/\s+/).map((word, index) => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '')
                  const cleanTranscribedWords = (transcribedText || '').toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/)
                  let wordClass = 'bg-slate-200 text-slate-800'
                  if (index < cleanTranscribedWords.length) {
                    wordClass = cleanWord === cleanTranscribedWords[index]
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  } else {
                    wordClass = 'bg-yellow-200 text-yellow-800'
                  }
                  return (
                    <span key={index} className={`px-2 py-1 rounded text-sm font-medium ${wordClass}`}>
                      {word}
                    </span>
                  )
                })}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span className="inline-block w-3 h-3 bg-green-200 rounded mr-1"></span> Correct
                <span className="inline-block w-3 h-3 bg-red-200 rounded mx-1"></span> Incorrect
                <span className="inline-block w-3 h-3 bg-yellow-200 rounded mx-1"></span> Omitted
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




