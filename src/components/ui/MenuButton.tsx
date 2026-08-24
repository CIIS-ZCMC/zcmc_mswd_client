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
  size = 'md',
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
    <div ref={containerRef} className="relative">
      <Button
        variant={variant}
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        {icon}
        {label}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </Button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg',
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
              className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              {item.icon && <span className="mt-0.5 text-primary">{item.icon}</span>}
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
