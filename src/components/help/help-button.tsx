import { HelpIcon } from '../icons/help-icon'
import { type IButtonProps } from '../shadcn/ui/themed/v2/button'
import { HELP_WINDOW_PARAMS } from './help'

interface IProps extends IButtonProps {
  title?: string
  url: string
}

export function HelpButton({ url, title = 'Show Help' }: IProps) {
  return (
    <button
      onClick={() => {
        window.open(url, 'HelpWindow', HELP_WINDOW_PARAMS)
      }}
      title={title}
    >
      <HelpIcon />
    </button>
  )
}
