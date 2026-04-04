import { BaseCol } from '@/components/layout/base-col'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import type { ITab } from '@/components/tabs/tab-provider'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { format } from 'date-fns'
import { useState } from 'react'
import { SELECTABLE_TYPES } from './actions-dev-panel'
import { HistoryTree } from './history-tree'

export function HistoryDevPanel() {
  const [selectedTab, setSelectedTab] = useState<ITab | null>(null)

  return (
    // <ResizablePanelGroup
    //   orientation="horizontal"
    //   className="px-2 grow"
    //   //autoSaveId="rev-comp-vert"
    // >
    //   <ResizablePanel
    //     id="chart"
    //     defaultSize="40%"
    //     minSize="0%"
    //     className="flex flex-col text-sm"
    //     collapsible={true}
    //   >

    <ResizablePanelGroup orientation="vertical" className="h-full text-xs">
      <ResizablePanel defaultSize="60%" className="p-1">
        <VScrollPanel className="grow h-full">
          <HistoryTree
            onTabChange={t => {
              console.log('Selected tab:', t)
              if (SELECTABLE_TYPES.has(t.type ?? '')) {
                setSelectedTab(t)
              }
            }}
            //className="text-sm"

            //value={tab!}
            // onValueChange={t => {
            //   if (t && t.content) {
            //     // only use tabs from the tree that have content, otherwise
            //     // the ui will appear empty
            //     setTab(t)
            //   }
            // }}
          />
        </VScrollPanel>
      </ResizablePanel>

      <ThinVResizeHandle autoHide={false} />

      <ResizablePanel defaultSize="40%" className="p-2">
        {selectedTab && (
          <BaseCol>
            <p className="font-semibold">{selectedTab.name}</p>
            <p>Type: {selectedTab.type ?? 'Unknown'}</p>
            <p>Id: {selectedTab.id}</p>
            <p>Path: {selectedTab.path}</p>
            <p>
              Created:{' '}
              {format(
                selectedTab.createdAt
                  ? new Date(selectedTab.createdAt)
                  : new Date(),
                'yyyy-MM-dd HH:mm:ss'
              )}
            </p>
          </BaseCol>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>

    //   </ResizablePanel>
    //   <ThinHResizeHandle />
    //   <ResizablePanel
    //     className="flex flex-col text-sm"
    //     id="output"
    //     defaultSize="60%"
    //     minSize="0%"
    //     collapsible={true}
    //   ></ResizablePanel>
    // </ResizablePanelGroup>
  )
}
