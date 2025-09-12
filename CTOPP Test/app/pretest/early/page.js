"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const QUESTIONS = [
  // Rhyming: remove the exact same word as in the prompt
  { type: 'mcq', q: 'Which word rhymes with “cat”?', options: ['Hat', 'Dog', 'Mall'], correctLabel: 'Hat' },
  { type: 'mcq', q: 'Which word rhymes with “sun”?', options: ['Pen', 'Run', 'Fan'], correctLabel: 'Run' },
  { type: 'mcq', q: 'Which word rhymes with “ball”?', options: ['Wall', 'Cup', 'Hand'], correctLabel: 'Wall' },
  { type: 'mcq', q: 'Do these rhyme? “Car – Star”', options: ['Yes', 'No'], correctLabel: 'Yes' },
  { type: 'mcq', q: 'Do these rhyme? “Fish – Dish”', options: ['Yes', 'No'], correctLabel: 'Yes' },
  { type: 'mcq', q: 'Do these rhyme? “Dog – Lot”', options: ['Yes', 'No'], correctLabel: 'No' },
  { type: 'mcq', q: 'Find the letter “A”', options: ['A', 'C', 'B'], correctLabel: 'A' },
  { type: 'mcq', q: 'Find the letter “M”', options: ['M', 'T', 'P'], correctLabel: 'M' },
  { type: 'mcq', q: 'Find the letter “S”', options: ['S', 'L', 'O'], correctLabel: 'S' },
  { type: 'mcq', q: 'Find the letter “B”', options: ['B', 'D', 'P'], correctLabel: 'B' },
  // Color/shape questions rendered as colored shapes; randomize option order
  { type: 'color', q: 'Which shape is red?', colors: ['Red', 'Blue', 'Green'], target: 'Red' },
  { type: 'color', q: 'Which shape is yellow?', colors: ['Yellow', 'Red', 'Blue'], target: 'Yellow' },
  { type: 'color', q: 'Which shape is green?', colors: ['Green', 'Purple', 'Orange'], target: 'Green' },
  { type: 'color', q: 'Which shape is blue?', colors: ['Blue', 'Pink', 'Yellow'], target: 'Blue' },
]

function shuffle(array) { return [...array].sort(() => Math.random() - 0.5) }

const SHAPES = ['circle', 'square', 'triangle', 'diamond']

function ShapeSVG({ shape, color }) {
  const fill = color.toLowerCase()
  const size = 80
  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill={fill} />
      </svg>
    )
  }
  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="8" width="48" height="48" rx="6" fill={fill} />
      </svg>
    )
  }
  if (shape === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="32,6 58,58 6,58" fill={fill} />
      </svg>
    )
  }
  // diamond
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <polygon points="32,6 58,32 32,58 6,32" fill={fill} />
    </svg>
  )
}

export default function EarlyPretestPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)

  const q = useMemo(() => QUESTIONS[index], [index])
  const total = QUESTIONS.length

  function chooseByLabel(label) {
    const correct = q.type === 'mcq'
      ? label === q.correctLabel
      : label === q.target
    if (correct) setScore((s) => s + 1)
    if (index < total - 1) setIndex((i) => i + 1)
    else finish()
  }

  function finish() {
    try {
      const payload = { type: 'pretest-3-5', score, total, savedAt: new Date().toISOString() }
      localStorage.setItem('pretest_3_5', JSON.stringify(payload))
    } catch {}
    router.push(`/pretest/next-step?${params.toString()}`)
  }

  const percent = Math.round((index / total) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="text-xs text-slate-600 mt-2 text-right">{index}/{total}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold mb-6">Early Skills</h1>
          <div className="text-lg md:text-xl font-medium text-slate-800 mb-6">{q.q}</div>
          {q.type === 'mcq' ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {shuffle(q.options).map((label, i) => (
                <button
                  key={i}
                  onClick={() => chooseByLabel(label)}
                  className="px-5 py-3 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {shuffle(q.colors).map((color, i) => {
                const shape = SHAPES[i % SHAPES.length]
                return (
                  <button
                    key={i}
                    onClick={() => chooseByLabel(color)}
                    className="p-2 rounded-xl bg-white shadow border border-slate-200 active:scale-95"
                    aria-label={color}
                    title={color}
                  >
                    <ShapeSVG shape={shape} color={color} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


