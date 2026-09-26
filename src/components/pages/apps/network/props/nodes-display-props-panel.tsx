import { PropsPanel } from '@/components/props-panel'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings-store'

import { PropRow } from '@/components/dialogs/prop-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import { Button } from '@/components/shadcn/ui/themed/v2/button'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_UPDATE } from '@/consts'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useEffect, useState } from 'react'
import { useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'
import { GroupItem } from './group-props-panel'

export function NodesDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { setGroups, groups } = useNetwork()

  const [text, setText] = useState('')

  useEffect(() => {
    if (userData.labels.ids.length > 0) {
      setText(
        [...userData.labels.ids]
          .sort((a, b) => a.localeCompare(b))
          .map((id) => id)
          .join('\n')
      )
    }
  }, [userData.labels])

  // const debounceText = useDebounce(text)

  // useEffect(() => {
  //   updateSettings(
  //     produce(settings, (draft) => {
  //       draft.labels = debounceText
  //         .split('\n')
  //         .map((x) => x.trim())
  //         .filter((x) => x.length > 0)
  //     })
  //   )
  // }, [debounceText])

  return (
    <PropsPanel className="gap-y-2 pb-2 text-xs">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel
          className="flex flex-col"
          id="network-groups"
          defaultSize="50%"
          minSize="0%"
          collapsible={true}
        >
          <PropRow title="Groups" className="text-sm"></PropRow>
          <VScrollPanel className="grow">
            <DragDropProvider
              onDragEnd={(event) => {
                const newOrder = move(groups, event)

                setGroups(newOrder)
              }}
            >
              <ul className="flex flex-col gap-y-1">
                {groups.map((gr, gri) => {
                  return <GroupItem index={gri} group={gr} key={gr.id} />
                })}
              </ul>

              {/* <DragOverlay>
              {activeId ? (
                <GroupItem
                  group={groups.find(group => group.id === activeId)!.group}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
            </DragDropProvider>
          </VScrollPanel>
        </ResizablePanel>
        <ThinVResizeHandle />
        <ResizablePanel
          id="network-nodes"
          defaultSize="50%"
          minSize="0%"
          className="flex flex-col gap-y-1.5"
          collapsible={true}
        >
          <PropRow title="Nodes" className="text-sm">
            <ToolbarButton
              className="text-xs font-normal"
              checked={settings.plot.nodes.labels.showAll}
              onClick={() =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.labels.showAll =
                      !settings.plot.nodes.labels.showAll
                  })
                )
              }
            >
              All Labels
            </ToolbarButton>
          </PropRow>
          <Textarea
            title="Node Label"
            value={text}
            onTextChange={(value) => setText(value)}
          />
          <VCenterRow className="gap-x-1">
            <Button
              variant="app-theme"
              onClick={() =>
                updateUserData(
                  produce(userData, (draft) => {
                    draft.labels.ids = [
                      ...new Set(
                        text
                          .split('\n')
                          .map((x) => x.trim())
                          .filter((x) => x.length > 0)
                      ),
                    ].sort()
                  })
                )
              }
            >
              {TEXT_UPDATE}
            </Button>
            <Button
              checked={userData.labels.mode === 'exact'}
              onClick={() =>
                updateUserData(
                  produce(userData, (draft) => {
                    draft.labels.mode =
                      userData.labels.mode === 'exact' ? 'partial' : 'exact'
                  })
                )
              }
            >
              Exact Match
            </Button>
          </VCenterRow>
        </ResizablePanel>
      </ResizablePanelGroup>
    </PropsPanel>
  )
}
