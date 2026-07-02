import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { makeNewGroup, type IClusterGroup } from '@/lib/cluster-group'

import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { useSelectionRange } from '@/providers/selection-range-provider'

import { download, downloadJson } from '@/lib/download-utils'
import { range } from '@/lib/math/range'
import { useEffect, useState } from 'react'
import { GroupDialog } from './group-dialog'

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { TrashIcon } from '@/icons/trash-icon'
import { VCenterCol } from '@/layout/v-center-col'
import { randomHexColor } from '@/lib/color/color'
import {
  getColIdxFromGroup,
  getColNamesFromGroup,
} from '@/lib/dataframe/dataframe-utils'
import { textToLines } from '@/lib/text/lines'
import { IconButton } from '@/themed/icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '../../../../sortable-item'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import { BaseCol } from '@/components/layout/base-col'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { useResizableSidebarContext } from '@/components/slide-bar/resizable-sidebar'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PlusIcon } from '@/icons/plus-icon'
import { StretchRow } from '@/layout/stretch-row'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { cn } from '@/lib/shadcn-utils'
import { Input } from '@/themed/v2/input'
import { Settings2 } from 'lucide-react'
import {
  useCurrentGroups,
  useCurrentSheets,
} from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'

export const GROUP_CLS = `group rounded-theme group gap-x-1 opacity-80 py-1 px-2
hover:opacity-100 trans-opacity hover:bg-muted/60 data-[focus=true]:bg-muted/60`

