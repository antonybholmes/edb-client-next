import type { IChildrenProps } from '@interfaces/children-props'
import { Children, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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

export function ToolbarFooterPortal({ children }: IChildrenProps) {
  const [targets, setTargets] = useState<{
    left: HTMLElement | null
    center: HTMLElement | null
    right: HTMLElement | null
  }>({
    left: null,
    center: null,
    right: null,
  })

  useEffect(() => {
    setTargets({
      left: document.getElementById('toolbar-footer-left'),
      center: document.getElementById('toolbar-footer-center'),
      right: document.getElementById('toolbar-footer-right'),
    })
  }, [])

  const c = Children.toArray(children)

  if (c.length === 0) {
    console.warn('FooterPortal expects at least 1 child')
    return null
  }

  return (
    <>
      {c.length > 0 && targets.left && createPortal(c[0], targets.left)}
      {c.length > 1 && targets.center && createPortal(c[1], targets.center)}
      {c.length > 2 && targets.right && createPortal(c[2], targets.right)}
    </>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
