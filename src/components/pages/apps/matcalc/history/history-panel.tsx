import { TEXT_CLEAR, TEXT_OK } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { PropsPanel } from '@/components/props-panel'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { IconToggle } from '@/themed/v2/toggle'
import { FolderTree } from 'lucide-react'
import { useState } from 'react'

import { useHistory } from './history-provider/history-provider'
import { HistoryTabs } from './history-tabs'

interface IProps extends IDivProps {
  defaultHeightRem?: number
}

export function HistoryPanel({ ref }: IProps) {
  const { reset } = useHistory()

  const [tab, setTab] = useState('list')
  const { open: openDialog } = useDialogs()
  //const cb = useMemo(() => currentBranch(history)[0], [history])
  //const [_, stepIdx] = useMemo(() => currentStep(history), [history])

  return (
    <PropsPanel ref={ref} className="gap-y-2 ">
      <VCenterRow className="justify-end gap-x-2 px-1">
        <IconToggle
          title="View history tree"
          pressed={tab === 'tree'}
          onPressedChange={(pressed) => setTab(pressed ? 'tree' : 'list')}
        >
          <FolderTree className="w-4" />
        </IconToggle>

        <LinkButton
          // ripple={false}
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Clear History',
                content: 'Are you sure you want to clear the history?',
                callback: (r) => {
                  if (r === TEXT_OK) {
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

      <Tabs value={tab} className="flex flex-col grow">
        <TabsContent value="list">
          <VScrollPanel className="grow">
            <HistoryTabs />
          </VScrollPanel>
        </TabsContent>
        <TabsContent value="tree">
          <VScrollPanel className="grow h-full">
            {/* <HistoryAppTree
                onTabChange={t => {
                  if (t.type === 'step') {
                    goto(t.id, 'step')
                  }
                }}
              /> */}
          </VScrollPanel>
        </TabsContent>
      </Tabs>
    </PropsPanel>
  )
}
