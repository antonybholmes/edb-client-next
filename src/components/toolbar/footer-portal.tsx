import type { IChildrenProps } from '@/interfaces/children-props'
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

export function FooterPortal({ children }: IChildrenProps) {
  const [targets, setTargets] = useState<{
    left: HTMLElement | null
    center: HTMLElement | null
    right: HTMLElement | null
  } | null>(null)

  useEffect(() => {
    setTargets({
      left: document.getElementById('footer-left'),
      center: document.getElementById('footer-center'),
      right: document.getElementById('footer-right'),
    })
  }, [])

  if (!targets) {
    return null
  }

  const c = Children.toArray(children)

  if (c.length === 0) {
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

export function FooterSlotPortal({
  slot = 'footer-left',
  children,
}: IChildrenProps & {
  slot?: 'footer-left' | 'footer-right' | 'footer-center'
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setTarget(document.getElementById(slot))
  }, [slot])

  if (!target) {
    return null
  }

  return createPortal(children, target)
}
