import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:brightness-110 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        primary: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:brightness-110 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-secondary text-secondary-foreground border border-border/80 hover:bg-muted hover:border-border shadow-xs',
        outline: 'border border-input bg-background/80 hover:bg-accent hover:text-accent-foreground shadow-xs backdrop-blur-xs',
        ghost: 'hover:bg-accent/80 hover:text-accent-foreground shadow-none active:scale-100',
        danger: 'bg-gradient-to-r from-destructive to-red-700 text-destructive-foreground hover:brightness-110 shadow-xs',
        destructive: 'bg-gradient-to-r from-destructive to-red-700 text-destructive-foreground hover:brightness-110 shadow-xs',
        link: 'text-brand-600 underline-offset-4 hover:underline shadow-none active:scale-100 font-medium',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2 text-sm',
        lg: 'h-10 rounded-lg px-6 text-sm',
        icon: 'size-9 rounded-lg',
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


