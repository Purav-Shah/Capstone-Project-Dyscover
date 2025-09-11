"use client";

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ageToGroup(age){
  const a = Number(age)
  if (a >= 3 && a <= 5) return '3-5'
  if (a >= 6 && a <= 8) return '6-8'
  if (a >= 9 && a <= 12) return '9-12'
  return null
}

export default function PhonemeRouterPage(){
  const router = useRouter()
  const params = useSearchParams()
  const age = params.get('age') || ''
  const group = useMemo(() => ageToGroup(age), [age])
  if (!group) return <div className="p-6">Invalid age</div>
  if (group === '3-5') router.replace(`/phoneme/early?${params.toString()}`)
  else if (group === '6-8') router.replace(`/phoneme/speaking?${params.toString()}`)
  else router.replace(`/phoneme/speaking-advanced?${params.toString()}`)
  return null
}



