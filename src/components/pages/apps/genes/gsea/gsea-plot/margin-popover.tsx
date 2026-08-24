import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { NumericalPropRow } from '@/dialogs/numerical-prop-row'

import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { MarginIcon } from '../../../../../icons/margin-icon'
import { useGseaSettings } from './gsea-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useGseaSettings()

  //const title = `Top:${settings.plot.margin.top}, Left:${settings.plot.margin.left}, Bottom:${settings.plot.margin.bottom}, Right:${settings.plot.margin.right}`

  return (
    <Popover>
      <PopoverTrigger
        title="Margins"
        render={
          <ToolbarIconButton>
            <MarginIcon />
          </ToolbarIconButton>
        }
      />

      <PopoverContent
        //alignOffset={4}
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        className="gap-y-1 flex-col w-42"
        variant="content"
      >
        <NumericalPropRow
          title="Top"
          value={settings.plot.margin.top}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.margin.top = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Left"
          value={settings.plot.margin.left}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.margin.left = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Bottom"
          value={settings.plot.margin.bottom}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.margin.bottom = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Right"
          value={settings.plot.margin.right}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.margin.right = v
              })
            )
          }
        />
      </PopoverContent>
    </Popover>
  )
}
