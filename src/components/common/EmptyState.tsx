import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <Inbox className="size-8 text-ink-muted" aria-hidden />
      <p className="text-sm text-ink-muted">{message}</p>
      {action}
    </div>
  )
}
