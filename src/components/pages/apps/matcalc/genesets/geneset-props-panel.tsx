import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { TrashIcon } from '@/icons/trash-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { downloadJson } from '@/lib/download-utils'
import { useEffect, useState } from 'react'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { VCenterCol } from '@/layout/v-center-col'
import { makeNewGeneset, type IGeneSet } from '@/lib/gsea/geneset'
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

import { useDialogs } from '@/components/dialogs/dialogs'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import { BaseCol } from '@/components/layout/base-col'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import { ResizableSidebarHeaderPortal } from '@/components/slide-bar/resizable-sidebar'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PlusIcon } from '@/icons/plus-icon'
import { StretchRow } from '@/layout/stretch-row'
import { randomHexColor } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import type { UndefStr } from '@/lib/text/text'
import { Settings2 } from 'lucide-react'
import { useCurrentGenesets } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'

function GenesetItem({
  geneset,
  editGeneset,
}: {
  geneset: IGeneSet
  active?: string | null
  editGeneset: (geneset: IGeneSet) => void
}) {
  const { removeGenesets, updateGeneset } = useHistory()
  const { open: openDialog } = useDialogs()
  const [color, setColor] = useState(geneset.color ?? randomHexColor())

  useEffect(() => {
    if (geneset.color) {
      setColor(geneset.color)
    }
  }, [geneset.color])

  return (
    <SortableItem
      id={geneset.id}
      extChildren={
        <button
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Delete Gene Set',
                content: `Are you sure you want to delete the ${geneset.name} gene set?`,
                callback: (response) => {
                  if (response === TEXT_OK) {
                    removeGenesets([geneset.id])
                  }
                },
              },
            })
          }}
          className={cn(
            DRAG_HANDLE_APPEAR_CLS,
            'hover:text-destructive focus-visible:text-destructive trans-color'
          )}
          title={`Delete ${geneset.name} gene set`}
          //onMouseEnter={() => setDelHover(true)}
          //onMouseLeave={() => setDelHover(false)}
        >
          <TrashIcon className={DRAG_ICON_ANIM_CLS} />
        </button>
      }
    >
      <ColorPickerButton
        colors={[
          {
            color,
            onColorChange: (color) => setColor(color),
          },
        ]}
        onOpenChanged={(open) => {
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
  title?: UndefStr
  geneset: IGeneSet
  callback?: (geneset: IGeneSet) => void
}

export function GenesetPropsPanel() {
  //const [activeId, setActiveId] = useState<string | null>(null)

  const { addGenesets, updateGeneset, reorderGenesets } = useHistory()

  const { genesets } = useCurrentGenesets()

  const { open: openDialog } = useDialogs()

  const [openGenesetDialog, setOpenGroupDialog] = useState<
    IGenesetCallback | undefined
  >(undefined)

  function openGenesetFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const g = JSON.parse(file.text)

      if (Array.isArray(g)) {
        addGenesets(g, { mode: 'set' }) //({ type: 'set', genesets: g })
      }
    } else {
      // open txt
      const lines = textToLines(file.text)

      const df = new DataFrameReader()
        .keepDefaultNA(false)
        .skipRows(file.ext === 'gmx' ? 1 : 0)
        .read(lines)

      const genesets: IGeneSet[] = []

      const startIndex = file.ext === 'gmt' ? 1 : 0

      for (const i of range(startIndex, df.shape[1])) {
        const name = df.columns[i]
        const gs = makeNewGeneset(name)

        gs.genes = df.col(i).strs.filter((x) => x.length > 0)

        genesets.push(gs)
      }

      addGenesets(genesets, { mode: 'set' })
    }
  }

  function addGeneset() {
    // edit a new group
    editGeneset(makeNewGeneset(), 'New gene set')
  }

  function editGeneset(geneset: IGeneSet, title: string = 'Edit Gene Set') {
    setOpenGroupDialog({
      title,
      geneset,
      callback: (geneset: IGeneSet) => {
        //const indices = getColIdxFromGroup(df, group)

        if (genesets.some((g) => g.id === geneset.id)) {
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

  return (
    <>
      {openGenesetDialog?.callback && (
        <GenesetDialog
          title={openGenesetDialog.title}
          geneset={openGenesetDialog?.geneset}
          onResponse={(response, geneset) => {
            if (response === TEXT_OK && geneset) {
              openGenesetDialog.callback?.(geneset)
            } else {
              setOpenGroupDialog(undefined)
            }
          }}
        />
      )}

      {genesets.length > 0 && (
        <ResizableSidebarHeaderPortal side="right">
          <LinkButton
            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  title: 'Clear Gene Sets',
                  content: 'Are you sure you want to clear all gene sets?',
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      //onGroupsChange?.([])
                      addGenesets([], { mode: 'set' })
                    }
                  },
                },
              })
            }}
            title="Clear all gene sets"
            className="text-xs"
          >
            {TEXT_CLEAR}
          </LinkButton>
        </ResizableSidebarHeaderPortal>
      )}

      <PropsPanel className="gap-y-1">
        <StretchRow className="gap-x-1">
          <VCenterRow>
            <IconButton
              //rounded="full"
              // ripple={false}
              onClick={() =>
                openFilesDialog({
                  message: 'Select gene set file to open',
                  fileTypes: ['json', 'tsv', 'txt', 'gmx', 'gmt'],
                  onFileChange: (message, files) => {
                    onTextFileChange(message, files, (files) => {
                      openGenesetFiles(files)
                    })
                  },
                })
              }
              title="Open Gene Sets"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                downloadJson(genesets, 'genesets.json')
              }}
              title="Save Gene Sets"
            >
              <DownloadIcon />
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
        <FileDropZonePanel
          className="grow"
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open dropped file', files, openGenesetFiles)
            }
          }}
        >
          {/* <VScrollPanel> */}
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={(event) => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = genesets.findIndex(
                  (g) => g.id === (active.id as string)
                )

                const newIndex = genesets.findIndex(
                  (g) => g.id === (over.id as string)
                )
                const newOrder = arrayMove(
                  genesets.map((g) => g.id),
                  oldIndex,
                  newIndex
                )

                reorderGenesets(newOrder)
              }

              //setActiveId(null)
            }}
          >
            <SortableContext
              items={genesets.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <VScrollPanel className="grow h-full">
                <ul className="flex flex-col">
                  {genesets.map((geneset) => {
                    //const cols = getColNamesFromGroup(df, group)

                    return (
                      // <BaseSortableItem key={id} id={id}>
                      <GenesetItem
                        geneset={geneset}
                        key={geneset.id}
                        editGeneset={editGeneset}
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
    </>
  )
}
