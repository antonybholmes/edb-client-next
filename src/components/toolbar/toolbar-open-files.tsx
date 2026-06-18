import { TEXT_OPEN } from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import { UploadIcon } from '../icons/upload-icon'
import { ToolbarColButton } from './toolbar-col-button'

interface IProps extends IDivProps {
  onOpen?: () => void
  showText?: boolean
  multiple?: boolean
}

export function ToolbarOpenFile({ onOpen }: IProps) {
  return (
    <ToolbarColButton
      onClick={() => onOpen?.()}
      icon={<UploadIcon />}
      title="Open local file"
    >
      <UploadIcon size={24} strokeWidth={1} />
      {TEXT_OPEN}
    </ToolbarColButton>
  )
}
