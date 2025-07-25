import { useState } from 'react'
import { AppIcon } from './app-icon'
import { HomeIcon } from './home-icon'

export function FavIcon() {
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-header h-header aspect-square justify-center group relative"
    >
      <div
        data-hover={hover}
        className="pointer-events-none data-[hover=false]:opacity-0 data-[hover=true]:opacity-100 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition-opacity duration-500 ease-in-out"
      >
        <HomeIcon
          data-hover={hover}
          stroke="stroke-theme dark:stroke-foreground stroke-2"
        />
      </div>

      <div
        data-hover={hover}
        className="pointer-events-none data-[hover=false]:opacity-100 data-[hover=true]:opacity-0 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition-opacity duration-500 ease-in-out"
      >
        <AppIcon />
      </div>
    </div>
  )
}
