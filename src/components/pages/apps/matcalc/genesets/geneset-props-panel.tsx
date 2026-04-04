import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'

import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { TrashIcon } from '@/icons/trash-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { downloadJson } from '@/lib/download-utils'
import { randId } from '@/lib/id'
import { useEffect, useState } from 'react'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { OpenIcon } from '@/icons/open-icon'
import { VCenterCol } from '@/layout/v-center-col'
import { makeNewGeneset, type IGeneset } from '@/lib/gsea/geneset'
import { range } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import { IconButton } from '@/themed/icon-button'
import { LinkButton } from '@/themed/link-button'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { GenesetDialog } from './geneset-dialog'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { BaseCol } from '@/components/layout/base-col'
import { PropsPanel } from '@/components/props-panel'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { StretchRow } from '@/layout/stretch-row'
import { cn } from '@/lib/shadcn-utils'
import { Settings2 } from 'lucide-react'
import { useHistory } from '../history/history-store'
import MODULE_INFO from '../module.json'

function GenesetItem({
  geneset,
  editGeneset,
  setDelGroup,
}: {
  geneset: IGeneset
  active?: string | null
  editGeneset: (geneset: IGeneset) => void
  setDelGroup: (geneset: IGeneset) => void
}) {
  const { updateGeneset } = useHistory()

  const [color, setColor] = useState(geneset.color)

  useEffect(() => {
    setColor(geneset.color)
  }, [geneset.color])

  return (
    <SortableItem
      id={geneset.id}
      extChildren={
        <button
          onClick={() => setDelGroup(geneset)}
          className={cn(
            DRAG_HANDLE_APPEAR_CLS,
            'hover:text-red-500 focus-visible:text-red-500 trans-color'
          )}
          title={`Delete ${geneset.name} gene set`}
          //onMouseEnter={() => setDelHover(true)}
          //onMouseLeave={() => setDelHover(false)}
        >
          <TrashIcon w="w-4" className={DRAG_ICON_ANIM_CLS} />
        </button>
      }
    >
      <ColorPickerButton
        color={color}
        onColorChange={setColor}
        onOpenChanged={open => {
          if (!open) {
            updateGeneset({ ...geneset, color })
          }
        }}
        className={SIMPLE_COLOR_EXT_CLS}
        title="Set gene set color"
      />
      <VCenterCol
        className="grow gap-y-1 z-10 overflow-hidden"
        // style={{
        //   fill: geneset.color,
        //   color: geneset.color,
        // }}
      >
        <VCenterRow className="gap-x-1 h-4">
          <TruncateSpan className="font-semibold grow h-full text-xs">
            {geneset.name}
          </TruncateSpan>
        </VCenterRow>

        <TruncateSpan className="grow h-4 text-xs opacity-75">
          {geneset.genes.length} genes
        </TruncateSpan>
      </VCenterCol>

      <BaseCol
        className={cn(DRAG_HANDLE_APPEAR_CLS, 'gap-x-1 items-center shrink-0')}
      >
        <button
          title={`Edit ${geneset.name} group`}
          onClick={() => editGeneset(geneset)}
        >
          <Settings2 className={cn('w-4', DRAG_ICON_ANIM_CLS)} />
        </button>
      </BaseCol>
    </SortableItem>
  )
}

export interface IGenesetCallback {
  title?: string | undefined
  geneset: IGeneset
  callback?: (geneset: IGeneset) => void
}

