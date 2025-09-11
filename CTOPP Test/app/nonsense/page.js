"use client";

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ageToGroup(age){
  const a = Number(age)
  if (a >= 3 && a <= 5) return '3-5'
  if (a >= 6 && a <= 8) return '6-8'
  return null
}

export default function NonsenseRouterPage(){
  const router = useRouter()
  const params = useSearchParams()
  const age = params.get('age') || ''
  const group = useMemo(() => ageToGroup(age), [age])
  if (!group) return <div className="p-6">Not applicable for this age</div>
  if (group === '3-5') router.replace(`/nonsense/early?${params.toString()}`)
  else router.replace(`/nonsense/mid?${params.toString()}`)
  return null
}


