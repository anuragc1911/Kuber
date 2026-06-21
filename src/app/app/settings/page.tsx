import { businessName, founderName } from '@/lib/data'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl space-y-10">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• settings</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">workspace.</h1>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <Field label="business" value={businessName} />
        <Field label="founder" value={founderName} />
        <Field label="plan" value="Kuber · ₹4,999/month" />
        <Field label="billing email" value="aanya@aroma.co" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="text-xs uppercase tracking-wider text-white/40">alerts</div>
        <Toggle label="cash dips below 3 months runway" on />
        <Toggle label="any SKU contribution turns negative" on />
        <Toggle label="refund rate spikes 50% week-over-week" on />
        <Toggle label="GST liability changes by ₹50,000+" on />
        <Toggle label="weekly digest every monday 9am" on />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-2">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-2">data</div>
        <button className="text-sm text-white/70 hover:text-white">export everything as CSV</button>
        <div className="block">
          <button className="text-sm text-rose-300/80 hover:text-rose-300">disconnect all integrations</button>
        </div>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/5 pb-3 last:border-0">
      <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-white/90">{value}</div>
    </div>
  )
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-white/80">{label}</div>
      <div
        className={
          on
            ? 'w-9 h-5 rounded-full bg-[#B0C4DE] flex items-center justify-end p-0.5'
            : 'w-9 h-5 rounded-full bg-white/10 flex items-center p-0.5'
        }
      >
        <div className={on ? 'size-4 rounded-full bg-black' : 'size-4 rounded-full bg-white/40'} />
      </div>
    </div>
  )
}
