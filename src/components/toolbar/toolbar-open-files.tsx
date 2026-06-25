import { TEXT_OPEN } from '@/consts'
import { ComponentProps } from 'react'
import { UploadIcon } from '../icons/upload-icon'
import { ToolbarColButton } from './toolbar-col-button'

// interface IProps extends IDivProps {
//   onOpen?: () => void
//   showText?: boolean
//   multiple?: boolean
// }

export function ToolbarOpenFile({ ...props }: ComponentProps<'button'>) {
  return (
    <ToolbarColButton icon={<UploadIcon />} {...props}>
      <UploadIcon size={24} strokeWidth={1} />
      {TEXT_OPEN}
    </ToolbarColButton>
  )
}
