import { TEXT_OPEN } from '@/consts'
import { ComponentProps } from 'react'
import { UploadIcon } from '../icons/upload-icon'
import { ToolbarColSmallButton } from './toolbar-col-button'

// interface IProps extends IDivProps {
//   onOpen?: () => void
//   showText?: boolean
//   multiple?: boolean
// }

export function ToolbarOpenFile({
  title = 'Open File',
  ...props
}: ComponentProps<'button'>) {
  return (
    <ToolbarColSmallButton icon={<UploadIcon />} title={title} {...props}>
      <UploadIcon size={24} strokeWidth={1} />
      {TEXT_OPEN}
    </ToolbarColSmallButton>
  )
}
