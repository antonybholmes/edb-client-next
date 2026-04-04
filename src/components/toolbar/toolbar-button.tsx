import { Button } from '@/themed/v2/button'
import type { ComponentProps } from 'react'

export function ToolbarButton({
  size = 'toolbar',
  pad = 'sm',
  //pad = 'default',
  className = '',
  children,
  ...props
}: ComponentProps<typeof Button>) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      variant="flat"
      rounded="theme"
      size={size}
      pad={pad}
      className={className}
      // ripple={ripple}
      {...props}
    >
      {children}
    </Button>
  )
}
