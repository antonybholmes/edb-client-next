import { randId } from '@/lib/id'
import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from '../icons/close-icon'
import { VCenterRow } from '../layout/v-center-row'
import { ActionsDevPanel } from '../pages/apps/matcalc/history/actions-dev-panel'
import { HistoryDevPanel } from '../pages/apps/matcalc/history/history-dev-panel'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowBlock } from '../tabs/tab-indicator-follow-block'
import {
  TabIndicatorProvider,
  useTabIndicators,
} from '../tabs/tab-indicator-provider'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'

import { useDevSettings } from './dev-setting-store'

const TABS = [
  { id: 'history', label: 'History' },
  { id: 'actions', label: 'Actions' },
]

function _DevPanel() {
  const [activeTab, setActiveTab] = useState('history')
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])

  const { setMessage } = useDevSettings()

  const { setPosition, setSelectedPosition } = useTabIndicators() //_id)

  // setup initial selected tab
  useEffect(() => {
    const containerRect = tabListRef.current!.getBoundingClientRect()
    const clientRect = buttonsRef.current[0]!.getBoundingClientRect()

    setSelectedPosition({
      x: clientRect.left - containerRect.left,
      y: 0,
      h: clientRect.height,
      w: clientRect.width,
    })
  }, [])

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col bg-background"
    >
      <VCenterRow className="justify-between border-b border-border pr-1">
        <TabsList
          className="text-xs"
          ref={tabListRef}
          onMouseLeave={() => {
            setPosition(undefined)
          }}
        >
          {TABS.map((tab, ti) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              variant="plain"
              ref={(el) => {
                buttonsRef.current[ti] = el!
              }}
              onClick={() => {
                const containerRect =
                  tabListRef.current!.getBoundingClientRect()
                const clientRect =
                  buttonsRef.current[ti]!.getBoundingClientRect()

                setSelectedPosition({
                  x: clientRect.left - containerRect.left,
                  y: 0,
                  h: clientRect.height,
                  w: clientRect.width,
                })
              }}
              onMouseOver={() => {
                const containerRect =
                  tabListRef.current!.getBoundingClientRect()
                const clientRect =
                  buttonsRef.current[ti]!.getBoundingClientRect()

                setPosition({
                  x: clientRect.left - containerRect.left,
                  y: 0,
                  h: clientRect.height,
                  w: clientRect.width,
                })
              }}
              className="z-10 h-6"
            >
              {tab.label}
            </TabsTrigger>
          ))}

          <TabIndicatorFollowBlock rounded={false} />
          <TabIndicatorSelectedH />
        </TabsList>

        <button
          title="Close Dev Panel"
          aria-label="Close Dev Panel"
          onClick={() => {
            // close the dev panel, we do this by setting a unique message
            // so that the dev layout sees the change and hides the panel
            // every time
            setMessage(randId('collapse'))
          }}
        >
          <CloseIcon size={20} />
        </button>
      </VCenterRow>

      <TabsContent value="history">
        <HistoryDevPanel />
      </TabsContent>
      <TabsContent value="actions">
        <ActionsDevPanel />
      </TabsContent>
    </Tabs>
  )
}

// <ResizablePanelGroup orientation="horizontal" className="h-full">

export function DevPanel() {
  return (
    <TabIndicatorProvider>
      <_DevPanel />
    </TabIndicatorProvider>
  )
}