export const GROUP_CONTENT_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  group-hover:bg-muted group-data-[focus=true]:bg-muted`

function GroupItem({
  group,
  editGroup,
}: {
  group: IClusterGroup
  editGroup: (group: IClusterGroup, title?: string) => void
}) {
  const { removeGroups, updateGroup } = useHistory()

  const { open: openDialog } = useDialogs()

  const { sheets } = useCurrentSheets()

  const cols = getColNamesFromGroup(sheets[0] as AnnotationDataFrame, group)

  return (
    <SortableItem
      id={group.id}
      key={group.id}
      extChildren={
        <button
          onClick={() =>
            openDialog({
              type: 'warning',
              payload: {
                content: `Are you sure you want to delete the ${group.name} group?`,
                callback: (response) => {
                  if (response === TEXT_OK) {
                    removeGroups([group!.id])
                  }
                },
              },
            })
          }
          className={cn(
            DRAG_HANDLE_APPEAR_CLS,
            'stroke-foreground/50 hover:stroke-destructive focus-visible:stroke-destructive trans-color'
          )}
          // style={{
          //   stroke: group.color,
          // }}
          title={`Delete ${group.name} group`}
          //onMouseEnter={() => setDelHover(true)}
          //onMouseLeave={() => setDelHover(false)}
        >
          <TrashIcon stroke="" className={DRAG_ICON_ANIM_CLS} />
        </button>
      }
    >
      <Switch
        checked={group.show}
        onCheckedChange={(v) => {
          updateGroup({ ...group, show: v })
        }}
      />
      <ColorPickerButton
        colors={[
          {
            color: group.color,
            onColorChange: (color) => updateGroup({ ...group, color }),
          },
        ]}
        // onOpenChanged={open => {
        //   if (!open) {
        //     addGroups(groups.map(g => (g.id === group.id ? { ...g, color } : g)), pathJoin(app))
        //   }
        // }}
        className={SIMPLE_COLOR_EXT_CLS}
        title="Set color"
      />
      <VCenterCol
        className="overflow-hidden grow gap-y-1"
        //style={{ color: group.color, fill: group.color }}
      >
        <VCenterRow className="gap-x-1 h-4">
          <TruncateSpan
            className="grow h-full font-semibold text-xs"
            style={{ color: group.color }}
          >
            {`${group.name} (${cols.length} col${cols.length !== 1 ? 's' : ''})`}
          </TruncateSpan>
        </VCenterRow>

        {cols.length > 0 && (
          <TruncateSpan className="grow h-4 text-xs opacity-75">
            {cols.join(', ')}
          </TruncateSpan>
        )}
      </VCenterCol>
      <BaseCol
        className={cn(DRAG_HANDLE_APPEAR_CLS, 'gap-x-1 items-center shrink-0')}
      >
        <button
          title={`Edit ${group.name} group`}
          //className="text-foreground/50 focus-visible:text-foreground hover:text-foreground trans-color"
          onClick={() => editGroup(group)}
        >
          {/* <SettingsIcon style={{ stroke: group.color }} /> */}
          <Settings2 className={cn('w-4', DRAG_ICON_ANIM_CLS)} />
        </button>
      </BaseCol>
    </SortableItem>
  )
}

export interface IGroupCallback {
  title?: string
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export function GroupPropsPanel() {
  //const [activeId, setActiveId] = useState<string | null>(null)

  const { open: openDialog } = useDialogs()

  const { addGroups, clearGroups, reorderGroups } = useHistory()

  const { groups, groupsName } = useCurrentGroups()

  const { sheets } = useCurrentSheets()

  const { selection } = useSelectionRange()

  const { set } = useResizableSidebarContext()

  useEffect(() => {
    if (groups.length < 1) {
      return
    }
    set('right', {
      id: 'clear',
      render: (
        <LinkButton
          onClick={() =>
            openDialog({
              type: 'warning',
              payload: {
                content: 'Are you sure you want to clear all groups?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    console.log('Clearing groups')
                    clearGroups()
                  }
                },
              },
            })
          }
          title="Clear all groups"
          className="text-xs"
        >
          {TEXT_CLEAR}
        </LinkButton>
      ),
    })
  }, [groups.length, openDialog, clearGroups, set])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [openGroupDialog, setOpenGroupDialog] = useState<
    IGroupCallback | undefined
  >(undefined)

  // cache the group items so that when dragging, they are
  // not re-rendered so that on drag effects work
  // const items = useMemo(() => {
  //   return groupState.groups.map((group, gi) => (
  //     <GroupItem group={group} key={gi} />
  //   ))
  // }, [groupState.groups])

  function openGroupFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const g = JSON.parse(file.text)

      if (Array.isArray(g)) {
        addGroups(g, { mode: 'set' })
      }
    } else {
      // open cls
      const lines = textToLines(file.text)

      if (lines.length < 3) {
        return
      }

      const names = lines[1]?.split(' ').slice(1)

      if (!names) {
        return
      }

      //const indexMap = new Map<string, number[]>()

      // store lowercase for case insensitive searching
      const columnNames = lines[2]?.split(/[ \t]/).map((x) => x.toLowerCase())

      if (!columnNames) {
        return
      }

      // for (const [index, column] of columns.entries()) {
      //   if (!indexMap.has(column)) {
      //     indexMap.set(column, [])
      //   }

      //   indexMap.get(column)!.push(index)
      // }

      const groups: IClusterGroup[] = []

      for (const name of names) {
        //const cols = indexMap.get(name)!

        //const matches = cols.map(col => df.colNames[col]!)

        groups.push(
          makeNewGroup({
            name,
            search: [name.toLowerCase()],
            color: randomHexColor(),
            columnNames,
          })
        )
      }

      addGroups(groups, { mode: 'set' })
    }
  }

  function addGroup() {
    editGroup(makeNewGroup(), 'New group')
  }

  function editGroup(group: IClusterGroup, title: string = 'Edit Group') {
    // if a column is selected, suggest its name as what the user wants to
    // to group

    if (selection && selection.cols) {
      group.search = range(selection.cols.start, selection.cols.end + 1).map(
        (i) => (sheets[0] as AnnotationDataFrame).colName(i)
      )
    }

    setOpenGroupDialog({
      title,
      group,
      callback: (group: IClusterGroup) => {
        //const indices = getColIdxFromGroup(df, group)

        if (groups.some((g) => g.id === group.id)) {
          // we modified and existing group so clone list, but replace existing
          // group with new group when they have the same id
          addGroups(groups.map((g) => (g.id === group.id ? group : g)))
        } else {
          // append new group
          addGroups([...groups, group])
        }

        setOpenGroupDialog(undefined)
      },
    })
  }

  function downloadCls(name: string) {
    if (groups.length < 1) {
      return
    }

    const groupMap = Object.fromEntries(
      groups
        .map((group) => {
          return getColIdxFromGroup(
            sheets[0] as AnnotationDataFrame,
            group
          ).map((col) => [col, group.name])
        })
        .flat()
    )

    // const groupMap = Object.fromEntries(
    //   groups.map(group => {
    //       return getColIdxFromGroup(df, group).map(col => [col, group.name])
    //     })
    //     .flat()
    // )

    const names: string[] = []
    const used: string[] = []

    range((sheets[0] as AnnotationDataFrame).shape[1]).forEach((c: number) => {
      const n = groupMap[c]
      names.push(n)
      if (!used.includes(n)) {
        used.push(n)
      }
    })

    const text: string = [
      `${(sheets[0] as AnnotationDataFrame).shape[1]} ${groups.length} 1`,
      `# ${used.join(' ')}`,
      `${names.join(' ')}`,
    ].join('\n')

    download(text, name)
  }

  return (
    <>
      {openGroupDialog?.callback && (
        <GroupDialog
          title={openGroupDialog?.title}
          group={openGroupDialog?.group}
          onResponse={(response, group) => {
            if (response === TEXT_OK && group) {
              openGroupDialog?.callback?.(group)
            } else {
              setOpenGroupDialog(undefined)
            }
          }}
        />
      )}

      <PropsPanel className="gap-y-1">
        <StretchRow className="gap-x-1">
          <VCenterRow>
            <IconButton
              //rounded="full"
              // ripple={false}
              onClick={() =>
                openFilesDialog({
                  fileTypes: ['json', 'cls'],
                  onFileChange: (message, files) => {
                    onTextFileChange(message, files, (files) => {
                      openGroupFiles(files)
                    })
                  },
                })
              }
              title="Open Groups"
              //className="fill-foreground/50 hover:fill-foreground"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              //rounded="full"
              // ripple={false}
              onClick={() => {
                openDialog({
                  type: 'save',
                  payload: {
                    title: 'Save Groups As',
                    name: 'groups',
                    fileTypes: [
                      { ext: 'json', name: 'JSON' },
                      { ext: 'cls', name: 'CLS' },
                    ],
                    callback: (data) => {
                      switch (data.format.ext) {
                        case 'json':
                          downloadJson(groups, data.name)
                          break
                        case 'cls':
                          downloadCls(data.name)
                          break
                        default:
                          break
                      }
                    },
                  },
                })
              }}
              title="Save Groups"
            >
              <DownloadIcon />
            </IconButton>
          </VCenterRow>
          <ToolbarSeparator />

          <IconButton
            // ripple={false}
            onClick={() => addGroup()}
            title="New Group"
            checked={openGroupDialog !== undefined}
          >
            <PlusIcon />
          </IconButton>
        </StretchRow>

        <Input
          placeholder="Groups..."
          value={groupsName}
          onTextChange={(v) => addGroups(groups, { name: v })}
          className="max-h-8 text-xs"
        />

        <FileDropZonePanel
          className="grow h-full"
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open dropped file', files, openGroupFiles)
            }
          }}
        >
          {/* <VScrollPanel> */}
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            // onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={(event) => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = groups.findIndex(
                  (group) => group.id === (active.id as string)
                )
                const newIndex = groups.findIndex(
                  (group) => group.id === (over.id as string)
                )
                const newOrder = arrayMove(
                  groups.map((group) => group.id),
                  oldIndex,
                  newIndex
                )

                reorderGroups(newOrder)
              }

              //setActiveId(null)
            }}
          >
            <SortableContext
              items={groups.map((group) => group.id)}
              strategy={verticalListSortingStrategy}
            >
              <VScrollPanel className="grow">
                <ul className="flex flex-col">
                  {groups.map((group) => {
                    return (
                      <GroupItem
                        group={group}
                        key={group.id}
                        editGroup={editGroup}
                      />
                    )
                  })}
                </ul>
              </VScrollPanel>
            </SortableContext>

            {/* <DragOverlay>
              {activeId ? (
                <GroupItem
                  group={groups.find(group => group.id === activeId)!.group}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
          </DndContext>
          {/* </VScrollPanel> */}
        </FileDropZonePanel>
      </PropsPanel>
    </>
  )
}
