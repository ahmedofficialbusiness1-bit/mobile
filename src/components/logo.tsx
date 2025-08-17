import { Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  isCollapsed,
}: {
  className?: string
  isCollapsed?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary-foreground',
        className
      )}
    >
      <div className="bg-primary-foreground/20 rounded-lg p-1.5">
        <Compass className="h-5 w-5 text-primary-foreground" />
      </div>
      {!isCollapsed && <span className="font-headline">MaliMax</span>}
    </div>
  )
}
