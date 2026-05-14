import type { AIInsight, FinanceState } from "./types";
import { spendByCategory, totalsThisMonth, dailySeries, fmtMoney } from "./finance";

export function generateInsights(state: FinanceState): AIInsight[] {
  const out: AIInsight[] = [];
  const t = totalsThisMonth(state);
  const byCat = spendByCategory(state);
  const days = dailySeries(state, 14);
  const cur = state.currency;

  // Savings rate
  const incomeBase = Math.max(t.income, state.monthlyIncome);
  const rate = incomeBase > 0 ? (t.savings / incomeBase) * 100 : 0;
  if (rate >= 20) {
    out.push({
      id: "save-rate-high",
      tone: "positive",
      title: `You're saving ${rate.toFixed(0)}% of income`,
      body: `Excellent. At this pace you'll bank ${fmtMoney(t.savings * 12, cur)} per year. Consider routing the surplus into an index fund.`,
    });
  } else if (rate > 0 && rate < 10) {
    out.push({
      id: "save-rate-low",
      tone: "warning",
      title: `Savings rate is only ${rate.toFixed(0)}%`,
      body: `A healthy target is 15–20%. Try auto-saving an extra ${fmtMoney(Math.max(5, state.dailySavingGoal * 0.4), cur)}/day to close the gap.`,
    });
  }

  // Limits breach
  for (const lim of state.limits) {
    const spent = byCat[lim.category] || 0;
    if (lim.monthly > 0 && spent > lim.monthly) {
      out.push({
        id: `limit-${lim.category}`,
        tone: "danger",
        title: `Over budget on ${lim.category}`,
        body: `You've spent ${fmtMoney(spent, cur)} vs limit ${fmtMoney(lim.monthly, cur)}. Pause discretionary ${lim.category.toLowerCase()} purchases this week.`,
      });
    } else if (lim.monthly > 0 && spent / lim.monthly > 0.8) {
      out.push({
        id: `limit-near-${lim.category}`,
        tone: "warning",
        title: `${lim.category} at ${Math.round((spent / lim.monthly) * 100)}% of limit`,
        body: `Heads up — you have ${fmtMoney(lim.monthly - spent, cur)} left for the month.`,
      });
    }
  }

  // Today's spending
  if (t.todaySpending > 0) {
    const avg14 = days.reduce((a, b) => a + b.spending, 0) / 14;
    if (avg14 > 0 && t.todaySpending > avg14 * 1.5) {
      out.push({
        id: "spike-today",
        tone: "warning",
        title: "Today's spending is unusually high",
        body: `Today you've spent ${fmtMoney(t.todaySpending, cur)} vs a 14-day avg of ${fmtMoney(avg14, cur)}.`,
      });
    }
  }

  // Daily saving streak
  const streak = computeStreak(state);
  if (streak >= 3) {
    out.push({
      id: "streak",
      tone: "positive",
      title: `${streak}-day saving streak`,
      body: `Keep it going — every day adds ${fmtMoney(state.dailySavingGoal, cur)} toward your goal.`,
    });
  } else if (streak === 0 && state.dailySavingGoal > 0) {
    out.push({
      id: "streak-zero",
      tone: "info",
      title: "Missed today's auto-save",
      body: `Quick-add ${fmtMoney(state.dailySavingGoal, cur)} now to keep your streak alive.`,
    });
  }

  // Top category
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  if (topCat && topCat[1] > 0) {
    out.push({
      id: "top-cat",
      tone: "info",
      title: `${topCat[0]} is your top spending category`,
      body: `${fmtMoney(topCat[1], cur)} this month. Reducing this by 10% would free ${fmtMoney(topCat[1] * 0.1, cur)} for savings.`,
    });
  }

  // Cashflow
  if (t.net < 0) {
    out.push({
      id: "neg-cashflow",
      tone: "danger",
      title: "Negative cashflow this month",
      body: `You're spending ${fmtMoney(-t.net, cur)} more than you bring in. Trim the top 2 categories or pause auto-save temporarily.`,
    });
  } else if (t.net > 0) {
    out.push({
      id: "pos-cashflow",
      tone: "positive",
      title: `Surplus of ${fmtMoney(t.net, cur)} this month`,
      body: `Nice. Sweep ${fmtMoney(t.net * 0.7, cur)} into savings before the month ends.`,
    });
  }

  return out;
}

export function computeStreak(state: FinanceState): number {
  const set = new Set(state.transactions.filter((t) => t.type === "saving").map((t) => t.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (set.has(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // allow today to be missing without breaking streak (grace day)
      if (i === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

export function answerQuestion(state: FinanceState, q: string): string {
  const cur = state.currency;
  const t = totalsThisMonth(state);
  const byCat = spendByCategory(state);
  const text = q.toLowerCase().trim();

  if (/saving|save/.test(text)) {
    return `This month you've saved ${fmtMoney(t.savings, cur)} across ${
      state.transactions.filter((x) => x.type === "saving").length
    } entries. Your current streak is ${computeStreak(state)} days at ${fmtMoney(state.dailySavingGoal, cur)}/day.`;
  }
  if (/income|salary|earn/.test(text)) {
    return `Income this month: ${fmtMoney(t.income, cur)}. Configured monthly baseline: ${fmtMoney(state.monthlyIncome, cur)}.`;
  }
  if (/today/.test(text)) {
    return `Today you've spent ${fmtMoney(t.todaySpending, cur)} and saved ${fmtMoney(t.todaySavings, cur)}.`;
  }
  if (/food|groceries/.test(text)) {
    return `Food spending this month: ${fmtMoney(byCat["Food"] || 0, cur)}.`;
  }
  if (/transport|uber|gas/.test(text)) {
    return `Transport spending this month: ${fmtMoney(byCat["Transport"] || 0, cur)}.`;
  }
  if (/rent|housing/.test(text)) {
    return `Rent this month: ${fmtMoney(byCat["Rent"] || 0, cur)}.`;
  }
  if (/limit|budget/.test(text)) {
    const breached = state.limits.filter((l) => (byCat[l.category] || 0) > l.monthly);
    if (!breached.length) return "You're within every category limit so far this month. Keep going.";
    return `Over budget on: ${breached.map((b) => b.category).join(", ")}.`;
  }
  if (/net|cashflow|left/.test(text)) {
    return `Net cashflow this month: ${fmtMoney(t.net, cur)} (income − expenses − savings).`;
  }
  if (/top|biggest|highest/.test(text)) {
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    return top
      ? `Your biggest category this month is ${top[0]} at ${fmtMoney(top[1], cur)}.`
      : "No spending recorded yet this month.";
  }
  return `So far this month: income ${fmtMoney(t.income, cur)}, expenses ${fmtMoney(
    t.expenses,
    cur
  )}, saved ${fmtMoney(t.savings, cur)}. Net ${fmtMoney(t.net, cur)}. Ask me about a category, limit, or today.`;
}
