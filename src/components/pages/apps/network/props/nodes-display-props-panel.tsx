import { PropsPanel } from '@/components/props-panel'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings'

import { useDialogs } from '@/components/dialogs/dialogs'
import { PropRow } from '@/components/dialogs/prop-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/baseui/button'
import { Toggle } from '@/components/shadcn/ui/themed/baseui/toggle'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { SearchCheck, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'
import APP_INFO from '../manifest.json'
import { useNetwork } from '../network'
import { useUserData } from '../network-user-data'
import { useUserSessionData } from '../network-user-session-data'
import { GroupItem } from './group-props-panel'

export function NodesDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { settings: userSessionData } = useUserSessionData()
  const { setGroups, groups } = useNetwork()
  const { open: openDialog } = useDialogs()

  const [text, setText] = useState('')
  const [currentNodeText, setCurrentNodeText] = useState('')

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

  useEffect(() => {
    if (userSessionData.currentNode) {
      setCurrentNodeText(
        [`Node: ${userSessionData.currentNode.id}`]
          .concat(
            Object.entries(userSessionData.currentNode.data)
              .sort(([key1], [key2]) => key1.localeCompare(key2))
              .map(([key, value]) => `${key}: ${value}`)
          )
          .join('\n')
      )
    } else {
      setCurrentNodeText('')
    }
  }, [userSessionData.currentNode])

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
          id="current-node"
          defaultSize="15%"
          minSize="0%"
          className="flex flex-col gap-y-1.5"
          collapsible={true}
        >
          <span className="font-medium text-sm">Current Node</span>
          <Textarea value={currentNodeText} readOnly className="h-1" />
        </ResizablePanel>
        <ThinVResizeHandle autoHide={false} />

        <ResizablePanel
          id="network-nodes"
          defaultSize="40%"
          minSize="0%"
          className="flex flex-col gap-y-1.5"
          collapsible={true}
        >
          <PropRow
            title="Nodes"
            className="text-sm"
            contentCls="text-xs gap-x-2"
            leftChildren={
              <Button
                className="text-xs"
                size="xs"
                pad="sm"
                rounded="sm"
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
                title="Update Graph"
              >
                Update
              </Button>
            }
          >
            <VCenterRow>
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
            </VCenterRow>
            <LinkButton
              //variant="app-theme"
              //size="icon-xs"

              onClick={() =>
                openDialog({
                  type: 'warning',
                  payload: {
                    title: APP_INFO.name,
                    content: 'Are you sure you want to clear all the entries?',
                    callback: (r) => {
                      if (r === TEXT_OK) {
                        setText('')
                        updateUserData(
                          produce(userData, (draft) => {
                            draft.labels.ids = []
                          })
                        )
                      }
                    },
                  },
                })
              }
              title={TEXT_CLEAR}
            >
              {TEXT_CLEAR}
            </LinkButton>
          </PropRow>

          <Textarea
            title="Enter the id's of nodes to be highlighted"
            value={text}
            onTextChange={(value) => setText(value)}
          />
        </ResizablePanel>

        <ThinVResizeHandle autoHide={false} />

        <ResizablePanel
          className="flex flex-col"
          id="network-groups"
          defaultSize="45%"
          minSize="0%"
          collapsible={true}
        >
          <PropRow title="Groups" className="text-sm" />
          <VScrollPanel className="grow">
            <DragDropProvider
              onDragEnd={(event) => {
                const newOrder = move(groups.groups, event)

                setGroups(newOrder)
              }}
            >
              <ul className="flex flex-col gap-y-1">
                {groups.groups.map((gr, gri) => {
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
