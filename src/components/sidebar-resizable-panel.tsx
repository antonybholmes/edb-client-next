import { cn } from '@/lib/shadcn-utils'
import { ChevronRight } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { usePanelRef } from 'react-resizable-panels'
import { ResizablePanel } from './shadcn/ui/themed/resizable'

const CLS = `flex flex-row items-center gap-x-0.5 w-full px-0.5
  shrink-0 grow-0 h-7 border-t border-b border-transparent
  data-[collapsed=false]:hover:bg-muted/25  
  data-[collapsed=false]:border-b-border/50 
  data-[collapsed=false]:hover:border-b-border/70
  data-[first=true]:border-t-border/50 
  data-[first=true]:hover-border-t-border/70 
  trans-color`

export function SidebarResizablePanel({
  title,
  isFirst = false,
  collapsedSize = '1.75rem',
  collapsible = true,
  children,
  ...props
}: Omit<ComponentProps<typeof ResizablePanel>, 'title'> & {
  isFirst?: boolean
  title?: ReactNode
}) {
  const ref = usePanelRef()

  const [collapsed, setCollapsed] = useState(
    ref.current?.isCollapsed() ?? false
  )

  const toggle = () => {
    collapsed ? ref.current?.resize('20%') : ref.current?.collapse()

    setCollapsed(!collapsed)
  }

  return (
    <ResizablePanel
      panelRef={ref}
      id="sidebar"
      //defaultSize={20}
      //minSize={15}
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      onResize={(size) => {
        setCollapsed(size.asPercentage < 5)
      }}
      {...props}
    >
      <button
        data-collapsed={collapsed}
        data-first={isFirst}
        onClick={toggle}
        className={CLS}
      >
        <ChevronRight
          className={cn('trans-300 transition-transform', {
            'rotate-90': !ref.current?.isCollapsed(),
          })}
          size={16}
        />

        <h2 className="font-semibold text-xs">{title}</h2>
      </button>

      {children}
    </ResizablePanel>
  )
}
