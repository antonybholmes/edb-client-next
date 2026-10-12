'use client'

import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { addAlphaToHex } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import { capitalCase } from '@/lib/text/capital-case'
import type { IAppHeaderLink } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import gsap from 'gsap'
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { CenterCol } from '../layout/center-col'
import { CenterRow } from '../layout/center-row'
import { BaseLink } from '../link/base-link'

export const APP_ICON_CLS = `relative rounded-full aspect-square shrink-0 grow-0`

const APP_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-col shrink-0 w-full h-full justify-center items-center grow p-2 gap-y-4'
)

const APP_BG_CLS = cn(
  'pointer-events-none absolute rounded-full aspect-square shrink-0 grow-0',
  'origin-center top-1/2 left-1/2 -translate-1/2'
)

export function AppTile({
  module,
  size = 3,
}: {
  module: IAppHeaderLink
  size?: number
}) {
  return (
    <BaseLink
      aria-label={module.name}
      href={module.slug}

      className={APP_CLS}
    >
      <AppAnimatedIcon appInfo={module} size={size} />

      <span className="text-xs text-center">{module.name}</span>
    </BaseLink>
  )
}

export function AppAnimatedIcon({
  appInfo,
  size = 2,
}: IDivProps & {
  size?: number
  appInfo: IAppInfo | IAppHeaderLink
}) {
  const ref = useRef<HTMLSpanElement>(null)

  const [hover, setHover] = useState(false)
  useEffect(() => {
    gsap.to(ref.current, {
      backgroundColor: appInfo.color,
      opacity: hover ? 0.2 : 0.1,
      scale: hover ? 1.2 : 1,
      //borderRadius: hover ? '2rem' : '1.5rem',
      duration: 0.8,
      ease: 'back.out',
    })
  }, [hover])

  return (
    <AppIcon
      setHover={setHover}
      appInfo={appInfo}
      size={size}
      className="relative w-full aspect-square"
    >
      <span
        ref={ref}
        className={cn(APP_BG_CLS, 'z-0')}
        style={{ width: `${size + 1.2}rem`, height: `${size + 1.2}rem` }}
      />
    </AppIcon>
  )
}

export function AppIcon({
  appInfo,
  size = 2,
  setHover,
  className,
  children,
  ...props
}: IDivProps & {
  size?: number
  appInfo: IAppInfo | IAppHeaderLink
  setHover?: (hover: boolean) => void
}) {
  const [hover, _setHover] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    gsap.to(ref.current, {
      backgroundColor: addAlphaToHex(
        appInfo.color ?? '#c0c0c0',
        hover ? 0.2 : 0.1
      ),
      opacity: hover ? 1 : 0.8,
      scale: hover ? 1.1 : 1,
      //borderRadius: hover ? '2rem' : '1.5rem',
      duration: 0.5,
      ease: 'power1.out',
    })
  }, [hover])

  const abbr = useMemo(() => {
    if (appInfo.abbr) {
      return capitalCase(appInfo.abbr)
    } else {
      const words = appInfo.name.split(' ')
      return `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`
    }
  }, [appInfo])

  function onHover(hover: boolean) {
    _setHover(hover)
    setHover?.(hover)
  }

  return (
    <CenterCol
      {...props}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
      }}
      className={cn('relative w-full aspect-square', className)}

      onPointerEnter={() => {
        onHover(true)
      }}
      onPointerLeave={() => {
        onHover(false)
      }}
      onFocus={() => {
        onHover(true)
      }}
      onBlur={() => {
        onHover(false)
      }}
    >
      <span
        ref={ref}
        className={cn(APP_BG_CLS, 'app-icon z-10')}

        style={
          {
            width: `${size}rem`,
            height: `${size}rem`,
            '--base-color': appInfo.color ?? 'lightslategray',
          } as CSSProperties
        }
      />

      <CenterRow className="relative z-20">
        <span className="font-light text-white/90">
          {abbr[0]!.toUpperCase()}
        </span>
        <span className="font-semibold text-white/90">{abbr.slice(1)}</span>
      </CenterRow>

      {children}
    </CenterCol>
  )
}
