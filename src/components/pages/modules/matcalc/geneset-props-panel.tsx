import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { Plus, Save } from 'lucide-react'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { TrashIcon } from '@components/icons/trash-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { downloadJson } from '@lib/download-utils'
import { makeRandId } from '@lib/utils'
import {
  forwardRef,
  useContext,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import { FileDropPanel } from '@/components/file-drop-panel'

import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import { OpenIcon } from '@/components/icons/open-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterCol } from '@/components/layout/v-center-col'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { makeNewGeneset, type IGeneset } from '@/lib/gsea/geneset'
import { range } from '@/lib/math/range'
import { VerticalGripIcon } from '@components/icons/vertical-grip-icon'
import { textToLines } from '@lib/text/lines'
import { currentSheet, HistoryContext } from '@providers/history-provider'
import { Reorder } from 'motion/react'
import { GenesetDialog } from './geneset-dialog'
import { GenesetsContext } from './genesets-provider'
import MODULE_INFO from './module.json'

const GENESET_CLS =
  'trans-color group grow relative  w-full overflow-hidden py-1 pl-2 pr-3 gap-x-3 rounded-theme'

export interface IGenesetCallback {
  geneset: IGeneset
  callback?: (geneset: IGeneset) => void
}

export interface IProps {
  //df: BaseDataFrame | null
  downloadRef: RefObject<HTMLAnchorElement | null>
  onCancel?: () => void
}

export const GenesetPropsPanel = forwardRef(function GenesetPropsPanel(
  { downloadRef }: IProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  //const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IGeneset | null>(null)
  const { genesetState, genesetDispatch } = useContext(GenesetsContext)

  const { history } = useContext(HistoryContext)

  const df = currentSheet(history)[0]!

  const [openGroupDialog, setOpenGroupDialog] = useState<
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
        genesetDispatch({ type: 'set', genesets: g })
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
        const name = df.colNames[i]
        const gs = makeNewGeneset(name)

        gs.genes = df.col(i).strs.filter(x => x.length > 0)

        genesets.push(gs)
      }

      genesetDispatch({ type: 'set', genesets })
    }
  }

  function GenesetItem({ geneset }: { geneset: IGeneset }) {
    const [drag, setDrag] = useState(false)
    const [hover, setHover] = useState(false)
    // moving around messes up mouse events, so use the
    // global mouse up to listen for mouse release
    useMouseUpListener(() => setDrag(false))

    return (
      <VCenterRow
        key={geneset.name}
        data-drag={drag}
        className={GENESET_CLS}
        style={{
          backgroundColor: hover || drag ? `${geneset.color}20` : undefined,
        }}
        onMouseDown={() => setDrag(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VCenterRow className="cursor-ns-resize">
          <VerticalGripIcon
            style={{
              stroke: geneset.color,
            }}
          />
        </VCenterRow>

        <VCenterCol
          className="grow gap-y-1"
          style={{
            fill: geneset.color,
            color: geneset.color,
          }}
        >
          <p className="font-semibold truncate">{geneset.name}</p>
          <p className="truncate">{geneset.genes.length} genes</p>
        </VCenterCol>

        <BaseCol
          data-drag={drag}
          className="gap-y-0.5 opacity-0 group-hover:opacity-100 data-[drag=true]:opacity-100 trans-opacity shrink-0"
        >
          <button
            title={`Edit ${geneset.name} group`}
            className="opacity-50 hover:opacity-100 trans-opacity"
            onClick={() => editGeneset(geneset)}
          >
            <SettingsIcon
              style={{
                stroke: geneset.color,
              }}
            />
          </button>

          <button
            onClick={() => setDelGroup(geneset)}
            className="opacity-50 hover:opacity-100 trans-opacity"
            title={`Delete ${geneset.name} gene set`}
            //onMouseEnter={() => setDelHover(true)}
            //onMouseLeave={() => setDelHover(false)}
          >
            <TrashIcon
              style={{
                stroke: geneset.color,
              }}
            />
          </button>
        </BaseCol>
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
  //         genesetDispatch({ type: 'set', groups: g })
  //       }
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function addGeneset() {
    // edit a new group
    editGeneset(makeNewGeneset())
  }

  function editGeneset(geneset: IGeneset) {
    if (!df) {
      return
    }

    setOpenGroupDialog({
      geneset,
      callback: (geneset: IGeneset) => {
        //const indices = getColIdxFromGroup(df, group)

        if (genesetState.genesets.has(geneset.id)) {
          // we modified and existing group so clone list, but replace existing
          // group with new group when they have the same id
          genesetDispatch({
            type: 'update',
            geneset,
          })
        } else {
          // append new group
          genesetDispatch({
            type: 'add',
            genesets: [geneset],
          })
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
      {openGroupDialog?.callback && (
        <GenesetDialog
          geneset={openGroupDialog?.geneset}
          callback={openGroupDialog?.callback}
          onReponse={() => setOpenGroupDialog(undefined)}
        />
      )}

      {confirmClear && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          onReponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              genesetDispatch({ type: 'clear' })
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
          onReponse={r => {
            if (r === TEXT_OK) {
              genesetDispatch({ type: 'remove', ids: [delGroup!.id] })
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
          onReponse={r => {
            if (r === TEXT_OK) {
              downloadJson(genesetState.genesets, downloadRef, 'genesets.json')
            }
            setShowSaveDialog(false)
          }}
        >
         
        </OKCancelDialog>
      )} */}

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
                title="Open gene sets"
                //className="fill-foreground/50 hover:fill-foreground"
              >
                <OpenIcon />
              </Button>

              <Button
                variant="accent"
                multiProps="icon"
                //rounded="full"
                ripple={false}
                onClick={() => {
                  //setShowSaveDialog(true)
                  downloadJson(
                    genesetState.genesets,
                    downloadRef,
                    'genesets.json'
                  )
                }}
                title="Save gene sets"
              >
                <Save className="w-5 h-5 rotate-180" strokeWidth={1.5} />
              </Button>
            </ToolbarTabGroup>
            <ToolbarSeparator />

            <Button
              variant="accent"
              multiProps="icon"
              ripple={false}
              onClick={() => addGeneset()}
              title="New Gene Set"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </VCenterRow>
          {genesetState.genesets.size > 0 && (
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
              title="Clear all gene sets"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <FileDropPanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openGenesetFiles)
            }
          }}
        >
          <VScrollPanel>
            <Reorder.Group
              values={genesetState.order}
              onReorder={order => {
                //setOrder(order)
                genesetDispatch({
                  type: 'order',
                  order: order,
                })
              }}
              className="gap-y-1 flex flex-col"
            >
              {genesetState.order.map(id => {
                const geneset = genesetState.genesets.get(id)!

                return (
                  <Reorder.Item key={id} value={id}>
                    <GenesetItem geneset={geneset} />
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
            onTextFileChange(message, files, files => {
              openGenesetFiles(files)
            })
          }
          fileTypes={['json', 'tsv', 'txt']}
        />
      )}
    </>
  )
})
