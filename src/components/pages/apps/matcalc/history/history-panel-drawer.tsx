import { TEXT_CLEAR, TEXT_OK } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { Drawer } from '@/components/drawer'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { History } from 'lucide-react'
import { useState } from 'react'

import { useHistory } from './history-provider/history-provider'
import { HistoryTabs } from './history-tabs'

export function HistoryDrawer() {
  const { open: openDialog } = useDialogs()

  const { reset } = useHistory()

  const [tab] = useState('list')

  return (
    <Drawer
      className="w-96"
      trigger={
        <IconButton>
          <History size={20} strokeWidth={1.5} />
        </IconButton>
      }
    >
      <VCenterRow className="justify-end gap-x-2 px-2 h-8">
        <LinkButton
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

      <h2 className="font-bold p-2 text-base">History</h2>

      <Tabs value={tab} className="flex flex-col grow">
        <TabsContent value="list" className="grow flex flex-col">
          <VScrollPanel className="grow">
            <HistoryTabs />
          </VScrollPanel>
        </TabsContent>
      </Tabs>
    </Drawer>
  )
}
