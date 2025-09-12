"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'

const SEQUENCES = [
  ['2','4','6','8','10'],
  ['3','6','9','12','15'],
  ['A','C','E','G','I'],
  ['5','10','15','20','25'],
  ['M','N','O','P','Q'],
  ['1','4','9','16','25'],
  ['B','D','F','H','J'],
  ['10','20','30','40','50'],
  ['X','Y','Z','A','B'],
  ['100','90','80','70','60'],
]

function maskTwo(seq){
  // randomly remove two distinct positions
  const n = seq.length
  if (n < 2) return { masked: [...seq], missing: [] }
  let i = Math.floor(Math.random() * n)
  let j = Math.floor(Math.random() * n)
  while (j === i) j = Math.floor(Math.random() * n)
  const idxA = Math.min(i, j)
  const idxB = Math.max(i, j)
  const masked = seq.map((v, idx) => (idx === idxA || idx === idxB ? '___' : v))
  return { masked, missing: [seq[idxA], seq[idxB]] }
}

export default function PatternFillPretestPage(){
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [showing, setShowing] = useState(true)
  const timerRef = useRef(null)

  const sequence = SEQUENCES[index]
  const { masked, missing } = useMemo(() => maskTwo(sequence), [index])
  const total = SEQUENCES.length

  useEffect(() => {
    // show full pattern for 5 seconds, then switch to inputs
    setShowing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowing(false), 5000)
    return () => clearTimeout(timerRef.current)
  }, [index])

  function submit(){
    if (showing) return
    const correct = (String(a1).trim().toUpperCase() === missing[0]) && (String(a2).trim().toUpperCase() === missing[1])
    if (correct) setScore(s => s + 1)
    setA1(''); setA2('')
    if (index < total - 1) setIndex(i => i + 1)
    else finish()
  }

  function finish(){
    try { localStorage.setItem('pretest_9_12', JSON.stringify({ type: 'pretest-9-12', score, total, savedAt: new Date().toISOString() })) } catch {}
    router.push(`/pretest/pattern-fill/next-step?${params.toString()}`)
  }

  const percent = Math.round((index / total) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-fuchsia-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} /></div>
          <div className="text-xs text-slate-600 mt-2 text-right">{index}/{total}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold mb-6">Pattern Fill</h1>
          {showing ? (
            <div className="space-y-6">
              <div className="text-sm text-slate-600">Memorize this pattern</div>
              <div className="text-3xl font-bold tracking-wide text-slate-800">{sequence.join(' ')}</div>
              <div className="text-xs text-slate-500">You will be asked to fill missing items</div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold tracking-wide text-slate-800 mb-6">{masked.join(' ')}</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <input value={a1} onChange={e=>setA1(e.target.value.toUpperCase())} placeholder="First missing" className="border rounded px-3 py-2 w-40 text-center uppercase" />
                <input value={a2} onChange={e=>setA2(e.target.value.toUpperCase())} placeholder="Second missing" className="border rounded px-3 py-2 w-40 text-center uppercase" />
              </div>
              <button onClick={submit} className="px-5 py-3 rounded-full bg-fuchsia-600 text-white">Submit</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