export function GenesetPropsPanel() {
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  //const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IGeneset | null>(null)

  //const [activeId, setActiveId] = useState<string | null>(null)

  const { updateGeneset } = useHistory()
  const { genesets, addGenesets, removeGenesets, reorderGenesets } =
    useHistory()

  const [openGenesetDialog, setOpenGroupDialog] = useState<
    IGenesetCallback | undefined
  >(undefined)

  // cache the group items so that when dragging, they are
  // not re-rendered so that on drag effects work
  // const items = useMemo(() => {
  //   return genesetState.genesets.map((geneset, gi) => (
  //     <GroupItem geneset={geneset} key={gi} />
  //   ))
  // }, [genesetState.genesets])

  function openGenesetFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const g = JSON.parse(file.text)

      if (Array.isArray(g)) {
        addGenesets(g, 'set') //({ type: 'set', genesets: g })
      }
    } else {
      // open txt
      const lines = textToLines(file.text)

      const df = new DataFrameReader()
        .keepDefaultNA(false)
        .skipRows(file.ext === 'gmx' ? 1 : 0)
        .read(lines)

      const genesets: IGeneset[] = []

      for (const i of range(df.shape[1])) {
        const name = df.columns[i]
        const gs = makeNewGeneset(name)

        gs.genes = df.col(i).strs.filter(x => x.length > 0)

        genesets.push(gs)
      }

      addGenesets(genesets, 'set')
    }
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
  //         genesetDispatch({ type: 'set', groups: g })
  //       }
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function addGeneset() {
    // edit a new group
    editGeneset(makeNewGeneset(), 'New gene set')
  }

  function editGeneset(geneset: IGeneset, title: string = 'Edit Gene Set') {
    setOpenGroupDialog({
      title,
      geneset,
      callback: (geneset: IGeneset) => {
        //const indices = getColIdxFromGroup(df, group)

        if (genesets.some(g => g.id === geneset.id)) {
          // we modified and existing group so clone list, but replace existing
          // group with new group when they have the same id
          updateGeneset(geneset)
        } else {
          // append new group
          addGenesets([geneset])
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

  //         const newGroups = genesetState.groups.map(g =>
  //           g.id === group.id ? { ...g, name, search, color, indices } : g
  //         )
  //         //setGroups(g)
  //         //onGroupsChange?.(newGroups)
  //         genesetDispatch({ type: 'set', groups: newGroups })
  //       }

  //       setOpenGroupDialog(undefined)
  //     },
  //   })
  // }

  return (
    <>
      {open.includes('open') && (
        <OpenFiles
          message={open}
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openGenesetFiles(files)
            })
          }
          fileTypes={['json', 'tsv', 'txt']}
        />
      )}

      {openGenesetDialog?.callback && (
        <GenesetDialog
          title={openGenesetDialog.title}
          geneset={openGenesetDialog?.geneset}
          callback={openGenesetDialog?.callback}
          onResponse={() => setOpenGroupDialog(undefined)}
        />
      )}

      {confirmClear && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              addGenesets([], 'set')
            }

            setConfirmClear(false)
          }}
        >
          Are you sure you want to clear all gene sets?
        </OKCancelDialog>
      )}

      {delGroup !== null && (
        <OKCancelDialog
          showClose={true}
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              removeGenesets([delGroup!.id])
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

      {/* {showSaveDialog && (
        <OKCancelDialog
          title="Save Gene Sets"
          open={showSaveDialog}
          showClose={true}
          buttons={[]}
          onResponse={r => {
            if (r === TEXT_OK) {
              downloadJson(genesetState.genesets, 'genesets.json')
            }
            setShowSaveDialog(false)
          }}
        >
         
        </OKCancelDialog>
      )} */}

      <PropsPanel className="gap-y-1">
        <h2 className="font-semibold text-base opacity-80 mb-2">Gene Sets</h2>
        <VCenterRow className="justify-between">
          <StretchRow className="gap-x-1">
            <VCenterRow>
              <IconButton
                //rounded="full"
                // ripple={false}
                onClick={() => setOpen(randId('open'))}
                title="Open Gene Sets"
                //className="fill-foreground/50 hover:fill-foreground"
              >
                <OpenIcon />
              </IconButton>

              <IconButton
                //rounded="full"
                // ripple={false}
                onClick={() => {
                  //setShowSaveDialog(true)
                  downloadJson(genesets, 'genesets.json')
                }}
                title="Save Gene Sets"
              >
                <SaveIcon />
              </IconButton>
            </VCenterRow>
            <ToolbarSeparator />

            <IconButton
              // ripple={false}
              onClick={() => addGeneset()}
              title="New Gene Set"
              checked={openGenesetDialog !== undefined}
            >
              <PlusIcon />
            </IconButton>
          </StretchRow>
          {genesets.length > 0 && (
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
              title="Clear all gene sets"
            >
              {TEXT_CLEAR}
            </LinkButton>
          )}
        </VCenterRow>

        <FileDropZonePanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openGenesetFiles)
            }
          }}
        >
          {/* <VScrollPanel> */}
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={event => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = genesets.findIndex(
                  g => g.id === (active.id as string)
                )

                const newIndex = genesets.findIndex(
                  g => g.id === (over.id as string)
                )
                const newOrder = arrayMove(
                  genesets.map(g => g.id),
                  oldIndex,
                  newIndex
                )

                reorderGenesets(newOrder)
              }

              //setActiveId(null)
            }}
          >
            <SortableContext
              items={genesets.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <VScrollPanel className="grow h-full">
                <ul className="flex flex-col">
                  {genesets.map(geneset => {
                    //const cols = getColNamesFromGroup(df, group)

                    return (
                      // <BaseSortableItem key={id} id={id}>
                      <GenesetItem
                        geneset={geneset}
                        key={geneset.id}
                        editGeneset={editGeneset}
                        setDelGroup={setDelGroup}
                      />
                      // </BaseSortableItem>
                    )
                  })}
                </ul>
              </VScrollPanel>
            </SortableContext>

            {/* <DragOverlay>
              {activeId ? (
                <GenesetItem
                  geneset={genesets.find(g => g.id === activeId)!.geneset}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
          </DndContext>
        </FileDropZonePanel>
      </PropsPanel>
      {/* <ScrollAccordion
          multiple={true}
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
                <AccordionContent variant="sidebar"
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
    </>
  )
}
