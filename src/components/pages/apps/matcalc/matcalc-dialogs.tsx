import {
  MAX_DIALOGS,
  type ApplyToDialog,
  type IDialogCloser,
} from '@/components/dialogs/dialogs'
import type { ModalResponse } from '@/components/dialogs/ok-cancel-dialog'
import { TEXT_OK } from '@/consts'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import type { ISelectionRange } from '@/providers/selection-range'
import { create } from 'zustand'
import type { IParseOptions, ITextFileOpen } from '../../open-files'
import { AnnotateDialog } from './apps/annotate/annotate-dialog'
import { BoxWhiskersDialog } from './apps/boxplot/boxplot-dialog'
import { GeneConvertDialog } from './apps/gene-convert/gene-convert-dialog'
import { GexDialog } from './apps/gex/gex-dialog'
import { DotPlotDialog } from './apps/heatmap/dot-plot-dialog'
import { HeatMapDialog } from './apps/heatmap/heatmap-dialog'
import { KmeansDialog } from './apps/kmeans/kmeans-dialog'
import { MotifToGeneDialog } from './apps/motifs-to-genes/motif-to-gene-dialog'
import { VolcanoDialog } from './apps/volcano/volcano-dialog'
import type { DataFrameType, HistoryPlot } from './history/history-store'
import { OpenTableDialog } from './open-table-dialog'
import { SortRowDialog } from './sort-row-dialog'
import { TopRowsDialog } from './top-rows-dialog'

type DialogTypeMap = {
  'open-table-file': {
    callback: (files: ITextFileOpen[], options: IParseOptions) => void
    files: ITextFileOpen[]
  }
  heatmap: {
    sheet?: DataFrameType
    isClusterMap?: boolean
    callback: (plot: HistoryPlot) => void
  }
  'dot-plot': {
    isClusterMap?: boolean
    callback: (plot: HistoryPlot) => void
  }
  'volcano-plot': {
    callback: (plot: HistoryPlot) => void
  }
  'box-whiskers': {
    callback: (plot: HistoryPlot) => void
  }
  kmeans: {
    callback: (data: { df: AnnotationDataFrame; drawHeatmap: boolean }) => void
  }
  'sort-rows': {
    selection: ISelectionRange
    callback?: ModalResponse<BaseDataFrame>
  }
  'top-rows': {
    callback?: ModalResponse<BaseDataFrame>
  }
  'motif-to-gene': {
    selection: ISelectionRange
    callback?: ModalResponse<BaseDataFrame>
  }
  'gene-species-convert': {
    //selection: ISelectionRange
    callback?: ModalResponse<BaseDataFrame>
  }
  annotate: {
    selection: ISelectionRange
    callback?: ModalResponse<BaseDataFrame>
  }
  gex: {}
}

type DialogType = keyof DialogTypeMap

// creates a record of dialog types to their payloads,
// e.g. { 'edit-plot': { geneset: IGeneSet }, ... } and by
// using [DialogType] we can get a union of all dialog objects,
// e.g. { type: 'edit-plot', payload: { geneset: IGeneSet } }
// | { type: 'add-genes', payload: { datasetId: string } } | ...

type InputDialog = {
  [T in DialogType]: Omit<IDialog<T>, 'id' | 'time'>
}[DialogType]

type Dialog = {
  [T in DialogType]: IDialog<T>
}[DialogType]

interface IDialog<T extends DialogType> {
  id: string
  time: number
  type: T
  payload: DialogTypeMap[T]
}

interface IMatcalcDialogStore {
  stack: Dialog[]
  open: (d: InputDialog) => IDialogCloser
  bringToFront: ApplyToDialog
  close: ApplyToDialog
  clear: () => void
}

export const useMatcalcDialogStore = create<IMatcalcDialogStore>(set => ({
  stack: [], //{ type: 'none', id: makeUuid(), time: Date.now() },

  open: (d: InputDialog) => {
    const id = makeUuid()
    const dialog = { ...d, id, time: Date.now() }
    console.log('Opening dialog', dialog.type, id)

    set(state => ({
      stack: [...state.stack.slice(-MAX_DIALOGS + 1), dialog],
    }))

    return {
      id,
      close: () =>
        set(state => ({
          stack: state.stack.filter(d => d.id !== id),
        })),
    }
  },
  bringToFront: (id: string) =>
    set(state => {
      const dialog = state.stack.find(d => d.id === id)

      if (!dialog) {
        return state
      }

      return {
        stack: [
          ...state.stack.filter(d => d.id !== id),
          { ...dialog, time: Date.now() },
        ],
      }
    }),
  close: (id: string) =>
    set(state => ({
      // if id is provided, remove that dialog. If not, remove the top dialog.
      stack: state.stack.filter(d => d.id !== id),
    })),
  clear: () => set({ stack: [] }),
}))

