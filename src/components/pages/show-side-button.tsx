import { HamburgerIcon } from '@/icons/hamburger-icon'
import {
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { IconButton } from '@/themed/icon-button'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import type { IButtonProps } from '../shadcn/ui/themed/v2/button'

/**
 * Standardized button for showing a side menu consisting of a simple
 * hamburger icon with a subtle animation.
 *
 * @returns
 */
export function ShowSideButton({
  onClick,
  open = false,
  className,
}: IButtonProps) {
  //const [hover, setHover] = useState(false)

  return (
    <IconButton
      onClick={onClick}
      title={open ? 'Hide Folders' : 'Show Folders'}
      className={cn('group', className)}
      data-open={open}
    >
      <HamburgerIcon className={ICON_TRANSITION_FROM_CLS} />

      <ChevronRightIcon
        data-open={open} //rotate-180
        className={cn(
          'group-data-[open=true]:rotate-180',
          ICON_TRANSITION_TO_CLS
        )}
      />
    </IconButton>
  )
}
