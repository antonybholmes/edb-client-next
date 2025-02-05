import { createContext } from 'react'

export const SplitPaneContext = createContext<{
  clientHeight: number | null
  setClientHeight: (v: number) => void
  clientWidth: number | null
  setClientWidth: (v: number) => void
  onMouseHoldDown: (e: MouseEvent | React.MouseEvent) => void
}>({
  clientHeight: 0,
  setClientHeight: () => {},
  clientWidth: 0,
  setClientWidth: () => {},
  onMouseHoldDown: () => {},
})
