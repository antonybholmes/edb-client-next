import { TEXT_CANCEL } from '@/consts'
import type { ISaveAsFileType, ISaveAsResponse } from '@/dialogs/save-as-dialog'
import { SaveImageDialog } from '@/dialogs/save-image-dialog'
import { makeUuid } from '@/lib/id'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import type { ComponentType, ReactNode, RefObject } from 'react'
import { create } from 'zustand'
import { ColorPickerDialog } from '../plot/color-picker-dialog'
import { IColorChangeProps } from '../plot/color-picker-popover'
import { renderTab } from '../tabs/tab-provider'
import { BasicAlertDialog } from './basic-alert-dialog'
import { OKCancelDialog, type ModalType } from './ok-cancel-dialog'
import { SaveTableDialog } from './save-table-dialog'
import { SaveTxtDialog } from './save-txt-dialog'
import { SettingsDialog } from './settings/settings-dialog'

export const MAX_DIALOGS = 10

export interface IBasicDialog {
  id: string
  time: number
}

type DialogTypeMap = {
  // open: {
  //   message?: string
  //   fileTypes?: string[]
  //   callback?: (message: string, files: FileList | []) => void
  // }
  'save-image': {
    title?: string
    name: string
    svgRef: RefObject<SVGSVGElement | null>
  }
  save: {
    title?: string
    name?: string
    fileTypes?: ISaveAsFileType[]
    callback?: (data: ISaveAsResponse) => void
  }
  'save-table': {
    title?: string
    name?: string
    fileTypes?: ISaveAsFileType[]
    callback?: (data: ISaveAsResponse) => void
  }
  color: {
    title?: string
    color: IColorChangeProps
    callback?: (data: IColorChangeProps) => void
  }
  alert: {
    title?: string
    content?: ReactNode
    component?: ComponentType<{}>
    type?: ModalType
    callback?: (response: string) => void
  }

  'ok-cancel': {
    title?: string
    content?: ReactNode
    type?: ModalType
    callback?: (response: string) => void
  }
  warning: {
    title?: string
    content?: ReactNode

    callback?: (response: string) => void
  }
  settings: { callback?: (response: string) => void }
}

type DialogType = keyof DialogTypeMap

interface IDialog<T extends DialogType> {
  id: string
  time: number
  type: T
  payload: DialogTypeMap[T]
}

type Dialog = {
  [T in DialogType]: IDialog<T>
}[DialogType]

type InputDialog = {
  [T in DialogType]: Omit<IDialog<T>, 'id' | 'time'>
}[DialogType]

export type ApplyToDialog = (id: string) => void

export interface IDialogCloser {
  id: string
  close: () => void
}

//  interface IPayloadDialog<
//   T extends keyof DialogTypeMap,
// > extends IBasicDialog {
//   type: T
//   payload: DialogTypeMap[T]
// }

// export interface ISaveImageDialog extends IPayloadDialog<'save-image'> {}
// export interface ISaveTxtDialog extends IPayloadDialog<save> {}

interface IDialogStore {
  stack: Dialog[]
  open: (d: InputDialog) => IDialogCloser
  bringToFront: (id: string) => void
  close: ApplyToDialog
  clear: () => void
}

// Helper to construct the correct dialog type
// function updateDialogTime<T extends keyof DialogTypeMap>(
//   dialog: Omit<IDialog<T>, 'time'>
// ): IDialog<T> {
//   return { ...dialog, time: Date.now() } as IDialog<T>
// }

export const useDialogStore = create<IDialogStore>((set) => ({
  stack: [], //{ type: 'none', id: makeUuid(), time: Date.now() },

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
      stack: id
        ? state.stack.filter((d) => d.id !== id)
        : state.stack.slice(0, -1),
    })),
  clear: () => set({ stack: [] }),
}))

