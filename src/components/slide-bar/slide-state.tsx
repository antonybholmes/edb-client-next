import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'

interface ISlideState {
  divPos: number
  flexP: { p: number; w: number }
  isFixed: boolean
  setIsFixed: (fixed: boolean) => void
  open: boolean
  onOpenChange?: (open: boolean) => void
  setDivPos: (p: number) => void
  setFlexPos: (p: { p: number; w: number }) => void
}

export const SlideContext = createContext<ISlideState>({
  divPos: 0,
  flexP: { p: 0, w: 0 },
  isFixed: false,
  setIsFixed: () => {},
  open: true,
  onOpenChange: () => {},
  setDivPos: () => {},
  setFlexPos: () => {},
})

interface IProps extends IChildrenProps {
  divPos: number
  flexP: { p: number; w: number }
  isFixed: boolean
  setIsFixed: (fixed: boolean) => void
  setDivPos: (p: number) => void
  setFlexPos: (p: { p: number; w: number }) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SlideProvider({
  open = true,
  divPos,
  flexP,
  isFixed,
  setIsFixed,
  setDivPos,
  setFlexPos,
  onOpenChange = () => {},
  children,
}: IProps) {
  return (
    <SlideContext.Provider
      value={{
        divPos,
        flexP,
        isFixed,
        setIsFixed,
        setDivPos,
        setFlexPos,
        open,
        onOpenChange,
      }}
    >
      {children}
    </SlideContext.Provider>
  )
}
