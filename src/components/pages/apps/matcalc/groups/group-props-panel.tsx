import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { makeNewGroup, type IClusterGroup } from '@lib/cluster-group'

import { OKCancelDialog } from '@dialog/ok-cancel-dialog'

import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'
import { useSelectionRange } from '@providers/selection-range'

import { download, downloadJson } from '@lib/download-utils'
import { randId } from '@lib/id'
import { range } from '@lib/math/range'
import { useContext, useEffect, useState } from 'react'
import { GroupDialog } from './group-dialog'

import { FileDropZonePanel } from '@components/file-dropzone-panel'
import {
  DndContext,
  DragOverlay,
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
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import { SettingsIcon } from '@icons/settings-icon'
import { TrashIcon } from '@icons/trash-icon'
import { VCenterCol } from '@layout/v-center-col'
import { randomHexColor } from '@lib/color/color'
import {
  getColIdxFromGroup,
  getColNamesFromGroup,
} from '@lib/dataframe/dataframe-utils'
import { textToLines } from '@lib/text/lines'
import { IconButton } from '@themed/icon-button'
import { LinkButton } from '@themed/link-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'
import {
  DragHandle,
  SortableItem,
  SortableItemContext,
} from '../../../../sortable-item'
import { useBranch, useHistory } from '../history/history-store'
import MODULE_INFO from '../module.json'

import { ColorPickerButton } from '@components/color/color-picker-button'
import { PlusIcon } from '@icons/plus-icon'
import { StretchRow } from '@layout/stretch-row'
import { SaveGroupsDialog } from './save-groups-dialog'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md`

export interface IGroupCallback {
  title?: string
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export interface IProps {
  branchId: string
  onCancel?: () => void
}

export function GroupPropsPanel({ branchId }: IProps) {
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IClusterGroup | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)

  const { updateGroup } = useHistory()
  const { sheet, groups, addGroups, removeGroups, reorderGroups } =
    useBranch(branchId)

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
        addGroups(g, 'set')
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

      addGroups(groups, 'set')
    }
  }

  function GroupItem({
    group,
    active = null,
  }: {
    group: IClusterGroup
    active?: string | null
  }) {
    const { isDragging } = useContext(SortableItemContext)
    //const [isDragging, setIsDragging] = useState(false)

    const cols = getColNamesFromGroup(sheet!, group)

    const [hover, setHover] = useState(false)

    const hoverMode = hover || isDragging || group.id === active

    const [color, setColor] = useState(group.color)

    useEffect(() => {
      setColor(group.color)
    }, [group.color])

    // const ref = useRef<HTMLDivElement>(null

    // function handleMouseDown() {
    //   function onMouseUp() {
    //     setIsDragging(false)

    //     document.removeEventListener('mouseup', onMouseUp)
    //   }

    //   console.log('Sdfsdfsdfsdf')
    //   setIsDragging(true)

    //   document.addEventListener('mouseup', onMouseUp)
    // }

    //useMouseDownListener(handleMouseDown)

    return (
      <VCenterRow
        className={GROUP_BG_CLS}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VCenterRow
          //ref={ref}
          key={group.id}
          data-drag={group.id === active}
          data-hover={hoverMode}
          className={GROUP_CLS}
          // style={{
          //   backgroundColor: hoverMode ? `${group.color}20` : undefined,
          // }}
          //onMouseDown={handleMouseDown}
        >
          <DragHandle
          // style={{
          //   stroke: group.color,
          // }}
          />

          {/* <ColorDotButton color={group.color}
            title={`Edit ${group.name} group`}
            onClick={() => editGroup(group)}
          
          /> */}

          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            onOpenChanged={(open) => {
              if (!open) {
                updateGroup({ ...group, color })
              }
            }}
            className="w-3.5 h-3.5 rounded-full aspect-auto shrink-0"
            title="Set color"
          />

          <VCenterCol
            className="overflow-hidden grow gap-y-1"
            //style={{ color: group.color, fill: group.color }}
          >
            <p className="truncate font-semibold">
              {`${group.name} (${cols.length} col${cols.length !== 1 ? 's' : ''})`}
            </p>

            {cols.length > 0 && (
              <span className="truncate">{cols.join(', ')}</span>
            )}
          </VCenterCol>

          <VCenterRow
            //data-drag={isDragging}
            data-hover={hoverMode}
            className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
          >
            <button
              title={`Edit ${group.name} group`}
              className="opacity-50 hover:opacity-100"
              onClick={() => editGroup(group)}
            >
              {/* <SettingsIcon style={{ stroke: group.color }} /> */}
              <SettingsIcon />
            </button>

            {/* <button
              onClick={() => setDelGroup(group)}
              className="opacity-50 hover:opacity-100"
              style={{
                stroke: group.color,
              }}
              title={`Delete ${group.name} group`}
              //onMouseEnter={() => setDelHover(true)}
              //onMouseLeave={() => setDelHover(false)}
            >
              <TrashIcon style={{ stroke: group.color }} />
            </button> */}
          </VCenterRow>
        </VCenterRow>

        <VCenterRow
          //data-drag={isDragging}
          data-hover={hoverMode}
          className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
        >
          <button
            onClick={() => setDelGroup(group)}
            className="stroke-foreground/50 hover:stroke-red-500 trans-color"
            // style={{
            //   stroke: group.color,
            // }}
            title={`Delete ${group.name} group`}
            //onMouseEnter={() => setDelHover(true)}
            //onMouseLeave={() => setDelHover(false)}
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      </VCenterRow>
    )
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
      group.search = range(selection.start.col, selection.end.col + 1).map(
        (i) => sheet.colName(i)
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
          updateGroup(group)
        } else {
          // append new group
          addGroups([group])
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
        .map((group) => {
          return getColIdxFromGroup(sheet, group).map((col) => [
            col,
            group.name,
          ])
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

    range(sheet.shape[1]).forEach((c: number) => {
      const n = groupMap[c]
      names.push(n)
      if (!used.includes(n)) {
        used.push(n)
      }
    })

    const text: string = [
      `${sheet.shape[1]} ${groups.length} 1`,
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
          onResponse={(r) => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              addGroups([], 'set')
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
          onResponse={(r) => {
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
          onResponse={(response, data) => {
            switch (response) {
              case 'json':
                downloadJson(groups, data!.name as string)
                break
              case 'cls':
                downloadCls(data!.name as string)
                break
              default:
                break
            }

            setShowSaveDialog(false)
          }}
        />

        // <OKCancelDialog
        //   title="Save Groups As"
        //   open={showSaveDialog}
        //   showClose={true}
        //   buttons={[]}
        //   contentVariant="glass"
        //   bodyVariant="card"
        //   bodyCls="gap-y-2"
        //   onResponse={r => {

        //     setShowSaveDialog(false)
        //   }}
        // >
        //   <Button
        //     variant="theme"
        //     size="lg"
        //     onClick={() => {
        //       downloadJson(
        //         groupState.order.map(id => groupState.groups.get(id)!),
        //         'groups.json'
        //       )

        //       setShowSaveDialog(false)
        //     }}
        //     aria-label="Save groups"
        //   >
        //     Group (.json)
        //   </Button>

        //   <Button
        //     variant="secondary"
        //     size="lg"
        //     onClick={() => {
        //       downloadCls()
        //       setShowSaveDialog(false)
        //     }}
        //     aria-label="Save groups as GSEA cls"
        //   >
        //     GSEA (.cls)
        //   </Button>
        // </OKCancelDialog>
      )}

      <VCenterRow className="justify-between">
        <StretchRow className="gap-x-1">
          <ToolbarTabGroup>
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
          </ToolbarTabGroup>
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
            //rounded="full"
            //// ripple={false}
            onClick={() => setConfirmClear(true)}
            title="Clear all groups"
          >
            {TEXT_CLEAR}
          </LinkButton>
        )}
      </VCenterRow>

      <FileDropZonePanel
        onFileDrop={(files) => {
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
          onDragStart={(event) => setActiveId(event.active.id as string)}
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

            setActiveId(null)
          }}
        >
          <SortableContext
            items={groups.map((group) => group.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col">
              {groups.map((group) => {
                const id = group.id
                return (
                  <SortableItem key={id} id={id}>
                    <GroupItem group={group} key={id} />
                  </SortableItem>
                )
              })}
            </ul>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <GroupItem
                group={groups.find((group) => group.id === activeId)!}
                active={activeId}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        {/* </VScrollPanel> */}
      </FileDropZonePanel>

      {open.includes('open') && (
        <OpenFiles
          open={open}
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              openGroupFiles(files)
            })
          }
          fileTypes={['json', 'cls']}
        />
      )}
    </>
  )
}
