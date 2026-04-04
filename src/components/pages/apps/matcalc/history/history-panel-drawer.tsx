import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'

import { Drawer } from '@/components/drawer'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { config } from '@/config'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { History } from 'lucide-react'
import { useState } from 'react'
import { useApp, useHistory } from './history-store'
import { HistoryTabs } from './history-tabs'

export function HistoryDrawer() {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { reset } = useHistory()

  const app = useApp()

  const [tab] = useState('list')

  //const cb = useMemo(() => currentBranch(history)[0], [history])
  //const [_, stepIdx] = useMemo(() => currentStep(history), [history])

  return (
    <>
      {showDialog.id === 'Clear' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          title={config.appName}
          onResponse={r => {
            if (r === TEXT_OK) {
              reset()
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to clear the history?
        </OKCancelDialog>
      )}

      {/* {showDialog.id === 'Delete' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              historyDispatch({
                type: 'remove-step',
                stepId: showDialog.params!.step as number,
              })
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete the selected history item?
        </OKCancelDialog>
      )} */}

      <Drawer
        className="w-96"
        trigger={
          <IconButton>
            <History size={20} strokeWidth={1.5} />
          </IconButton>
        }
      >
        <VCenterRow className="justify-end gap-x-2 px-2 h-8">
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
              if (app) {
                setShowDialog({ id: 'Clear', params: {} })
              }
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
          {/* <TabsContent value="tree" className="grow flex flex-col">
              <VScrollPanel className="grow h-full">
                <HistoryAppTree
                  onTabChange={t => {
                    if (t.type === 'step') {
                      historyGoto(t.id)
                    }
                  }}
                />
              </VScrollPanel>
            </TabsContent> */}
        </Tabs>
      </Drawer>
    </>
  )
}
