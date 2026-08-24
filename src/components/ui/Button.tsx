import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-2xs active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs',
        primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-muted/80 shadow-2xs',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-2xs',
        ghost: 'hover:bg-muted hover:text-foreground shadow-none active:scale-100',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
        link: 'text-brand-600 underline-offset-4 hover:underline shadow-none active:scale-100',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2 text-sm',
        lg: 'h-10 rounded-md px-6 text-sm',
        icon: 'size-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}

