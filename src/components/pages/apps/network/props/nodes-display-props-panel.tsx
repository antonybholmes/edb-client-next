import { PropsPanel } from '@/components/props-panel'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings'

import { useDialogs } from '@/components/dialogs/dialogs'
import { PropRow } from '@/components/dialogs/prop-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import { Toggle } from '@/components/shadcn/ui/themed/v2/toggle'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { Broom, RotateCw, SearchCheck, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'
import { GroupItem } from './group-props-panel'

export function NodesDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { setGroups, groups } = useNetwork()
  const { open: openDialog } = useDialogs()

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
    <PropsPanel className="gap-y-2 text-xs">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel
          id="network-nodes"
          defaultSize="50%"
          minSize="0%"
          className="flex flex-col gap-y-1.5"
          collapsible={true}
        >
          <PropRow
            title="Nodes"
            className="text-sm"
            contentCls="text-xs gap-x-px"
            leftChildren={
              <IconButton
                //variant="app-theme"
                size="xs"

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
                title="Update Graph"
              >
                <RotateCw size={16} />
              </IconButton>
            }
          >
            {/* <LinkButton
              className="mr-5"
              onClick={() =>
                openDialog({
                  type: 'warning',
                  payload: {
                    content: 'Are you sure you want to clear all the text?',
                    callback: (r) => {
                      if (r === TEXT_OK) {
                        setText('')
                      }
                    },
                  },
                })
              }
            >
              {TEXT_CLEAR}
            </LinkButton> */}

            <Toggle
              aspect="icon"
              size="xs"
              pressed={userData.labels.mode === 'exact'}
              onPressedChange={(v) =>
                updateUserData(
                  produce(userData, (draft) => {
                    draft.labels.mode = v ? 'exact' : 'partial'
                  })
                )
              }
              title="Exact Match"
            >
              <SearchCheck size={16} />
            </Toggle>

            <Toggle
              aspect="icon"
              size="xs"
              pressed={settings.plot.nodes.labels.showAll}
              onPressedChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.labels.showAll = v
                  })
                )
              }
              title="Show All Labels"
            >
              <Tags size={16} />
            </Toggle>

            <IconButton
              //variant="app-theme"
              size="xs"

              onClick={() =>
                openDialog({
                  type: 'warning',
                  payload: {
                    content: 'Are you sure you want to clear all the text?',
                    callback: (r) => {
                      if (r === TEXT_OK) {
                        setText('')
                      }
                    },
                  },
                })
              }
              title={TEXT_CLEAR}
            >
              <Broom size={16} />
            </IconButton>
          </PropRow>
          {/* <SwitchPropRow
            title="Show All Labels"

            className="text-xs font-normal"
            checked={settings.plot.nodes.labels.showAll}
            onCheckedChange={(v) =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.plot.nodes.labels.showAll = v
                })
              )
            }
          /> */}
          <Textarea
            title="Node Label"
            value={text}
            onTextChange={(value) => setText(value)}
          />
          {/* <VCenterRow className="gap-x-3">
            <ToolbarButton
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
            </ToolbarButton>
            <Checkbox
              checked={userData.labels.mode === 'exact'}
              onCheckedChange={(v) =>
                updateUserData(
                  produce(userData, (draft) => {
                    draft.labels.mode = v ? 'exact' : 'partial'
                  })
                )
              }
            >
              Exact Match
            </Checkbox>
          </VCenterRow> */}
          {/* <VCenterRow>
            <LinkButton
              onClick={() =>
                openDialog({
                  type: 'warning',
                  payload: {
                    content: 'Are you sure you want to clear all the text?',
                    callback: (r) => {
                      if (r === TEXT_OK) {
                        setText('')
                      }
                    },
                  },
                })
              }
            >
              {TEXT_CLEAR}
            </LinkButton>
          </VCenterRow> */}
        </ResizablePanel>

        <ThinVResizeHandle autoHide={false} />

        <ResizablePanel
          className="flex flex-col"
          id="network-groups"
          defaultSize="50%"
          minSize="0%"
          collapsible={true}
        >
          <PropRow title="Groups" className="text-sm" />
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
      </ResizablePanelGroup>
    </PropsPanel>
  )
}
