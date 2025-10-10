"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

const SEQUENCES = [
  ['1','2','3','4','5'],
  ['2','4','6','8','10'],
  ['A','B','C','D','E'],
  ['5','10','15','20','25'],
  ['C','E','G','I','K'],
  ['1','3','5','7','9'],
  ['X','Y','Z','A','B'],
  ['10','9','8','7','6'],
  ['D','E','F','G','H'],
  ['2','4','8','16','32'],
]

function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5) }

function makeQuestion(seq){
  // correct option is the exact same sequence; distractors are simple variations
  const correct = seq.join(' ')
  const var1 = [...seq].reverse().join(' ')
  const var2 = [...seq].slice(1).concat(seq[0]).join(' ')
  const var3 = shuffle(seq).join(' ')
  const opts = shuffle([correct, var1, var2, var3])
  const correctIndex = opts.indexOf(correct)
  return { display: correct, options: opts, correctIndex }
}

export default function PatternPretestPage(){
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showing, setShowing] = useState(true)

  const questions = useMemo(() => SEQUENCES.map(makeQuestion), [])
  const q = questions[index]
  const total = questions.length
  const timerRef = useRef(null)

  useEffect(() => {
    setShowing(true)
    timerRef.current = setTimeout(() => setShowing(false), 5000)
    return () => clearTimeout(timerRef.current)
  }, [index])

  function choose(optIdx){
    if (showing) return
    if (optIdx === q.correctIndex) setScore(s => s + 1)
    if (index < total - 1) setIndex(i => i + 1)
    else finish()
  }

  function finish(){
    try {
      localStorage.setItem('pretest_6_8', JSON.stringify({ type: 'pretest-6-8', score, total, savedAt: new Date().toISOString() }))
    } catch {}
    router.push(`/pretest/next-step?${params.toString()}`)
  }

  const percent = Math.round((index / total) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} /></div>
          <div className="text-xs text-slate-600 mt-2 text-right">{index}/{total}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold mb-6">Pattern Identification</h1>
          {showing ? (
            <div className="text-3xl font-bold tracking-wide text-slate-800">{q.display}</div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-slate-600">Which pattern was shown?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => choose(i)} className="px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


