export type ProjectionInputs = {
  currentAge: number
  targetAge: number
  currentSavings: number
  monthlyInvestment: number
  annualReturnPct: number
}

export type ProjectionPoint = { age: number; wealth: number }

export type WealthProfile = {
  currentAge: number
  monthlyIncome: number
  currentSavings: number
  monthlyInvestment: number
  annualReturnPct: number
}

export function projectWealth(i: ProjectionInputs): { points: ProjectionPoint[]; finalWealth: number } {
  const years = Math.max(0, i.targetAge - i.currentAge)
  const r = i.annualReturnPct / 100
  const monthly = r / 12
  const points: ProjectionPoint[] = []

  for (let y = 0; y <= years; y++) {
    const months = y * 12
    const lump = i.currentSavings * Math.pow(1 + monthly, months)
    const sip = monthly === 0
      ? i.monthlyInvestment * months
      : i.monthlyInvestment * ((Math.pow(1 + monthly, months) - 1) / monthly)
    points.push({ age: i.currentAge + y, wealth: Math.round(lump + sip) })
  }
  return { points, finalWealth: points[points.length - 1]?.wealth ?? i.currentSavings }
}

export function yearsToTarget(target: number, i: Omit<ProjectionInputs, 'targetAge'>): number {
  const r = i.annualReturnPct / 100
  const monthly = r / 12
  let m = 0
  let wealth = i.currentSavings
  while (wealth < target && m < 12 * 80) {
    wealth = wealth * (1 + monthly) + i.monthlyInvestment
    m++
  }
  return m >= 12 * 80 ? Infinity : m / 12
}

export function fireNumber(annualExpenses: number, swr = 0.04): number {
  return Math.round(annualExpenses / swr)
}

export function whatIfSip(delta: number, i: ProjectionInputs) {
  return projectWealth({ ...i, monthlyInvestment: Math.max(0, i.monthlyInvestment + delta) })
}

export function whatIfReturn(newPct: number, i: ProjectionInputs) {
  return projectWealth({ ...i, annualReturnPct: newPct })
}

export function whatIfLumpSum(lumpSum: number, i: ProjectionInputs) {
  return projectWealth({ ...i, currentSavings: i.currentSavings + lumpSum })
}

export function compactINR(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function fullINR(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
