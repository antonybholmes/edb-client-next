import {
  MAX_DIALOGS,
  type ApplyToDialog,
  type IDialogCloser,
} from '@/components/dialogs/dialogs'
import { makeUuid } from '@/lib/id'
import { create } from 'zustand'

import { AddGenesDialog } from './add-genes-dialog'
import { ClusterDialog } from './cluster-dialog'
import { PlotEditDialog } from './plot-edit-dialog'
import type { IScrnaCluster } from './plot-grid-store'
import type { IGeneSet } from './single-cell-settings'

type DialogTypeMap = {
  'edit-plot': {
    geneset: IGeneSet
  }

  'add-genes': {}

  'edit-cluster': {
    cluster: IScrnaCluster
  }
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

interface ISingleCellDialogStore {
  stack: Dialog[]
  open: (d: InputDialog) => IDialogCloser
  bringToFront: ApplyToDialog
  close: ApplyToDialog
  clear: () => void
}

export const useSingleCellDialogStore = create<ISingleCellDialogStore>(
  (set) => ({
    stack: [],

    open: (d) => {
      const id = makeUuid()
      const dialog = { ...d, id, time: Date.now() }

      set((state) => ({
        stack: [...state.stack.slice(-MAX_DIALOGS + 1), dialog],
      }))

      return {
        id,
        close: () =>
          set((state) => ({
            stack: state.stack.filter((d) => d.id !== id),
          })),
      }
    },
    bringToFront: (id: string) =>
      set((state) => {
        const dialog = state.stack.find((d) => d.id === id)

        if (!dialog) {
          return state
        }

        return {
          stack: [
            ...state.stack.filter((d) => d.id !== id),
            { ...dialog, time: Date.now() },
          ],
        }
      }),
    close: (id: string) =>
      set((state) => ({
        // if id is provided, remove that dialog. If not, remove the top dialog.
        stack: state.stack.filter((d) => d.id !== id),
      })),
    clear: () => set({ stack: [] }),
  })
)

export function useSingleCellDialogs() {
  const open = useSingleCellDialogStore((s) => s.open)
  const close = useSingleCellDialogStore((s) => s.close)

  return { open, close }
}

interface IDialogRenderer<T extends DialogType> {
  dialog: IDialog<T>
  close: ApplyToDialog
}

function EditPlotDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-plot'>) {
  const { geneset } = dialog.payload
  return (
    <PlotEditDialog
      geneset={geneset}
      onResponse={() => {
        close(dialog.id)
      }}
    />
  )
}

function AddGenesDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'add-genes'>) {
  return (
    <AddGenesDialog
      onResponse={() => {
        close(dialog.id)
      }}
    />
  )
}

function EditClusterDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-cluster'>) {
  const { cluster } = dialog.payload

  return <ClusterDialog cluster={cluster} onResponse={() => close(dialog.id)} />
}

// function assertNever(value: never): never {
//   throw new Error(`Unhandled dialog type: ${String(value)}`)
// }

function DialogRenderer({
  dialog,
  close,
}: {
  dialog: Dialog
  close: ApplyToDialog
}) {
  switch (dialog.type) {
    case 'edit-plot':
      return <EditPlotDialogRenderer dialog={dialog} close={close} />

    case 'add-genes':
      return <AddGenesDialogRenderer dialog={dialog} close={close} />

    case 'edit-cluster':
      return <EditClusterDialogRenderer dialog={dialog} close={close} />

    default:
      return null
  }
}

export function SingleCellDialogsRoot() {
  const stack = useSingleCellDialogStore((s) => s.stack)
  const close = useSingleCellDialogStore((s) => s.close)
  const dialog = stack.at(-1) as Dialog | undefined // top dialog is still a discriminated union for rendering

  if (!dialog) {
    return null
  }

  return <DialogRenderer dialog={dialog} close={close} />
}
