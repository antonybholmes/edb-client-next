import { type IButtonProps } from '@/themed/v2/button'
import { ToolbarButton } from './toolbar-button'

export function ToolbarIconButton({
  ref,
  variant = 'flat',
  pad = 'none',
  aspect = 'icon',
  className = '',
  children,
  ...props
}: IButtonProps) {
  return (
    <ToolbarButton
      ref={ref}
      variant={variant}
      size="toolbar"
      pad={pad}
      aspect={aspect}
      className={className}
      {...props}
    >
      {children}
    </ToolbarButton>
  )
}
