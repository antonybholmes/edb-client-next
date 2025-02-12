import { APP_NAME } from '@/consts'
import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { useState } from 'react'
import { VCenterRow } from '../layout/v-center-row'
import { HomeIcon } from './home-icon'

export function FavIcon({ w = 'h-6 w-6', className }: IIconProps) {
  const [hover, setHover] = useState(false)

  return (
    <VCenterRow
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${APP_NAME} home`}
      className="w-11 h-11 aspect-square justify-center"
    >
      {hover ? (
        <HomeIcon stroke="stroke-theme" className="pointer-events-none" />
      ) : (
        <svg
          version="1.1"
          viewBox="0 0 14.5 14.5"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(ICON_CLS, w, className)}
        >
          <g transform="translate(-33.407 -100.86)" id="g12">
            <g transform="translate(0,5)" id="g10">
              <g transform="rotate(45 35.968 104.08)" id="g8">
                <circle
                  cx="44.375"
                  cy="100.27"
                  r="2.5"
                  id="circle2"
                  fillOpacity="1"
                  className="fill-blue-600 dark:fill-white/90"
                />
                <circle
                  cx="36.986"
                  cy="93.771"
                  r="1.5"
                  className="fill-blue-600 dark:fill-white"
                  fillOpacity="0.8"
                  id="circle4"
                />
                <circle
                  cx="36.876"
                  cy="100.27"
                  r="5"
                  className="fill-blue-600 dark:fill-white"
                  fillOpacity="0.5"
                />
              </g>
            </g>
          </g>
        </svg>
      )}
    </VCenterRow>
  )
}
