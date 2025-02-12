import { cn } from '@lib/class-names'

import { CENTERED_ROW_CLS } from '@/theme'
import type { IChildrenProps } from '@interfaces/children-props'
import { Children } from 'react'
import { VCenterRow } from '../layout/v-center-row'

// export const FooterContext = createContext<{
//   left: ReactNode
//   center: ReactNode
//   right: ReactNode
//   setFooterLeft: Dispatch<SetStateAction<ReactNode>>
//   setFooterCenter: Dispatch<SetStateAction<ReactNode>>
//   setFooterRight: Dispatch<SetStateAction<ReactNode>>
// }>({
//   left: undefined,
//   center: undefined,
//   right: undefined,
//   setFooterLeft: function (value: SetStateAction<ReactNode>): void {},
//   setFooterCenter: function (value: SetStateAction<ReactNode>): void {},
//   setFooterRight: function (value: SetStateAction<ReactNode>): void {},
// })

// interface IFooterProviderProps extends IChildrenProps {
//   left?: ReactNode
//   center?: ReactNode
//   right?: ReactNode
// }

// export const FooterProvider = ({
//   left = undefined,
//   center = undefined,
//   right = undefined,
//   children,
// }: IFooterProviderProps) => {
//   const [_left, setFooterLeft] = useState<ReactNode>(undefined)
//   const [_center, setFooterCenter] = useState<ReactNode>(undefined)
//   const [_right, setFooterRight] = useState<ReactNode>(undefined)

//   useEffect(() => {
//     setFooterLeft(left)
//   }, [left])

//   useEffect(() => {
//     setFooterCenter(center)
//   }, [center])

//   useEffect(() => {
//     setFooterRight(right)
//   }, [right])

//   const c = Children.toArray(children)

//   return (
//     <FooterContext.Provider
//       value={{
//         left: _left,
//         center: _center,
//         right: _right,
//         setFooterLeft,
//         setFooterCenter,
//         setFooterRight,
//       }}
//     >
//       {children}
//     </FooterContext.Provider>
//   )
// }

export const TOOLBAR_FOOTER_CLS = cn(
  CENTERED_ROW_CLS,
  'h-6 px-2 text-xs text-foreground/50 overflow-hidden justify-between grid grid-cols-3 shrink-0 fixed left-0 right-0 bottom-0 w-full bg-body z-10 border-t  border-border  '
)

export function ToolbarFooter({ className, children }: IChildrenProps) {
  const c = Children.toArray(children)

  return (
    <footer className={cn(TOOLBAR_FOOTER_CLS, className)}>
      <VCenterRow>{c.length > 0 && c[0]}</VCenterRow>
      <VCenterRow className="justify-center">{c.length > 0 && c[1]}</VCenterRow>
      <VCenterRow className="justify-end">{c.length > 1 && c[2]}</VCenterRow>
    </footer>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
