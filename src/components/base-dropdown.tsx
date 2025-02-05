import { type IElementProps } from '@interfaces/element-props'

import { Children, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './shadcn/ui/themed/dropdown-menu'

export const DROPDOWN_CLS = 'left-0'

interface IProps extends IElementProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  menuClassName?: string
  onOpenAutoFocus?: (e: Event) => void
}

export function BaseDropDown({
  open,
  onOpenChange,
  menuClassName,
  children,
}: IProps) {
  const [_open, setOpen] = useState(false)

  //onOpenChange={(open)=>onOpenChange?.(open)}

  // const ref = useOutsideListener<HTMLDivElement>(
  //   dropDownVisible,
  //   () => onClose && onClose(),
  // )
  // const hide = useDelayHide(dropDownVisible)

  // useWindowClickListener((e: { target: any }) => {
  //   if (ref.current && !ref.current.contains(e.target)) {
  //     onClose && onClose()
  //   }
  // })

  // const transitions = useTransition(dropDownVisible, {
  //   from: { opacity: 0, top: "90%" },
  //   enter: { opacity: 1, top: "100%" },
  //   leave: { opacity: 0, top: "90%" },
  // })

  function _onOpenChange(o: boolean) {
    if (open === undefined) {
      setOpen(o)
    }

    onOpenChange?.(o)
  }

  const c = Children.toArray(children)

  return (
    <DropdownMenu open={open ?? _open} onOpenChange={_onOpenChange}>
      <DropdownMenuTrigger asChild>{c[0]}</DropdownMenuTrigger>

      <DropdownMenuContent
        onInteractOutside={() => _onOpenChange(false)}
        onEscapeKeyDown={() => _onOpenChange(false)}
        align="start"
        className={menuClassName}
      >
        {c[1]}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
