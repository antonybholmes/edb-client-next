import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinHResizeHandle,
} from '@/themed/resizable'

import type { IChildrenProps } from '@/interfaces/children-props'

import { useDialogs } from '@/components/dialogs/dialogs'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { History } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useHistory } from './history-provider/history-provider'
import { HistoryTabs } from './history-tabs'

export interface IProps extends IChildrenProps {}

/**
 * Layout that adds a resizable dev panel to the right side of the screen.
 * The default is to keep it in dev mode only, but can be forced to stay in prod
 * by setting the PUBLIC_KEEP_DEV_LAYOUT_IN_PROD env var to 'true'.
 *
 * @param param0
 * @returns
 */
export function HistoryLayout({ children }: IProps) {
  const leftPanelRef = useRef(null)

  const { reset } = useHistory()

  const { settings, historySidebarOpen } = useEdbSettings()

  const { open: openDialog } = useDialogs()

  useEffect(() => {
    if (settings.history.sidebar.show) {
      // @ts-ignore
      leftPanelRef.current?.expand()
    } else {
      // @ts-ignore
      leftPanelRef.current?.collapse()
    }
  }, [settings.history.sidebar.show])

  return (
    <ResizablePanelGroup orientation="horizontal" className="grow h-full">
      <ResizablePanel defaultSize="80%" minSize="10%" className="flex flex-col">
        {children}
      </ResizablePanel>

      <ThinHResizeHandle
        //autoHide={false}
        style={{ paddingLeft: 0, paddingRight: 0 }}
      />

      <ResizablePanel
        panelRef={leftPanelRef}
        defaultSize="20%"
        maxSize="40%"
        collapsible={true}
        minSize="5%"
        onResize={(size) => {
          // size is percentage
          if (size.asPercentage <= 0.01) {
            historySidebarOpen(false)
          }
        }}
        className="flex flex-col text-xs overflow-hidden min-h-0"
      >
        {/* <BaseCol className="mx-2 mb-2 p-2 rounded-xl bg-background/75 hover:bg-background trans-color grow border border-border/30 hover:border-border/50 gap-y-2 h-full"> */}
        <VCenterRow className="justify-between gap-x-2 h-8 px-1">
          <h2 className="font-medium">History</h2>
          <VCenterRow className="gap-x-2">
            {/* <IconToggle
                  title="View history tree"
                  pressed={tab === 'tree'}
                  onPressedChange={pressed => setTab(pressed ? 'tree' : 'list')}
                >
                  <FolderTree className="w-4" />
                </IconToggle> */}

            <LinkButton
              // ripple={false}
              onClick={() => {
                openDialog({
                  type: 'warning',
                  payload: {
                    title: 'Clear History',
                    content: 'Are you sure you want to clear the history?',
                    callback: (response) => {
                      if (response === TEXT_OK) {
                        reset()
                      }
                    },
                  },
                })
              }}
              title="Clear History"
            >
              {TEXT_CLEAR}
            </LinkButton>
          </VCenterRow>
        </VCenterRow>

        <BaseCol className="p-2 rounded-xl bg-background/75 hover:bg-background trans-color grow border border-border/30">
          <VScrollPanel className="h-full">
            <HistoryTabs />
          </VScrollPanel>
        </BaseCol>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function HistoryShowButton() {
  const { settings, toggleHistorySidebar } = useEdbSettings()

  return (
    <ToolbarIconButton
      checked={settings.history.sidebar.show}
      onClick={() => {
        toggleHistorySidebar()
      }}
      title={settings.history.sidebar.show ? 'Close History' : 'Open History'}
      //aria-label="History"
    >
      <History size={20} strokeWidth={1.5} />
    </ToolbarIconButton>
  )
}
