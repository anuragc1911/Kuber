'use client'

import { useEffect, useState } from 'react'
import type { WealthProfile } from './projection'

const KEY = 'kuber:wealth-profile:v1'

export const DEFAULT_PROFILE: WealthProfile = {
  currentAge: 28,
  monthlyIncome: 80_000,
  currentSavings: 5_00_000,
  monthlyInvestment: 25_000,
  annualReturnPct: 12,
}

export function readProfile(): WealthProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<WealthProfile>
    if (typeof parsed.currentAge !== 'number') return null
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return null
  }
}

export function writeProfile(p: WealthProfile) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(p))
}

export function clearProfile() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}

export function useWealthProfile() {
  const [profile, setProfile] = useState<WealthProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProfile(readProfile())
    setHydrated(true)
  }, [])

  function update(next: WealthProfile) {
    writeProfile(next)
    setProfile(next)
  }

  return { profile, hydrated, setProfile: update }
}
