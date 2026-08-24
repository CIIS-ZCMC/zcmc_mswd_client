import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white shadow-xs',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border-border text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        info: 'border-brand-200 bg-brand-50 text-brand-700',
      },
      tone: {
        neutral: 'border-border bg-slate-100 text-slate-700',
        info: 'border-brand-200 bg-brand-50 text-brand-700 font-mono',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        danger: 'border-red-200 bg-red-50 text-red-700',
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

