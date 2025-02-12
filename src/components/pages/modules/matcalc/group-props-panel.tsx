import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { makeNewGroup, type IClusterGroup } from '@lib/cluster-group'
import { Plus, Save } from 'lucide-react'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { SelectionRangeContext } from '@components/table/use-selection-range'

import { download, downloadJson } from '@lib/download-utils'
import { range } from '@lib/math/range'
import { makeRandId, nanoid } from '@lib/utils'
import { useContext, useState, type RefObject } from 'react'
import { GroupDialog } from './group-dialog'
import { GroupsContext } from './groups-provider'

import { FileDropPanel } from '@/components/file-drop-panel'

import { OpenIcon } from '@/components/icons/open-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import {
  getColIdxFromGroup,
  getColNamesFromGroup,
} from '@/lib/dataframe/dataframe-utils'
import { randomHexColor } from '@lib/color'
import { textToLines } from '@lib/text/lines'
import { currentSheet, HistoryContext } from '@providers/history-provider'
import { Reorder } from 'motion/react'
import MODULE_INFO from './module.json'

const GROUP_CLS =
  'trans-color group grow relative h-16 w-full overflow-hidden pl-2 pr-3 gap-x-3 rounded-theme'

export interface IGroupCallback {
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export interface IProps {
  //df: BaseDataFrame | null
  downloadRef: RefObject<HTMLAnchorElement | null>
  onCancel?: () => void
}

export function GroupPropsPanel({ downloadRef }: IProps) {
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IClusterGroup | null>(null)
  const { groupState, groupsDispatch } = useContext(GroupsContext)

  const { history } = useContext(HistoryContext)

  const [selection] = useContext(SelectionRangeContext)

  const df = currentSheet(history)[0]!

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
        groupsDispatch({ type: 'set', groups: g })
      }
    } else {
      // open cls
      const lines = textToLines(file.text)

      if (lines.length < 3) {
        return
      }

      //const df = currentSheet(history)[0]!

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

        groups.push({
          id: nanoid(),
          name,
          search: [name.toLowerCase()],
          color: randomHexColor(),
          columnNames,
        })
      }

      groupsDispatch({ type: 'set', groups })
    }
  }

  function GroupItem({ group }: { group: IClusterGroup }) {
    const cols = getColNamesFromGroup(df, group)
    const [drag, setDrag] = useState(false)
    const [hover, setHover] = useState(false)

    useMouseUpListener(() => setDrag(false))

    return (
      <VCenterRow
        key={group.name}
        data-drag={drag}
        className={GROUP_CLS}
        style={{
          backgroundColor: hover || drag ? `${group.color}20` : undefined,
        }}
        onMouseDown={() => setDrag(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VCenterRow className="cursor-ns-resize">
          <VerticalGripIcon
            style={{
              stroke: group.color,
            }}
          />
        </VCenterRow>

        <VCenterCol
          className="overflow-hidden grow"
          style={{ color: group.color, fill: group.color }}
        >
          <span className="font-semibold truncate">{group.name}</span>
          <span className="font-medium truncate">{`${cols.length} column${cols.length !== 1 ? 's' : ''}`}</span>

          {cols.length > 0 && (
            <span className="truncate">{cols.join(', ')}</span>
          )}
        </VCenterCol>

        <VCenterCol
          data-drag={drag}
          className="gap-y-1.5 items-center opacity-0 group-hover:opacity-100 data-[drag=true]:opacity-100 trans-opacity shrink-0"
        >
          <button
            title={`Edit ${group.name} group`}
            className="opacity-50 hover:opacity-100 trans-opacity"
            onClick={() => editGroup(group)}
          >
            <SettingsIcon style={{ stroke: group.color }} />
          </button>

          <button
            onClick={() => setDelGroup(group)}
            className="opacity-50 hover:opacity-100 trans-opacity"
            style={{
              stroke: group.color,
            }}
            title={`Delete ${group.name} group`}
            //onMouseEnter={() => setDelHover(true)}
            //onMouseLeave={() => setDelHover(false)}
          >
            <TrashIcon style={{ stroke: group.color }} />
          </button>
        </VCenterCol>

        {/* {!drag && (
          <span className="absolute bottom-0 h-px bg-border left-2 right-2" />
        )} */}
      </VCenterRow>
    )
  }

  //const [groups, setGroups] = useState<IGroup[]>([])

  // useEffect(() => {
  //   setGroups([])
  // }, [df])

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file: File = files[0]!

  //   //setFile(files[0])
  //   //setShowLoadingDialog(true)

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       // since this seems to block rendering, delay by a second so that the
  //       // animation has time to start to indicate something is happening and
  //       // then finish processing the file
  //       const text: string =
  //         typeof result === 'string' ? result : Buffer.from(result).toString()

  //       const g = JSON.parse(text)

  //       if (Array.isArray(g)) {
  //         groupsDispatch({ type: 'set', groups: g })
  //       }
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function addGroup() {
    // edit a new group
    editGroup(makeNewGroup())
  }

  function editGroup(group: IClusterGroup) {
    if (!df) {
      return
    }

    if (selection.start.col !== -1) {
      // if a column is selected, suggest its name as what the user wants to
      // to group
      group.search = range(selection.start.col, selection.end.col + 1).map(
        (i) => df.colName(i)
      )
    }

    setOpenGroupDialog({
      group,
      callback: (group: IClusterGroup) => {
        //const indices = getColIdxFromGroup(df, group)

        if (groupState.groups.has(group.id)) {
          // we modified and existing group so clone list, but replace existing
          // group with new group when they have the same id
          groupsDispatch({
            type: 'update',
            group,
          })
        } else {
          // append new group
          groupsDispatch({ type: 'add', groups: [group] })
        }

        setOpenGroupDialog(undefined)
      },
    })
  }

  // function editGroup(group: IClusterGroup) {
  //   if (!df) {
  //     return
  //   }

  //   setOpenGroupDialog({
  //     group,
  //     callback: (g:IClusterGroup) => {
  //       // const lcSearch = search.map(s => s.toLowerCase())
  //       // const indices: number[] = df.columns.values
  //       //   .map(
  //       //     (col, ci) => [ci, col.toString().toLowerCase()] as [number, string]
  //       //   )
  //       //   .filter((c: [number, string]) => {
  //       //     for (const x of lcSearch) {
  //       //       if (c[1].includes(x)) {
  //       //         return true
  //       //       }
  //       //     }

  //       //     return false
  //       //   })
  //       //   .map((c: [number, string]) => c[0])

  //       const indices = getColIdxFromGroup(df, g)

  //       // only update group if search changes actually
  //       // result in items being found, otherwise just
  //       // keep the old group
  //       if (indices.length > 0) {
  //         g.indices = indices

  //         const newGroups = groupState.groups.map(g =>
  //           g.id === group.id ? { ...g, name, search, color, indices } : g
  //         )
  //         //setGroups(g)
  //         //onGroupsChange?.(newGroups)
  //         groupsDispatch({ type: 'set', groups: newGroups })
  //       }

  //       setOpenGroupDialog(undefined)
  //     },
  //   })
  // }

  function downloadCls() {
    if (!df || groupState.groups.size < 1) {
      return
    }

    const groupMap = Object.fromEntries(
      groupState.order
        .map((id) => groupState.groups.get(id)!)
        .map((group) => {
          return getColIdxFromGroup(df, group).map((col) => [col, group.name])
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

    range(df.shape[1]).forEach((c: number) => {
      const n = groupMap[c]
      names.push(n)
      if (!used.includes(n)) {
        used.push(n)
      }
    })

    const text: string = [
      `${df.shape[1]} ${groupState.groups.size} 1`,
      `# ${used.join(' ')}`,
      `${names.join(' ')}`,
    ].join('\n')

    download(text, downloadRef, 'groups.cls')
  }

  return (
    <>
      {openGroupDialog?.callback && (
        <GroupDialog
          group={openGroupDialog?.group}
          callback={openGroupDialog?.callback}
          onReponse={() => setOpenGroupDialog(undefined)}
        />
      )}

      {confirmClear && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              groupsDispatch({ type: 'clear' })
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
          onReponse={(r) => {
            if (r === TEXT_OK) {
              groupsDispatch({ type: 'remove', ids: [delGroup!.id] })
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
        <OKCancelDialog
          title="Save Groups"
          open={showSaveDialog}
          showClose={true}
          buttons={[]}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              //groupsDispatch({ type: "remove", id: delGroup!.id })
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setShowSaveDialog(false)
          }}
        >
          <Button
            variant="theme"
            size="lg"
            onClick={() => {
              downloadJson(
                groupState.order.map((id) => groupState.groups.get(id)!),
                downloadRef,
                'groups.json'
              )

              setShowSaveDialog(false)
            }}
            aria-label="Save groups"
          >
            Group (.json)
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              downloadCls()
              setShowSaveDialog(false)
            }}
            aria-label="Save groups as GSEA cls"
          >
            GSEA (.cls)
          </Button>
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="justify-between">
          <VCenterRow className="gap-x-1">
            <ToolbarTabGroup>
              <Button
                variant="accent"
                multiProps="icon"
                //rounded="full"
                ripple={false}
                onClick={() => setOpen(makeRandId('open'))}
                title="Open groups"
                //className="fill-foreground/50 hover:fill-foreground"
              >
                <OpenIcon />
              </Button>

              <Button
                variant="accent"
                multiProps="icon"
                //rounded="full"
                ripple={false}
                onClick={() => setShowSaveDialog(true)}
                title="Save groups"
              >
                <Save className="rotate-180 w-5 h-5" strokeWidth={1.5} />
              </Button>
            </ToolbarTabGroup>
            <ToolbarSeparator />

            <Button
              variant="accent"
              multiProps="icon"
              ripple={false}
              onClick={() => addGroup()}
              title="New Group"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </VCenterRow>
          {groupState.groups.size > 0 && (
            // <Button
            //   variant="accent"
            //   multiProps="icon"
            //   ripple={false}
            //   onClick={() => setConfirmClear(true)}
            //   title="Clear all groups"
            // >
            //   <TrashIcon />
            // </Button>

            <Button
              multiProps="link"
              //rounded="full"
              //ripple={false}
              onClick={() => setConfirmClear(true)}
              title="Clear all groups"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <FileDropPanel
          onFileDrop={(files) => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openGroupFiles)
            }
          }}
          className="mb-2"
        >
          <VScrollPanel>
            <Reorder.Group
              values={groupState.order}
              onReorder={(order) => {
                //setOrder(order)
                groupsDispatch({
                  type: 'order',
                  order: order,
                })
              }}
              className=" gap-y-1 flex flex-col"
            >
              {groupState.order.map((id) => {
                const group = groupState.groups.get(id)!

                return (
                  <Reorder.Item key={id} value={id}>
                    <GroupItem group={group} />
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          </VScrollPanel>
        </FileDropPanel>

        {/* <ScrollAccordion
          type="multiple"
          value={groupValues}
          onValueChange={setGroupValues}
        >
          {groups.map((group, gi) => {
            const cols = getColNamesFromGroup(df, group)

            return (
              <AccordionItem value={group.name} key={group.name}>
                <AccordionTrigger
                  style={{
                    color: group.color,
                  }}
                  arrowStyle={{
                    stroke: group.color,
                  }}
                  rightChildren={
                    <VCenterRow className="gap-x-1">
                      <button
                        title={`Edit ${group.name} group`}
                        className="opacity-50 hover:opacity-90 trans-opacity"
                        style={{
                          fill: group.color,
                        }}
                        onClick={() => editGroup(group)}
                      >
                        <PenIcon fill="" />
                      </button>

                      <button
                        onClick={() => setDelGroup(group)}
                        className="opacity-50 hover:opacity-90 trans-opacity"
                        style={{
                          fill: group.color,
                        }}
                        title={`Delete ${group.name} group`}
                        //onMouseEnter={() => setDelHover(true)}
                        //onMouseLeave={() => setDelHover(false)}
                      >
                        <TrashIcon fill="" />
                      </button>
                    </VCenterRow>
                  }
                >
                  {`${group.name}: ${cols.length} column${cols.length !== 1 ? "s" : ""}`}
                </AccordionTrigger>
                <AccordionContent
                  innerClassName="flex flex-row gap-x-2"
                  innerStyle={{
                    color: group.color,
                  }}
                >
                  {cols.length > 0 && (
                    <p>
                      {`${cols.slice(0, MAX_LABELS).join(", ")}${cols.length > MAX_LABELS ? "..." : ""}`}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </ScrollAccordion> */}
      </PropsPanel>
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
