import { useTheme } from '@/components/edb/theme'
import { Monitor, MoonStar, Sun } from 'lucide-react'
import {
  GroupToggle,
  ToggleGroup,
} from '../../shadcn/ui/themed/v2/toggle-group'

export function SettingsDarkModePanel() {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup
      className="gap-x-1"
      value={[theme]}
      onValueChange={(value) =>
        setTheme(value[0] as 'dark' | 'light' | 'automatic')
      }
      variant="outline"
      rounded="lg"
    >
      <GroupToggle
        value="dark"
        aria-label="Toggle dark mode"
        //className="flex flex-col gap-y-2 items-center"
        size="colorful"
        className="flex-col"
      >
        <MoonStar
          className="w-6 h-6 aspect-square shrink-0"
          strokeWidth={1.5}
        />
        <span>Dark</span>
      </GroupToggle>
      <GroupToggle
        value="light"
        aria-label="Toggle light mode"
        size="colorful"
        className="flex-col"
      >
        <Sun className="w-6 h-6 aspect-square shrink-0" strokeWidth={1.5} />
        <span>Light</span>
      </GroupToggle>
      <GroupToggle
        value="automatic"
        aria-label="Toggle automatic mode"
        size="colorful"
        className="flex-col"
      >
        <Monitor className="w-6 h-6 aspect-square shrink-0" strokeWidth={1.5} />
        <span>Automatic</span>
      </GroupToggle>
    </ToggleGroup>
  )
}
