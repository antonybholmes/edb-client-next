import { HamburgerIcon } from '@icons/hamburger-icon'
import { IconButton } from '@themed/icon-button'
import { useState } from 'react'
import type { IButtonProps } from '../shadcn/ui/themed/button'

/**
 * Standardized button for showing a side menu consisting of a simple
 * hamburger icon with a subtle animation.
 *
 * @returns
 */
export function ShowSideButton({ onClick, className }: IButtonProps) {
  const [hover, setHover] = useState(false)

  return (
    <IconButton
      onClick={onClick}
      title="Show Folders"
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <HamburgerIcon hover={hover} />
    </IconButton>
  )
}
