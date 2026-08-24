import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-xs',
        secondary: 'border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border-border text-foreground bg-background/50',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        success: 'border-emerald-300/60 bg-emerald-50 text-emerald-800 font-medium',
        warning: 'border-amber-300/60 bg-amber-50 text-amber-800 font-medium',
        info: 'border-brand-300/60 bg-brand-50 text-brand-800 font-medium',
      },
      tone: {
        neutral: 'border-slate-200 bg-slate-100 text-slate-700',
        info: 'border-brand-200/80 bg-brand-50 text-brand-700 font-mono font-medium',
        success: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 font-medium',
        warning: 'border-amber-200/80 bg-amber-50 text-amber-700 font-medium',
        danger: 'border-red-200/80 bg-red-50 text-red-700 font-medium',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const appliedVariant = tone ? undefined : (variant ?? 'default')
  return <span className={cn(badgeVariants({ variant: appliedVariant, tone }), className)} {...props} />
}

