import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { makeNewGroup, type IClusterGroup } from '@/lib/cluster-group'

import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'

import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { useSelectionRange } from '@/providers/selection-range'

import { download, downloadJson } from '@/lib/download-utils'
import { randId } from '@/lib/id'
import { range } from '@/lib/math/range'
import { useState } from 'react'
import { GroupDialog } from './group-dialog'

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { OpenIcon } from '@/icons/open-icon'
import { SaveIcon } from '@/icons/save-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { VCenterCol } from '@/layout/v-center-col'
import { randomHexColor } from '@/lib/color/color'
import {
  getColIdxFromGroup,
  getColNamesFromGroup,
} from '@/lib/dataframe/dataframe-utils'
import { textToLines } from '@/lib/text/lines'
import { IconButton } from '@/themed/icon-button'
import { LinkButton } from '@/themed/link-button'
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
import {
  useApp,
  useFile,
  useGroups,
  useHistory,
  useSheet,
} from '../history/history-store'
import MODULE_INFO from '../module.json'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { BaseCol } from '@/components/layout/base-col'
import type { ISaveAsResponse } from '@/components/pages/save-as-dialog'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PlusIcon } from '@/icons/plus-icon'
import { StretchRow } from '@/layout/stretch-row'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { cn } from '@/lib/shadcn-utils'
import { Input } from '@/themed/v2/input'
import { Settings2 } from 'lucide-react'
import { SaveGroupsDialog } from './save-groups-dialog'

export const GROUP_CLS = `group rounded-theme group gap-x-1 opacity-80 py-1 px-2
hover:opacity-100 trans-opacity hover:bg-muted/60 data-[focus=true]:bg-muted/60`

