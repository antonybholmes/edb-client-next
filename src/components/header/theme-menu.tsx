import { useState } from 'react'

import { Button } from '@components/shadcn/ui/themed/button'
import { ComputerIcon } from '@icons/computer'
import { MoonIcon } from '@icons/moon-icon'
import { SunIcon } from '@icons/sun'

import { useEdbSettingsStore, type Theme } from '@/lib/edb/edb-settings-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/dropdown-menu'

export function ThemeMenu() {
  const [open, setOpen] = useState(false)

  //const [theme, setTheme] = useState<string>("system")
  const { settings, updateSettings, theme, applyTheme } = useEdbSettingsStore()

  // function onClose() {
  //   setOpen(false)
  // }

  function clickTheme(theme: Theme) {
    updateSettings({ ...settings })
    applyTheme(theme)
    setOpen(false)
  }

  function getIcon(theme: Theme | undefined) {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-4" />
      case 'dark':
        return <MoonIcon className="w-3.5" />
      default:
        return <ComputerIcon className="w-4 -scale-x-100" />
    }
  }

  // placeholder to stop layout shift. We must wait until component
  // has mounted before using theme value
  // if (!mounted) {
  //   return <Button aria-label="Toggle dark mode" size="lg-icon" />
  // }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
          selected={open}
          className="justify-center fill-foreground"
        >
          {getIcon(theme)}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        align="end"
        className="fill-foreground"
      >
        <DropdownMenuItem
          onClick={() => clickTheme('light')}
          aria-label="Set theme to light"
        >
          <SunIcon className="w-4" />

          <span>Light mode</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => clickTheme('dark')}
          aria-label="Set theme to dark"
        >
          <MoonIcon className="w-3.5" />

          <span>Dark mode</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => clickTheme('automatic')}
          aria-label="Set theme to system"
        >
          <ComputerIcon className="w-4 -scale-x-100" />

          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
