import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted font-medium text-foreground shadow-2xs select-none',
        className,
      )}
      {...props}
    />
  )
}

export function AvatarFallback({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 text-xs uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