export const GROUP_CONTENT_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  group-hover:bg-muted group-data-[focus=true]:bg-muted`

function GroupItem({
  group,
  editGroup,
  setDelGroup,
}: {
  group: IClusterGroup
  editGroup: (group: IClusterGroup, title?: string) => void
  setDelGroup: (group: IClusterGroup) => void
}) {
  const { addGroups } = useHistory()

  const groups = useGroups()

  const sheet = useSheet()

  const cols = getColNamesFromGroup(sheet as AnnotationDataFrame, group)

  return (
    <SortableItem
      id={group.id}
      key={group.id}
      extChildren={
        <button
          onClick={() => setDelGroup(group)}
          className={cn(
            DRAG_HANDLE_APPEAR_CLS,
            'hover:text-red-500 focus-visible:text-red-500 trans-color'
          )}
          // style={{
          //   stroke: group.color,
          // }}
          title={`Delete ${group.name} group`}
          //onMouseEnter={() => setDelHover(true)}
          //onMouseLeave={() => setDelHover(false)}
        >
          <TrashIcon w="w-4" className={DRAG_ICON_ANIM_CLS} />
        </button>
      }
    >
      <Checkbox
        checked={group.show}
        onCheckedChange={v => {
          addGroups(
            groups.map(g => (g.id === group.id ? { ...g, show: v } : g))
          )
        }}
      />
      <ColorPickerButton
        color={group.color}
        onColorChange={v => {
          addGroups(
            groups.map(g => (g.id === group.id ? { ...g, color: v } : g))
          )
        }}
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
        //data-drag={isDragging}

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
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IClusterGroup | null>(null)

  //const [activeId, setActiveId] = useState<string | null>(null)

  const { addGroups, removeGroups, reorderGroups } = useHistory()

  const app = useApp()
  const file = useFile()
  const groups = useGroups()
  const sheet = useSheet()

  const { selection } = useSelectionRange()

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
      const columnNames = lines[2]?.split(/[ \t]/).map(x => x.toLowerCase())

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
    // edit a new group
    editGroup(makeNewGroup(), 'New group')
  }

  function editGroup(group: IClusterGroup, title: string = 'Edit Group') {
    if (!sheet) {
      return
    }

    if (selection.start.col !== -1) {
      // if a column is selected, suggest its name as what the user wants to
      // to group
      group.search = range(selection.start.col, selection.end.col + 1).map(i =>
        (sheet as AnnotationDataFrame).colName(i)
      )
    }

    setOpenGroupDialog({
      title,
      group,
      callback: (group: IClusterGroup) => {
        //const indices = getColIdxFromGroup(df, group)

        if (groups.some(g => g.id === group.id)) {
          // we modified and existing group so clone list, but replace existing
          // group with new group when they have the same id
          addGroups(groups.map(g => (g.id === group.id ? group : g)))
        } else {
          // append new group
          addGroups([...groups, group])
        }

        setOpenGroupDialog(undefined)
      },
    })
  }

  function downloadCls(name: string) {
    if (!sheet || groups.length < 1) {
      return
    }

    const groupMap = Object.fromEntries(
      groups
        .map(group => {
          return getColIdxFromGroup(sheet as AnnotationDataFrame, group).map(
            col => [col, group.name]
          )
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

    range((sheet as AnnotationDataFrame).shape[1]).forEach((c: number) => {
      const n = groupMap[c]
      names.push(n)
      if (!used.includes(n)) {
        used.push(n)
      }
    })

    const text: string = [
      `${(sheet as AnnotationDataFrame).shape[1]} ${groups.length} 1`,
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
          callback={openGroupDialog?.callback}
          onResponse={() => setOpenGroupDialog(undefined)}
        />
      )}

      {confirmClear && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          //contentVariant="glass"
          //bodyVariant="card"
          modalType="Warning"
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              addGroups([], { mode: 'set' })
            }

            setConfirmClear(false)
          }}
        >
          Are you sure you want to clear all groups?
        </OKCancelDialog>
      )}

      {delGroup !== null && (
        <OKCancelDialog
          showClose={true}
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              removeGroups([delGroup!.id])
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setDelGroup(null)
          }}
        >
          {`Are you sure you want to delete the ${
            delGroup !== null ? delGroup.name : 'selected'
          } group?`}
        </OKCancelDialog>
      )}

      {showSaveDialog && (
        <SaveGroupsDialog
          onResponse={(_, data) => {
            const d = data as ISaveAsResponse

            switch (d.format.ext) {
              case 'json':
                downloadJson(groups, d.name)
                break
              case 'cls':
                downloadCls(d.name)
                break
              default:
                break
            }

            setShowSaveDialog(false)
          }}
        />
      )}

      <PropsPanel className="gap-y-1">
        <h2 className="font-semibold text-base opacity-80 mb-2">Groups</h2>
        <VCenterRow className="justify-between">
          <StretchRow>
            <VCenterRow>
              <IconButton
                //rounded="full"
                // ripple={false}
                onClick={() => setOpen(randId('open'))}
                title="Open Groups"
                //className="fill-foreground/50 hover:fill-foreground"
              >
                <OpenIcon />
              </IconButton>

              <IconButton
                //rounded="full"
                // ripple={false}
                onClick={() => setShowSaveDialog(true)}
                title="Save Groups"
              >
                <SaveIcon />
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
          {groups.length > 0 && (
            // <Button
            //   variant="accent"
            //   multiProps="icon"
            //   // ripple={false}
            //   onClick={() => setConfirmClear(true)}
            //   title="Clear all groups"
            // >
            //   <TrashIcon />
            // </Button>

            <LinkButton
              onClick={() => setConfirmClear(true)}
              title="Clear all groups"
            >
              {TEXT_CLEAR}
            </LinkButton>
          )}
        </VCenterRow>

        <Input
          placeholder="Groups..."
          value={file?.groupsName ?? ''}
          onTextChange={v => addGroups(groups, { name: v })}
          className="max-h-8 text-xs"
        />

        <FileDropZonePanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openGroupFiles)
            }
          }}
        >
          {/* <VScrollPanel> */}
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            // onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={event => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = groups.findIndex(
                  group => group.id === (active.id as string)
                )
                const newIndex = groups.findIndex(
                  group => group.id === (over.id as string)
                )
                const newOrder = arrayMove(
                  groups.map(group => group.id),
                  oldIndex,
                  newIndex
                )

                reorderGroups(newOrder)
              }

              //setActiveId(null)
            }}
          >
            <SortableContext
              items={groups.map(group => group.id)}
              strategy={verticalListSortingStrategy}
            >
              <VScrollPanel className="grow">
                <ul className="flex flex-col">
                  {groups.map(group => {
                    return (
                      <GroupItem
                        group={group}
                        key={group.id}
                        editGroup={editGroup}
                        setDelGroup={setDelGroup}
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

      {open.includes('open') && (
        <OpenFiles
          message={open}
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openGroupFiles(files)
            })
          }
          fileTypes={['json', 'cls']}
        />
      )}
    </>
  )
}
