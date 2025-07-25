import { type IButtonProps } from '@themed/button'

import { type IDivProps } from '@interfaces/div-props'
import { Sheet, SheetContent } from '@themed/sheet'
import { Children } from 'react'

export interface IMenuButtonProps extends IButtonProps {
  open: boolean
}

export interface IProps extends IDivProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'left' | 'bottom' | 'right' | null
}

export function BaseSideMenu({
  open = false,
  onOpenChange = () => {},
  side = 'left',
  className,
  children,
}: IProps) {
  //const [dropDownVisible, setDropDownVisible] = useState(false)
  // const hide = useDelayHide(dropDownVisible)

  // const menuRef = useOutsideListener<HTMLDivElement>(dropDownVisible, () =>
  //   setDropDownVisible(false),
  // )

  const c = Children.toArray(children)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {
        // trigger button
        c[0]
      }

      <SheetContent side={side} className={className}>
        {/* <VCenterRow
          className={cn(TOOLBAR_H_CLS, side === "Right" && "justify-end")}
        >
          <Dialog.Close asChild>
            <SideMenuButton showMenu={true} />
          </Dialog.Close>
        </VCenterRow> */}

        {c[1]}
      </SheetContent>
    </Sheet>
  )
}
