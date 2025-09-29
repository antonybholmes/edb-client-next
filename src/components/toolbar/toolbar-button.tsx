import { Button, type IButtonProps } from '@themed/button'

export function ToolbarButton({
  size = 'toolbar',
  //pad = 'default',
  className,
  children,
  ...props
}: IButtonProps) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      variant="flat"
      rounded="theme"
      size={size}
      className={className}
      // ripple={ripple}
      {...props}
    >
      {children}
    </Button>
  )
}
