import { type IButtonProps } from '@themed/button'
import { ToolbarButton } from './toolbar-button'

export function ToolbarIconButton({
  ref,
  variant = 'flat',
  size = 'toolbar-icon',
  pad = 'none',
  aspect = 'icon',
  className,
  children,
  ...props
}: IButtonProps) {
  return (
    <ToolbarButton
      ref={ref}
      variant={variant}
      size={size}
      pad={pad}
      aspect={aspect}
      className={className}
      {...props}
    >
      {children}
    </ToolbarButton>
  )
}