export function useDialogs() {
  const open = useDialogStore((s) => s.open)
  const close = useDialogStore((s) => s.close)

  //const { open, close } = useDialogStore(
  //  useShallow(s => ({ open: s.open, close: s.close }))
  // )

  return { open, close }
}

function DialogRenderer({
  dialog,
  close,
}: {
  dialog: Dialog
  close: ApplyToDialog
}) {
  switch (dialog.type) {
    // case 'open': {
    //   const { fileTypes, callback } = dialog.payload

    //   openFilesDialog({
    //     fileTypes,
    //     onFileChange: (message, files) => {
    //       callback?.(message, files)

    //       close(dialog.id)
    //     },
    //   })
    //   return null
    // }
    case 'save': {
      const { title, name, fileTypes, callback } = dialog.payload
      return (
        <SaveTxtDialog
          title={title}
          name={name}
          fileTypes={fileTypes}
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              callback?.(data!)
            }
            close(dialog.id)
          }}
        />
      )
    }
    case 'save-table': {
      const { title, name, fileTypes, callback } = dialog.payload
      return (
        <SaveTableDialog
          title={title}
          name={name}
          fileTypes={fileTypes}
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              callback?.(data!)
            }
            close(dialog.id)
          }}
        />
      )
    }
    case 'save-image': {
      const { title, name, svgRef } = dialog.payload
      return (
        <SaveImageDialog
          title={title}
          name={name}
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL && svgRef.current) {
              downloadSvgAutoFormat(svgRef, (data as ISaveAsResponse).name)
            }
            close(dialog.id)
          }}
        />
      )
    }
    case 'color': {
      const {
        title,
        color,

        callback,
      } = dialog.payload

      return (
        <ColorPickerDialog
          title={title}
          color={color}

          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              callback?.(data!)
            }
            close(dialog.id)
          }}
        />
      )
    }
    case 'alert': {
      const {
        title,
        content,
        component,
        type = 'warning',
        callback,
      } = dialog.payload

      return (
        <BasicAlertDialog
          title={title}
          modalType={type}
          onResponse={(r) => {
            close(dialog.id)
            callback?.(r)
          }}
        >
          {content && content}
          {renderTab(component)}
        </BasicAlertDialog>
      )
    }
    case 'ok-cancel': {
      const { title, content, type, callback } = dialog.payload
      return (
        <OKCancelDialog
          title={title}
          modalType={type}
          onResponse={(response) => {
            close(dialog.id)
            callback?.(response)
          }}
        >
          {content}
        </OKCancelDialog>
      )
    }
    case 'warning': {
      const { title, content, callback } = dialog.payload
      return (
        <OKCancelDialog
          title={title}
          modalType="warning"
          onResponse={(response) => {
            close(dialog.id)
            callback?.(response)
          }}
        >
          {content}
        </OKCancelDialog>
      )
    }
    case 'settings': {
      const { callback } = dialog.payload
      return (
        <SettingsDialog
          onResponse={(response) => {
            close(dialog.id)
            callback?.(response)
          }}
        />
      )
    }
    default:
      return null
  }
}

interface IProps {
  // Optional filter to only render certain dialog types.
  // If empty, renders all dialogs. This is useful if you want to have
  // multiple DialogsRoot with different styles or in
  // different parts of the app, otherwise each dialogroot will render all dialogs
  // causing duplicate dialogs to appear.
  filter?: (keyof DialogTypeMap)[]
}

export function DialogsRoot({ filter = [] }: IProps) {
  const stack = useDialogStore((s) => s.stack)
  const close = useDialogStore((s) => s.close)
  const dialog = stack.at(-1) as Dialog | undefined // top dialog is still a discriminated union for rendering

  if (!dialog || (filter.length > 0 && !filter.includes(dialog.type))) {
    return null
  }

  //const Renderer = dialogRenderers[dialog.type]!
  //return Renderer ? Renderer(dialog, close) : null
  return <DialogRenderer dialog={dialog} close={close} />
}
