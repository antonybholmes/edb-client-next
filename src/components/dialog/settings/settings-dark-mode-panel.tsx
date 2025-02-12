import { useEdbSettingsStore } from '@/lib/edb/edb-settings-store'
import { Monitor, MoonStar, Sun } from 'lucide-react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../shadcn/ui/themed/toggle-group'

export function SettingsDarkModePanel() {
  const { theme, applyTheme } = useEdbSettingsStore()

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
        className="flex flex-col gap-y-2"
        size="colorful"
      >
        <MoonStar className="w-6" strokeWidth={1.5} />
        <span>Dark</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="light"
        aria-label="Toggle light mode"
        className="flex flex-col gap-y-2"
        size="colorful"
      >
        <Sun className="w-6" strokeWidth={1.5} />
        <span>Light</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="automatic"
        aria-label="Toggle automatic mode"
        className="flex flex-col gap-y-2"
        size="colorful"
      >
        <Monitor className="w-6" strokeWidth={1.5} />
        <span>Automatic</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
