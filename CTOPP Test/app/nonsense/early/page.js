"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

const QUESTIONS = [
  { prompt: 'Which is “baf”?', options: ['baf','mep','teg'], correct: 'baf' },
  { prompt: 'Which is “mip”?', options: ['mep','baf','tog'], correct: 'mep' },
  { prompt: 'Which is “teg”?', options: ['teg','mip','baf'], correct: 'teg' },
  { prompt: 'Which is “nop”?', options: ['nop','baf','lun'], correct: 'nop' },
  { prompt: 'Which is “lun”?', options: ['lun','tog','mep'], correct: 'lun' },
]

function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5) }

export default function EarlyNonsensePage(){
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const audioRef = useRef(null)
  const item = useMemo(() => QUESTIONS[index], [index])
  const total = QUESTIONS.length
  const [opts, setOpts] = useState([])

  useEffect(() => {
    // compute a stable option order per question to avoid hydration mismatch
    setOpts(shuffle(item.options))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  async function speak(text){
    try {
      const url = new URL('http://localhost:5000/tts_offline')
      url.searchParams.set('text', text)
      const res = await fetch(url.toString())
      const blob = await res.blob()
      const obj = URL.createObjectURL(blob)
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }
      audioRef.current = new Audio(obj)
      audioRef.current.play()
    } catch {}
  }

  function choose(opt){
    if (opt === item.correct) setScore(s => s + 1)
    if (index < total - 1) setIndex(i => i + 1)
    else finish()
  }

  function finish(){
    try { localStorage.setItem('nonsense_3_5', JSON.stringify({ score, total, savedAt: new Date().toISOString() })) } catch {}
    router.push(`/nonsense/next-step?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Nonsense Words – Ages 3–5</h1>
        <div className="text-lg md:text-xl font-medium text-slate-800 mb-6">{item.prompt}</div>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          {opts.map((opt, i) => (
            <button key={i} onClick={() => speak(opt)} className="px-4 py-2 rounded bg-slate-200">🔊 {opt}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {opts.map((opt, i) => (
            <button key={i} onClick={() => choose(opt)} className="px-5 py-3 rounded-full bg-indigo-600 text-white">{opt}</button>
          ))}
        </div>
        <div className="mt-6 text-sm text-slate-500">{index+1} / {total}</div>
      </div>
    </div>
  )
}


