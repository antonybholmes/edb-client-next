import { TEXT_OPEN } from '@/consts'
import type { IDivProps } from '@interfaces/div-props'
import { OpenIcon } from '../icons/open-icon'
import { ToolbarIconButton } from './toolbar-icon-button'

interface IProps extends IDivProps {
  onOpenChange?: (open: boolean) => void
  showText?: boolean
  multiple?: boolean
}

export function ToolbarOpenFile({ onOpenChange, showText = false }: IProps) {
  return (
    <ToolbarIconButton onClick={() => onOpenChange?.(true)} title="Open File">
      <OpenIcon />
      {showText && <span>{TEXT_OPEN}</span>}
    </ToolbarIconButton>
  )
}