export function useMatcalcDialogs() {
  const open = useMatcalcDialogStore(s => s.open)
  const close = useMatcalcDialogStore(s => s.close)

  return { open, close }
}

interface IDialogRenderer<T extends DialogType> {
  dialog: IDialog<T>
  close: ApplyToDialog
}

function OpenTableFileDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'open-table-file'>) {
  const { files, callback } = dialog.payload
  return (
    <OpenTableDialog
      files={files}
      openFiles={(files, options) => {
        callback(files, options)
        close(dialog.id)
      }}
      onCancel={() => close(dialog.id)}
    />
  )
}

function HeatmapDialogRenderer({ dialog, close }: IDialogRenderer<'heatmap'>) {
  const { sheet, isClusterMap, callback } = dialog.payload
  return (
    <HeatMapDialog
      sheet={sheet}
      isClusterMap={isClusterMap}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function DotPlotDialogRenderer({ dialog, close }: IDialogRenderer<'dot-plot'>) {
  const { isClusterMap, callback } = dialog.payload
  return (
    <DotPlotDialog
      isClusterMap={isClusterMap}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function VolcanoPlotDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'volcano-plot'>) {
  const { callback } = dialog.payload
  return (
    <VolcanoDialog
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function BoxWhiskersDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'box-whiskers'>) {
  const { callback } = dialog.payload
  return (
    <BoxWhiskersDialog
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function KmeansDialogRenderer({ dialog, close }: IDialogRenderer<'kmeans'>) {
  const { callback } = dialog.payload
  return (
    <KmeansDialog
      onResponse={(text, data) => {
        if (text === TEXT_OK) {
          if (data && data.drawHeatmap) {
            callback(data)
          }
        }
        close(dialog.id)
      }}
    />
  )
}

function SortRowsDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'sort-rows'>) {
  const { selection, callback } = dialog.payload
  return (
    <SortRowDialog
      selection={selection}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(response, data)
        }
        close(dialog.id)
      }}
    />
  )
}

function TopRowsDialogRenderer({ dialog, close }: IDialogRenderer<'top-rows'>) {
  const { callback } = dialog.payload
  return (
    <TopRowsDialog
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(response, data)
        }
        close(dialog.id)
      }}
    />
  )
}

function MotifToGeneDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'motif-to-gene'>) {
  const { selection, callback } = dialog.payload
  return (
    <MotifToGeneDialog
      selection={selection}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(response, data)
        }
        close(dialog.id)
      }}
    />
  )
}

function GeneSpeciesConvertDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'gene-species-convert'>) {
  const { callback } = dialog.payload
  return (
    <GeneConvertDialog
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(response, data)
        }
        close(dialog.id)
      }}
    />
  )
}

function GexDialogRenderer({ dialog, close }: IDialogRenderer<'gex'>) {
  return (
    <GexDialog
      onResponse={() => {
        close(dialog.id)
      }}
    />
  )
}

function AnnotateDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'annotate'>) {
  const { selection, callback } = dialog.payload
  return (
    <AnnotateDialog
      selection={selection}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(response, data)
        }
        close(dialog.id)
      }}
    />
  )
}

function DialogRenderer({
  dialog,
  close,
}: {
  dialog: Dialog
  close: ApplyToDialog
}) {
  switch (dialog.type) {
    case 'open-table-file':
      return <OpenTableFileDialogRenderer dialog={dialog} close={close} />
    case 'heatmap':
      return <HeatmapDialogRenderer dialog={dialog} close={close} />
    case 'dot-plot':
      return <DotPlotDialogRenderer dialog={dialog} close={close} />
    case 'volcano-plot':
      return <VolcanoPlotDialogRenderer dialog={dialog} close={close} />
    case 'box-whiskers':
      return <BoxWhiskersDialogRenderer dialog={dialog} close={close} />
    case 'kmeans':
      return <KmeansDialogRenderer dialog={dialog} close={close} />
    case 'sort-rows':
      return <SortRowsDialogRenderer dialog={dialog} close={close} />
    case 'top-rows':
      return <TopRowsDialogRenderer dialog={dialog} close={close} />
    case 'motif-to-gene':
      return <MotifToGeneDialogRenderer dialog={dialog} close={close} />
    case 'gex':
      return <GexDialogRenderer dialog={dialog} close={close} />
    case 'gene-species-convert':
      return <GeneSpeciesConvertDialogRenderer dialog={dialog} close={close} />
    case 'annotate':
      return <AnnotateDialogRenderer dialog={dialog} close={close} />
    default:
      return null
  }
}

export function MatcalcDialogsRoot() {
  const stack = useMatcalcDialogStore(s => s.stack)
  const close = useMatcalcDialogStore(s => s.close)
  const dialog = stack.at(-1) as Dialog | undefined // top dialog is still a discriminated union for rendering

  if (!dialog) {
    return null
  }

  return <DialogRenderer dialog={dialog} close={close} />
}
