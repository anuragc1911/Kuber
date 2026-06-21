import { cn } from '@/lib/utils'

function hexToRgba(hex: string, alpha: number = 1): string {
  let hexValue = hex.replace('#', '')
  if (hexValue.length === 3) {
    hexValue = hexValue
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(0, 0, 0, 1)'
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

export function GlowingButton({ children, className, glowColor = '#B0C4DE', ...rest }: Props) {
  const glow = hexToRgba(glowColor)
  const glowVia = hexToRgba(glowColor, 0.075)
  const glowTo = hexToRgba(glowColor, 0.2)

  return (
    <button
      {...rest}
      style={
        {
          '--glow-color': glow,
          '--glow-color-via': glowVia,
          '--glow-color-to': glowTo,
        } as React.CSSProperties
      }
      className={cn(
        'group/glow relative z-10 inline-flex h-8 w-min items-center justify-center overflow-hidden whitespace-nowrap rounded-md border border-r-0 bg-gradient-to-t px-3 text-xs transition-colors duration-200',
        'from-background to-muted text-foreground hover:text-muted-foreground border-border',
        'after:absolute after:inset-0 after:z-20 after:rounded-[inherit] after:bg-gradient-to-r after:from-transparent after:from-40% after:via-[var(--glow-color-via)] after:via-70% after:to-[var(--glow-color-to)] after:shadow-[hsl(var(--foreground)/0.15)_0px_1px_0px_inset]',
        'before:absolute before:right-0 before:z-10 before:h-[60%] before:w-[3px] before:rounded-l before:bg-[var(--glow-color)] before:shadow-[-2px_0_10px_var(--glow-color)] before:transition-all before:duration-200 hover:before:translate-x-full',
        className,
      )}
    >
      <span className="relative z-30">{children}</span>
    </button>
  )
}
