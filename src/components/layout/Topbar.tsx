import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth'

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
    : 'U'

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md shadow-2xs">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs shadow-2xs backdrop-blur-xs">
            <Avatar className="size-6 ring-1 ring-brand-500/30">
              <AvatarFallback className="bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col text-left sm:flex">
              <span className="font-semibold text-foreground leading-tight">{user.name}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{user.role ?? 'Case Worker'}</span>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => void logout()}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs"
        >
          <LogOut className="size-3.5" />
          <span>Sign out</span>
        </Button>
      </div>
    </header>
  )
}

