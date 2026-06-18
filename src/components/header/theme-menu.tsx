import { useState } from 'react'

import { SunIcon } from '@/components/icons/sun-icon'
import { ComputerIcon } from '@/icons/computer'
import { MoonIcon } from '@/icons/moon-icon'
import { Button } from '@/themed/v2/button'

import { useTheme, type Theme } from '@/lib/edb/theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/v2/dropdown-menu'

export function ThemeMenu() {
  const [open, setOpen] = useState(false)

  //const [theme, setTheme] = useState<string>("system")
  const { theme, setTheme } = useTheme()

  // function onClose() {
  //   setOpen(false)
  // }

  function clickTheme(theme: Theme) {
    //updateSettings({ ...settings })
    setTheme(theme)
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
      <DropdownMenuTrigger
        render={
          <Button
            size="icon"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            checked={open}
            className="justify-center fill-foreground"
          >
            {getIcon(theme)}
          </Button>
        }
      />

      <DropdownMenuContent
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
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
