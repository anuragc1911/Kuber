'use client'

import { type CSSProperties, useEffect, useRef } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

interface BorderBeamProps {
  lightWidth?: number
  duration?: number
  lightColor?: string
  /** Override the radial gradient entirely. Use this for multi-stop gradients. */
  gradient?: string
  borderWidth?: number
  className?: string
  [key: string]: unknown
}

/**
 * Animated light traveling around the parent's border.
 * Mount inside a `relative overflow-hidden` element with a border-radius — the beam
 * will trace the rectangular border path and be masked to only show on the ring.
 */
export function BorderBeam({
  lightWidth = 200,
  duration = 10,
  lightColor = '#FAFAFA',
  gradient,
  borderWidth = 1,
  className,
  ...props
}: BorderBeamProps) {
  const pathRef = useRef<HTMLDivElement>(null)

  const updatePath = () => {
    const div = pathRef.current
    if (!div) return
    div.style.setProperty(
      '--path',
      `path("M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0")`,
    )
  }

  useEffect(() => {
    updatePath()
    const ro = new ResizeObserver(updatePath)
    if (pathRef.current) ro.observe(pathRef.current)
    window.addEventListener('resize', updatePath)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updatePath)
    }
  }, [])

  return (
    <div
      ref={pathRef}
      aria-hidden
      style={
        {
          '--duration': duration,
          '--border-width': `${borderWidth}px`,
          // mask the inner area so only the border ring shows
          maskImage:
            'linear-gradient(#000, #000), linear-gradient(#000, #000)',
          WebkitMaskImage:
            'linear-gradient(#000, #000), linear-gradient(#000, #000)',
          maskClip: 'padding-box, border-box',
          WebkitMaskClip: 'padding-box, border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          borderWidth: `${borderWidth}px`,
          borderStyle: 'solid',
          borderColor: 'transparent',
        } as CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 z-0 rounded-[inherit]',
        className,
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 aspect-square rounded-full"
        style={
          {
            width: `${lightWidth}px`,
            height: `${lightWidth}px`,
            background:
              gradient ?? `radial-gradient(ellipse at center, ${lightColor}, transparent 60%)`,
            offsetPath: 'var(--path)',
            offsetAnchor: 'center',
            inset: 'auto',
          } as CSSProperties
        }
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
