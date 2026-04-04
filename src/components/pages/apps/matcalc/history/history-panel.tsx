import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'

import { PropsPanel } from '@/components/props-panel'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { config } from '@/config'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { IconToggle } from '@/themed/v2/toggle'
import { FolderTree } from 'lucide-react'
import { useState } from 'react'
import { useApp, useHistory } from './history-store'
import { HistoryTabs } from './history-tabs'

interface IProps extends IDivProps {
  defaultHeightRem?: number
}

export function HistoryPanel({ ref }: IProps) {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { reset } = useHistory()

  const app = useApp()

  const [tab, setTab] = useState('list')

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

      <PropsPanel ref={ref} className="gap-y-2 px-1">
        <VCenterRow className="justify-end gap-x-2 px-1">
          <IconToggle
            title="View history tree"
            pressed={tab === 'tree'}
            onPressedChange={pressed => setTab(pressed ? 'tree' : 'list')}
          >
            <FolderTree className="w-4" />
          </IconToggle>

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

        <Tabs value={tab} className="flex flex-col grow">
          <TabsContent value="list" className="grow flex flex-col">
            <VScrollPanel className="grow">
              <HistoryTabs />
            </VScrollPanel>
          </TabsContent>
          <TabsContent value="tree" className="grow flex flex-col">
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
    </>
  )
}
