import { TEXT_OPEN } from '@/consts'
import type { IElementProps } from '@interfaces/element-props'
import { OpenIcon } from '../icons/open-icon'
import { ToolbarIconButton } from './toolbar-icon-button'

interface IProps extends IElementProps {
  onOpenChange?: (open: boolean) => void
  showText?: boolean
  multiple?: boolean
}

export function ToolbarOpenFile({ onOpenChange, showText = false }: IProps) {
  return (
    <ToolbarIconButton onClick={() => onOpenChange?.(true)} title="Open file">
      <OpenIcon />
      {showText && <span>{TEXT_OPEN}</span>}
    </ToolbarIconButton>
  )
}
