import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import {
  compactINR,
  fireNumber,
  projectWealth,
  whatIfLumpSum,
  whatIfReturn,
  whatIfSip,
  yearsToTarget,
  type WealthProfile,
} from '@/lib/projection'

export const maxDuration = 60

const FALLBACK_PROFILE: WealthProfile = {
  currentAge: 28,
  monthlyIncome: 80_000,
  currentSavings: 5_00_000,
  monthlyInvestment: 25_000,
  annualReturnPct: 12,
}

function buildSystemPrompt(p: WealthProfile) {
  const sip = p.monthlyIncome > 0 ? Math.round((p.monthlyInvestment / p.monthlyIncome) * 100) : 0
  return `You are Kuber, an AI wealth coach for an individual managing their own money.

The user's profile (their real numbers — use these in every calculation):
- age: ${p.currentAge}
- post-tax monthly income: ${compactINR(p.monthlyIncome)}
- current savings + investments: ${compactINR(p.currentSavings)}
- monthly investment / SIP: ${compactINR(p.monthlyInvestment)}
- expected annual return: ${p.annualReturnPct}%
- implied savings rate: ${sip}% of income

Voice: coach-to-friend, all-lowercase, direct, plain language. answer first, math second. use em dashes for asides. no jargon. no preachy advice. respect the user's autonomy.

Currency: INR. use ₹. compact format: ₹1.2L for lakhs, ₹3.5 Cr for crores. always include the ₹ symbol.

Math rule: NEVER guess numbers. for every projection, what-if, FIRE calc, or years-to-goal, call the matching tool. cite numbers as "₹2.4 Cr at 60" not "around 2 crore".

Boundaries: you are a coaching tool, not a registered financial advisor. for specific investment, tax, or insurance decisions, gently point to a professional. don't recommend specific funds, stocks, or insurance products. compare options at the level of strategy ("invest the surplus vs prepay the loan"), not specific tickers.

Format: 1-3 short paragraphs OR a tight bulleted list. when comparing options, lead with the verdict, then 2-3 lines of why.

Today's date: 2026-05-16.`
}

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: UIMessage[]; profile?: WealthProfile }
  const profile = body.profile ?? FALLBACK_PROFILE

  const result = streamText({
    model: 'anthropic/claude-opus-4-7',
    system: buildSystemPrompt(profile),
    messages: await convertToModelMessages(body.messages),
    stopWhen: stepCountIs(8),
    tools: {
      get_profile: tool({
        description: 'Read the current wealth profile. Use this when the user asks "what do you know about me" or to verify inputs before answering.',
        inputSchema: z.object({}),
        execute: async () => ({
          ...profile,
          formatted: {
            currentSavings: compactINR(profile.currentSavings),
            monthlyInvestment: compactINR(profile.monthlyInvestment),
            monthlyIncome: compactINR(profile.monthlyIncome),
          },
        }),
      }),
      project_wealth: tool({
        description: 'Project wealth at a target age using the user\'s current rate (savings + SIP + return). Returns the trajectory points and the final wealth.',
        inputSchema: z.object({
          targetAge: z.number().int().min(profile.currentAge + 1).max(100),
        }),
        execute: async ({ targetAge }) => {
          const r = projectWealth({
            currentAge: profile.currentAge,
            targetAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          })
          return {
            finalAge: targetAge,
            finalWealth: r.finalWealth,
            formatted: compactINR(r.finalWealth),
            sampledPoints: r.points.filter((_, idx) => idx % Math.max(1, Math.floor(r.points.length / 8)) === 0),
          }
        },
      }),
      years_to_target: tool({
        description: 'Years from now until the user reaches a specific wealth target (e.g. ₹1 Cr, ₹4 Cr FIRE number). Returns years + the age at which they hit it.',
        inputSchema: z.object({
          target: z.number().positive().describe('Target wealth in INR (e.g. 10000000 for ₹1 Cr).'),
        }),
        execute: async ({ target }) => {
          const yrs = yearsToTarget(target, {
            currentAge: profile.currentAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          })
          if (!Number.isFinite(yrs)) {
            return {
              reachable: false,
              note: 'not reachable at current rate within 80 years. suggest raising SIP, raising return assumption, or lowering the target.',
            }
          }
          return {
            reachable: true,
            years: Number(yrs.toFixed(1)),
            atAge: Math.round(profile.currentAge + yrs),
            target,
            targetFormatted: compactINR(target),
          }
        },
      }),
      fire_number: tool({
        description: 'Calculate the user\'s FIRE number (financial independence target) given annual expenses, using the 4% safe withdrawal rate by default. Returns the corpus needed and years to reach it.',
        inputSchema: z.object({
          annualExpenses: z.number().positive().describe('Estimated annual expenses in retirement (INR).'),
          swr: z.number().min(0.02).max(0.08).default(0.04).describe('Safe withdrawal rate (4% default).'),
        }),
        execute: async ({ annualExpenses, swr }) => {
          const target = fireNumber(annualExpenses, swr)
          const yrs = yearsToTarget(target, {
            currentAge: profile.currentAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          })
          return {
            fireNumber: target,
            fireNumberFormatted: compactINR(target),
            swr,
            yearsToReach: Number.isFinite(yrs) ? Number(yrs.toFixed(1)) : null,
            atAge: Number.isFinite(yrs) ? Math.round(profile.currentAge + yrs) : null,
          }
        },
      }),
      what_if_sip_change: tool({
        description: 'Model the impact of changing the user\'s monthly SIP by a delta (positive or negative). Compare base vs new trajectory at a target age.',
        inputSchema: z.object({
          deltaInr: z.number().describe('Change to monthly SIP in INR. Positive to increase, negative to decrease.'),
          targetAge: z.number().int().min(profile.currentAge + 1).max(100).default(60),
        }),
        execute: async ({ deltaInr, targetAge }) => {
          const baseInputs = {
            currentAge: profile.currentAge,
            targetAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          }
          const base = projectWealth(baseInputs)
          const next = whatIfSip(deltaInr, baseInputs)
          return {
            targetAge,
            base: { finalWealth: base.finalWealth, formatted: compactINR(base.finalWealth) },
            withChange: { finalWealth: next.finalWealth, formatted: compactINR(next.finalWealth) },
            delta: next.finalWealth - base.finalWealth,
            deltaFormatted: compactINR(next.finalWealth - base.finalWealth),
            newMonthlySip: profile.monthlyInvestment + deltaInr,
          }
        },
      }),
      what_if_return: tool({
        description: 'Model the impact of a different annual return assumption (e.g. conservative 9% vs optimistic 14%).',
        inputSchema: z.object({
          newPct: z.number().min(0).max(30),
          targetAge: z.number().int().min(profile.currentAge + 1).max(100).default(60),
        }),
        execute: async ({ newPct, targetAge }) => {
          const baseInputs = {
            currentAge: profile.currentAge,
            targetAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          }
          const base = projectWealth(baseInputs)
          const next = whatIfReturn(newPct, baseInputs)
          return {
            targetAge,
            baseReturn: profile.annualReturnPct,
            newReturn: newPct,
            base: { finalWealth: base.finalWealth, formatted: compactINR(base.finalWealth) },
            withChange: { finalWealth: next.finalWealth, formatted: compactINR(next.finalWealth) },
            delta: next.finalWealth - base.finalWealth,
            deltaFormatted: compactINR(next.finalWealth - base.finalWealth),
          }
        },
      }),
      what_if_lump_sum: tool({
        description: 'Model adding a one-time lump sum (e.g. bonus, gift, sale proceeds) to current investments today.',
        inputSchema: z.object({
          amount: z.number().positive(),
          targetAge: z.number().int().min(profile.currentAge + 1).max(100).default(60),
        }),
        execute: async ({ amount, targetAge }) => {
          const baseInputs = {
            currentAge: profile.currentAge,
            targetAge,
            currentSavings: profile.currentSavings,
            monthlyInvestment: profile.monthlyInvestment,
            annualReturnPct: profile.annualReturnPct,
          }
          const base = projectWealth(baseInputs)
          const next = whatIfLumpSum(amount, baseInputs)
          return {
            targetAge,
            lumpSum: amount,
            lumpSumFormatted: compactINR(amount),
            base: { finalWealth: base.finalWealth, formatted: compactINR(base.finalWealth) },
            withChange: { finalWealth: next.finalWealth, formatted: compactINR(next.finalWealth) },
            delta: next.finalWealth - base.finalWealth,
            deltaFormatted: compactINR(next.finalWealth - base.finalWealth),
          }
        },
      }),
      savings_rate: tool({
        description: 'Current savings rate as % of income (monthly investment / monthly income).',
        inputSchema: z.object({}),
        execute: async () => {
          const rate = profile.monthlyIncome > 0
            ? Math.round((profile.monthlyInvestment / profile.monthlyIncome) * 100)
            : 0
          let band: string
          if (rate >= 40) band = 'top decile'
          else if (rate >= 30) band = 'top quartile'
          else if (rate >= 20) band = 'above median'
          else if (rate >= 10) band = 'below median'
          else band = 'lowest quartile'
          return {
            ratePct: rate,
            band,
            monthlyInvested: compactINR(profile.monthlyInvestment),
            monthlyIncome: compactINR(profile.monthlyIncome),
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
