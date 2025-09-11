"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'

const WORDS = ['Adventure','Bicycle','Calendar','Capture','Climate','Courage','Delicious','Dictionary','Electricity','Furniture']

export default function SpeakingAdvancedPhonemePage(){
  const router = useRouter()
  const params = useSearchParams()
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [lastTranscript, setLastTranscript] = useState('')

  async function start(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } })
    let mimeType = 'audio/webm;codecs=opus'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm'
    }
    const rec = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []
    rec.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      try { stream.getTracks().forEach(t=>t.stop()) } catch {}
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      submit(blob)
    }
    mediaRecorderRef.current = rec
    rec.start(1000)
    setIsRecording(true)
  }

  function stop(){
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  async function submit(blob){
    try {
      setIsProcessing(true)
      const form = new FormData()
      form.append('audio', blob, 'clip.webm')
      form.append('target', WORDS[idx].toLowerCase())
      const res = await fetch('http://localhost:5000/check_pronunciation', { method: 'POST', body: form })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data && data.score === 1) setScore(s => s + 1)
      setLastTranscript(data?.transcript || '')
      if (idx < WORDS.length - 1) setIdx(i => i + 1)
      else finish()
    } catch (e) {
      alert('Upload/transcription failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  function finish(){
    try { localStorage.setItem('phoneme_9_12', JSON.stringify({ score, total: WORDS.length, savedAt: new Date().toISOString() })) } catch {}
    router.push(`/phoneme/next-step?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Phoneme Reading – Ages 9–12</h1>
        <div className="text-3xl font-semibold mb-6">{WORDS[idx]}</div>
        <div className="flex gap-3 justify-center">
          {!isRecording && <button onClick={start} className="px-5 py-3 rounded-full bg-blue-600 text-white">Start</button>}
          {isRecording && <button onClick={stop} className="px-5 py-3 rounded-full bg-red-600 text-white">Stop</button>}
        </div>
        {isProcessing && <div className="mt-4 text-sm text-slate-600">Processing...</div>}
        <div className="mt-6 text-sm text-slate-500">{idx+1} / {WORDS.length}</div>
        {lastTranscript && (
          <div className="mt-4 text-sm text-slate-700">Heard: <span className="font-semibold">{lastTranscript}</span></div>
        )}
      </div>
    </div>
  )
}


