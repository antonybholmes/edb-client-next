import { useDevSettings } from '@/components/dev/dev-setting-store'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinHResizeHandle,
} from '@/themed/resizable'

import { IS_DEV_MODE } from '@/consts'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'

import { DevPanel } from '@/components/dev/dev-panel'
import { useEffect, useRef, type ReactNode } from 'react'

const KEEP_IN_PROD = process.env.NEXT_PUBLIC_KEEP_DEV_LAYOUT_IN_PROD === 'true'

export interface IDevLayoutProps extends IChildrenProps {}

/**
 * Layout that adds a resizable dev panel to the right side of the screen.
 * The default is to keep it in dev mode only, but can be forced to stay in prod
 * by setting the PUBLIC_KEEP_DEV_LAYOUT_IN_PROD env var to 'true'.
 *
 * @param param0
 * @returns
 */
export function DevLayout({ className, children }: IDevLayoutProps) {
  const { message } = useDevSettings()
  const leftPanelRef = useRef(null)

  let elem: ReactNode = children

  useEffect(() => {
    if (message.startsWith('collapse') && leftPanelRef.current) {
      // @ts-ignore
      leftPanelRef.current.collapse()
    }
  }, [message])

  if (IS_DEV_MODE || KEEP_IN_PROD) {
    elem = (
      <ResizablePanelGroup
        orientation="horizontal"
        className={cn('grow ', className)}
      >
        <ResizablePanel defaultSize="75%" minSize="10%">
          {elem}
        </ResizablePanel>

        <ThinHResizeHandle
          autoHide={false}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        />

        <ResizablePanel
          panelRef={leftPanelRef}
          defaultSize="25%"
          collapsible={true}
          minSize="5%"
        >
          <DevPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return elem
}
