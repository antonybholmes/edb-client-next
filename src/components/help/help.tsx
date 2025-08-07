import { TEXT_HELP } from '@/consts'
import { SquareArrowUpRight } from 'lucide-react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { CloseButton } from '../dialog/ok-cancel-dialog'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'

export const HELP_WINDOW_PARAMS =
  'width=1080,height=720,toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes'

type HelpWidgetStore = {
  isOpen: boolean
  url: string
  open: () => void
  openHelp: (url: string) => void
  close: () => void
  toggle: () => void
}

export const useHelpWidgetStore = create<HelpWidgetStore>((set) => ({
  isOpen: false,
  url: '',
  open: () => set({ isOpen: true }),
  openHelp: (url: string) => set({ isOpen: true, url: url }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

export function HelpWidget() {
  const { isOpen, url, close } = useHelpWidgetStore(
    useShallow((state) => ({
      url: state.url,
      isOpen: state.isOpen,
      close: state.close,
    }))
  )

  if (!isOpen || url === '') return null

  return createPortal(
    <BaseCol className="fixed bottom-8 right-4 min-w-100 w-1/5 min-h-50 h-2/3 bg-background border border-border/50 rounded-xl shadow-xl z-(--z-modal) overflow-hidden">
      <VCenterRow className="justify-between p-2 pl-3">
        <VCenterRow className="gap-x-2">
          <span className="font-bold">{TEXT_HELP}</span>
          <button
            title="Open in new window"
            aria-label="Open in new window"
            className="group"
            onClick={() => {
              window.open(url, 'HelpWindow', HELP_WINDOW_PARAMS)

              close()
            }}
          >
            <SquareArrowUpRight
              className="w-4.5 stroke-foreground/50 group-hover:stroke-foreground group-focus-visible:stroke-foreground trans-color"
              strokeWidth={1.5}
            />
          </button>
        </VCenterRow>

        <CloseButton onClick={() => close()} />
      </VCenterRow>
      <BaseCol className="p-1 grow">
        <iframe
          src={url}
          title="Help"
          className="w-full h-full border-none grow custom-scrollbar"
        />
      </BaseCol>
    </BaseCol>,
    document.body
  )
}

// export function HelpButton() {
//   const toggle = useHelpWidgetStore(s => s.toggle)

//   return (
//     <button
//       onClick={() => toggle()}
//       className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-50"
//     >
//       ?
//     </button>
//   )
// }
