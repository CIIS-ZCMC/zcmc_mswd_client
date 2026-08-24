import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button, type ButtonProps } from './Button'
import { cn } from '@/lib/utils'

export interface MenuItem {
  key: string
  label: string
  description?: string
  icon?: ReactNode
  onSelect: () => void
  /** Hidden entirely when false — used for permission gating. */
  visible?: boolean
}

interface MenuButtonProps {
  label: string
  icon?: ReactNode
  items: MenuItem[]
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  align?: 'left' | 'right'
}

/**
 * A button that opens a small menu of actions. Closes on Escape, on outside
 * click, and after a selection.
 */
export function MenuButton({
  label,
  icon,
  items,
  variant = 'primary',
  size = 'sm',
  align = 'right',
}: MenuButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const visible = items.filter((item) => item.visible !== false)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (visible.length === 0) return null

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        variant={variant}
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="gap-1.5 text-xs font-semibold shadow-xs"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </Button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md transition-all duration-150 animate-in fade-in-0 zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {visible.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className="group flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-all duration-150 hover:bg-accent/80"
            >
              {item.icon && <span className="mt-0.5 text-primary group-hover:scale-110 transition-transform">{item.icon}</span>}
              <span className="min-w-0">
                <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                {item.description && (
                  <span className="block text-[11px] text-muted-foreground font-medium">{item.description}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
