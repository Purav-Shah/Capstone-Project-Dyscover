"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useMemo, useEffect } from 'react'

const WORDS = ['Adventure','Bicycle','Calendar','Capture','Climate','Courage','Delicious','Electricity','Furniture']

export default function SpeakingAdvancedPhonemePage(){
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
  const [lastTranscript, setLastTranscript] = useState('')
  const queueRef = useRef([])
  const isUploadingRef = useRef(false)
  const resultsRef = useRef([])
  const isActiveRef = useRef(true)

  useEffect(() => {
    return () => { isActiveRef.current = false }
  }, [])

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
      enqueueTranscription(blob)
      if (idx < playlist.length - 1) setIdx(i => i + 1)
      else finish()
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

  function processQueue(){
    if (isUploadingRef.current) return
    const task = queueRef.current.shift()
    if (!task) return
    isUploadingRef.current = true
    task().then((score) => {
      resultsRef.current.push(Number(score) || 0)
    }).catch(() => {
      resultsRef.current.push(0)
    }).finally(() => {
      isUploadingRef.current = false
      processQueue()
    })
  }

  function enqueueTranscription(blob){
    const currentTarget = playlist[idx].toLowerCase()
    const task = async () => {
      try {
        const form = new FormData()
        form.append('audio', blob, 'clip.webm')
        form.append('target', currentTarget)
        const res = await fetch('http://localhost:5000/check_pronunciation', { method: 'POST', body: form })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (isActiveRef.current) setLastTranscript(data?.transcript || '')
        return data && data.score === 1 ? 1 : 0
      } catch (e) {
        return 0
      }
    }
    queueRef.current.push(task)
    processQueue()
  }

  function finish(){
    ;(async () => {
      const delay = (ms) => new Promise(r => setTimeout(r, ms))
      while (isUploadingRef.current || queueRef.current.length) {
        await delay(100)
      }
      const totalScore = resultsRef.current.reduce((sum, v) => sum + (Number(v) || 0), 0)
      try { localStorage.setItem('phoneme_9_12', JSON.stringify({ score: totalScore, total: playlist.length, savedAt: new Date().toISOString() })) } catch {}
    })()
    router.push(`/phoneme/next-step?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Dificult Words</h1>
        <div className="text-3xl font-semibold mb-6">{playlist[idx]}</div>
        <div className="flex gap-3 justify-center">
          {!isRecording && <button onClick={start} className="px-5 py-3 rounded-full bg-blue-600 text-white">Start</button>}
          {isRecording && <button onClick={stop} className="px-5 py-3 rounded-full bg-red-600 text-white">Stop</button>}
        </div>
        
        <div className="mt-6 text-sm text-slate-500">{idx+1} / {playlist.length}</div>
        {lastTranscript && (
          <div className="mt-4 text-sm text-slate-700">Heard: <span className="font-semibold">{lastTranscript}</span></div>
        )}
      </div>
    </div>
  )
}


