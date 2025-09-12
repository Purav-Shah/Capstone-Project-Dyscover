"use client";

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function getAgeGroup(age) {
  const a = Number(age)
  if (a >= 3 && a <= 5) return '3-5'
  if (a >= 6 && a <= 8) return '6-8'
  if (a >= 9 && a <= 12) return '9-12'
  return null
}

export default function PretestRouterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const age = params.get('age') || ''
  const group = useMemo(() => getAgeGroup(age), [age])

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">Invalid age</div>
    )
  }

  if (group === '3-5') router.replace(`/pretest/early?${params.toString()}`)
  else if (group === '6-8') router.replace(`/pretest/pattern?${params.toString()}`)
  else router.replace(`/phoneme/speaking-advanced?${params.toString()}`)

  return null
}








