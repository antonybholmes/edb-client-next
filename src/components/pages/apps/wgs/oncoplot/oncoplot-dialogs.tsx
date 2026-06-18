import {
  MAX_DIALOGS,
  type ApplyToDialog,
  type IDialogCloser,
} from '@/components/dialogs/dialogs'
import { makeUuid } from '@/lib/id'
import { create } from 'zustand'

import { ClinicalDialog } from './clinical-dialog'
import type { ClinicalDataTrack } from './clinical-utils'

type DialogTypeMap = {
  track: {
    track: ClinicalDataTrack
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

export const useOncoplotDialogStore = create<ISingleCellDialogStore>(set => ({
  stack: [],

  open: d => {
    const id = makeUuid()
    const dialog = { ...d, id, time: Date.now() }

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

export function useOncoplotDialogs() {
  const open = useOncoplotDialogStore(s => s.open)
  const close = useOncoplotDialogStore(s => s.close)

  return { open, close }
}

interface IDialogRenderer<T extends DialogType> {
  dialog: IDialog<T>
  close: ApplyToDialog
}

function TrackDialogRenderer({ dialog, close }: IDialogRenderer<'track'>) {
  const { track } = dialog.payload

  return <ClinicalDialog track={track} onResponse={() => close(dialog.id)} />
}

function DialogRenderer({
  dialog,
  close,
}: {
  dialog: Dialog
  close: ApplyToDialog
}) {
  switch (dialog.type) {
    case 'track':
      return <TrackDialogRenderer dialog={dialog} close={close} />

    default:
      return null
  }
}

export function OncoplotDialogsRoot() {
  const stack = useOncoplotDialogStore(s => s.stack)
  const close = useOncoplotDialogStore(s => s.close)
  const dialog = stack.at(-1) as Dialog | undefined // top dialog is still a discriminated union for rendering

  if (!dialog) {
    return null
  }

  return <DialogRenderer dialog={dialog} close={close} />
}
