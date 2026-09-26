import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { Move } from 'lucide-react'
import { useState } from 'react'
import {
  LabelPosition,
  POSITIONS,
  useNetworkSettings,
} from '../network-settings-store'

export function PositionDropdown() {
  const { settings, updateSettings } = useNetworkSettings()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title="Position"
        render={
          <ToolbarIconButton>
            <Move size={16} />
          </ToolbarIconButton>
        }
      ></DropdownMenuTrigger>

      <DropdownMenuContent>
        {POSITIONS.map((position) => (
          <DropdownMenuCheckboxItem
            key={position.value}
            checked={settings.plot.nodes.labels.position === position.value}
            onClick={() => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plot.nodes.labels.position =
                    position.value as LabelPosition
                })
              )
            }}
          >
            <span>{position.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
