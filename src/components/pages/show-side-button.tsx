import { HamburgerIcon } from '@components/icons/hamburger-icon'
import { IconButton } from '@components/shadcn/ui/themed/icon-button'
import type { IElementProps } from '@interfaces/element-props'
import { useState } from 'react'

/**
 * Standardized button for showing a side menu consisting of a simple
 * hamburger icon with a subtle animation.
 *
 * @param param0
 * @returns
 */
export function ShowSideButton({ onClick, className }: IElementProps) {
  const [hover, setHover] = useState(false)

  return (
    <IconButton
      onClick={onClick}
      title="Show folders"
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <HamburgerIcon hover={hover} />
    </IconButton>
  )
}
