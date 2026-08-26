import { useDialogs } from '@/components/dialogs/dialogs'
import { IChildrenProps } from '@/interfaces/children-props'
import { downloadSvg, downloadSvgAsPng } from '@/lib/image-utils'
import { createContext, useCallback, useContext } from 'react'
import { useSVGStore } from './svg-store-provider'

interface ISaveSvg {
  save: (name: string) => void
  saveAsPng: (name: string, scale?: number) => void
  autoSave: (name: string, scale?: number) => void
  saveAs: (name: string) => void
}

const SVGSaveContext = createContext<ISaveSvg | null>(null)

export function useSVGSave() {
  const ctx = useContext(SVGSaveContext)

  if (!ctx) {
    throw new Error('useSVGSave must be used within a SVGSaveProvider')
  }

  return ctx
}

export function SVGSaveProvider({ children }: IChildrenProps) {
  const { open: openDialog } = useDialogs()
  const { ref } = useSVGStore()

  const save = useCallback(
    (name: string) => {
      downloadSvg(ref.current, name)
    },
    [ref, downloadSvg]
  )

  const saveAsPng = useCallback(
    (name: string, scale?: number) => {
      downloadSvgAsPng(ref.current, name, scale)
    },
    [ref, downloadSvgAsPng]
  )

  const autoSave = useCallback(
    (name: string, scale?: number) => {
      downloadSvgAsPng(ref.current, name, scale)
    },
    [ref, downloadSvgAsPng]
  )

  const saveAs = useCallback(
    (name: string) => {
      openDialog({
        type: 'save-image',
        payload: {
          //title: `Save ${name} As`,
          name: name,
          svg: ref.current,
        },
      })
    },
    [openDialog, ref]
  )

  return (
    <SVGSaveContext.Provider value={{ save, saveAsPng, autoSave, saveAs }}>
      {children}
    </SVGSaveContext.Provider>
  )
}
