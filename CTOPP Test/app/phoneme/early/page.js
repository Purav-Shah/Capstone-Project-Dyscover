"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const ITEMS = [
  { letters: ['c','a','t'], options: ['Cat','Sun','Dog'], correct: 'Cat' },
  { letters: ['d','o','g'], options: ['Dog','Ball','Fish'], correct: 'Dog' },
  { letters: ['s','u','n'], options: ['Sun','Log','Cup'], correct: 'Sun' },
  { letters: ['b','a','t'], options: ['Bat','Cup','Pen'], correct: 'Bat' },
  { letters: ['p','i','g'], options: ['Pig','Hat','Log'], correct: 'Pig' },
  { letters: ['f','i','s','h'], options: ['Fish','Dog','Sun'], correct: 'Fish' },
]

function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5) }

export default function EarlyPhonemePage(){
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const item = useMemo(() => ITEMS[index], [index])
  const total = ITEMS.length

  function choose(opt){
    if (opt === item.correct) setScore(s => s + 1)
    if (index < total - 1) setIndex(i => i + 1)
    else finish()
  }

  function finish(){
    try { localStorage.setItem('phoneme_3_5', JSON.stringify({ score, total, savedAt: new Date().toISOString() })) } catch {}
    router.push(`/phoneme/next-step?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Phoneme Blending</h1>
        <div className="text-4xl tracking-[1.25em] font-bold text-slate-800 mb-6">{item.letters.join(' ')}</div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {shuffle(item.options).map((opt, i) => (
            <button key={i} onClick={() => choose(opt)} className="px-5 py-3 rounded-full bg-indigo-600 text-white active:scale-95">{opt}</button>
          ))}
        </div>
        <div className="mt-6 text-sm text-slate-500">{index+1} / {total}</div>
      </div>
    </div>
  )
}


