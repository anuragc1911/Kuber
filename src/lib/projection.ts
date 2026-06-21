export type ProjectionInputs = {
  currentAge: number
  targetAge: number
  currentSavings: number
  monthlyInvestment: number
  annualReturnPct: number
}

export type ProjectionPoint = { age: number; wealth: number }

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

export function compactINR(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
