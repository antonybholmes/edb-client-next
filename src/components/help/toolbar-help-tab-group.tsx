import { TEXT_HELP } from '@/consts'
import { type IDivProps } from '@interfaces/div-props'
import { HelpIcon } from '../icons/help-icon'
import { ToolbarButton } from '../toolbar/toolbar-button'
import { ToolbarTabGroup } from '../toolbar/toolbar-tab-group'
import { useHelpWidgetStore } from './help'

interface IProps extends IDivProps {
  title?: string
  url: string
}

export function ToolbarHelpTabGroup({
  url,
  title = 'Show Help',
  children,
}: IProps) {
  //console.log('open', url)

  return (
    <ToolbarTabGroup title={TEXT_HELP}>
      <HelpButton url={url} title={title} />
      {children}
    </ToolbarTabGroup>
  )
}

function HelpButton({ url, title = 'Show Help' }: IProps) {
  const openHelp = useHelpWidgetStore(s => s.openHelp)

  //console.log('open', url)

  return (
    <ToolbarButton onClick={() => openHelp(url)} title={title}>
      <HelpIcon /> <span>{TEXT_HELP}</span>
    </ToolbarButton>
  )
}
