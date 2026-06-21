import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, { mark: string; word: string; gap: string }> = {
  sm: { mark: 'size-5', word: 'text-base', gap: 'gap-2' },
  md: { mark: 'size-6', word: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 'size-8', word: 'text-3xl', gap: 'gap-3' },
}

/**
 * Kuber monogram — geometric sans K constructed from sharp polygons.
 * Single solid color via currentColor; pair with a serif wordmark for contrast.
 */
export function KuberMark({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden
      className={cn(sizes[size].mark, 'text-foreground shrink-0', className)}
    >
      {/* vertical bar */}
      <path d="M3 2 H7 V22 H3 Z" />
      {/* upper diagonal (meets vertical mid-height) */}
      <path d="M7 11.6 L17.5 2 H22 L11.5 11.6 Z" />
      {/* lower diagonal (slightly bolder, ascending edge) */}
      <path d="M7 12.4 L11.5 12.4 L22 22 H17.5 Z" />
    </svg>
  )
}

export function KuberLogo({
  size = 'md',
  showWordmark = true,
  className,
}: {
  size?: Size
  showWordmark?: boolean
  className?: string
}) {
  const s = sizes[size]
  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <KuberMark size={size} />
      {showWordmark && (
        <span
          className={cn(
            'font-semibold text-foreground tracking-[-0.04em] lowercase',
            s.word,
          )}
        >
          kuber
        </span>
      )}
    </span>
  )
}
