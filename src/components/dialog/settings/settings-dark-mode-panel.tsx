import { useEdbSettings } from '@lib/edb/edb-settings'
import { Monitor, MoonStar, Sun } from 'lucide-react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../shadcn/ui/themed/toggle-group'

export function SettingsDarkModePanel() {
  const { theme, applyTheme } = useEdbSettings()

  return (
    <ToggleGroup
      type="single"
      className="flex flex-row gap-x-1"
      value={theme}
      onValueChange={applyTheme}
      variant="colorful"
      rounded="lg"
    >
      <ToggleGroupItem
        value="dark"
        aria-label="Toggle dark mode"
        //className="flex flex-col gap-y-2 items-center"
        size="colorful"
      >
        <MoonStar
          className="w-6 h-6 aspect-square shrink-0"
          strokeWidth={1.5}
        />
        <span>Dark</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="light"
        aria-label="Toggle light mode"
        size="colorful"
      >
        <Sun className="w-6 h-6 aspect-square shrink-0" strokeWidth={1.5} />
        <span>Light</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="automatic"
        aria-label="Toggle automatic mode"
        size="colorful"
      >
        <Monitor className="w-6 h-6 aspect-square shrink-0" strokeWidth={1.5} />
        <span>Automatic</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
