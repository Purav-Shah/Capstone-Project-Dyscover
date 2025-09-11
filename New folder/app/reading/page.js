"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function ReadingTestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribedText, setTranscribedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  const originalPassage = "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once. It is commonly used to test typing speed and accuracy. Reading this passage aloud can help identify potential reading difficulties."

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Audio Reading Test</h1>
          <button className="text-blue-600" onClick={() => router.push('/')}>Home</button>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-medium mb-3">Reading Passage</h2>
          <div className="bg-slate-100 rounded p-4 text-slate-800">{originalPassage}</div>
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




