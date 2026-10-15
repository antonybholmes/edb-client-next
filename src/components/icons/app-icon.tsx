'use client'

import { useReducedMotion } from '@/hooks/reduced-motion'
import { useUpdateEffect } from '@/hooks/update-effect'
import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { cn } from '@/lib/shadcn-utils'
import { capitalCase } from '@/lib/text/capital-case'
import type { IAppHeaderLink } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import gsap from 'gsap'
import { CSSProperties, useMemo, useRef, useState } from 'react'
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
  'origin-center top-1/2 left-1/2 -translate-1/2 '
)

export function AppTile({
  module,
  size = 4,
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
      <AppIcon appInfo={module} size={size} animate={true} />

      <span className="text-xs text-center">{module.name}</span>
    </BaseLink>
  )
}

// export function AnimatedAppIcon({
//   appInfo,
//   size = 2,
// }: IDivProps & {
//   size?: number
//   appInfo: IAppInfo | IAppHeaderLink
// }) {
//   const ref = useRef<HTMLSpanElement>(null)

//   const [hover, setHover] = useState(false)

//   useUpdateEffect(() => {
//     gsap.to(ref.current, {
//       opacity: hover ? 0.2 : 0.1,
//       scale: hover ? 1.2 : 1,
//       //borderRadius: hover ? '2rem' : '1.5rem',
//       duration: 0.8,
//       ease: 'back.out',
//     })
//   }, [hover])

//   return (
//     <AppIcon
//       setHover={setHover}
//       appInfo={appInfo}
//       size={size}
//       animate={true}
//       className="relative w-full aspect-square"
//     >
//       <span
//         ref={ref}
//         className={cn(APP_BG_CLS, 'z-0 opacity-10')}
//         style={{
//           width: `${size + 1.2}rem`,
//           height: `${size + 1.2}rem`,
//           backgroundColor: appInfo.color,
//         }}
//       />
//     </AppIcon>
//   )
// }

export function AppIcon({
  appInfo,
  size = 3,
  borderSize = 1.3,
  setHover,
  animate = false,
  className,
  children,
  ...props
}: IDivProps & {
  size?: number
  borderSize?: number
  appInfo: IAppInfo | IAppHeaderLink
  setHover?: (hover: boolean) => void
  animate?: boolean
}) {
  const [hover, _setHover] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const bgRef = useRef<HTMLSpanElement>(null)
  const { reducedMotion } = useReducedMotion()

  useUpdateEffect(() => {
    if (!animate || reducedMotion) {
      return
    }

    gsap
      .timeline()

      .to(
        bgRef.current,
        {
          opacity: hover ? 0.2 : 0.1,
          //scale: hover ? 1.2 : 1,
          //borderRadius: hover ? '2rem' : '1.5rem',
          duration: 0.8,
          ease: 'back.out',
        },
        0
      )
      .to(
        ref.current,
        {
          opacity: hover ? 1 : 0.7,
          scale: hover ? borderSize : 1,
          //borderRadius: hover ? '2rem' : '1.5rem',
          duration: 0.5,
          ease: 'back.out',
        },
        0
      )
  }, [hover, animate])

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

  const innerSize = borderSize !== 0 ? size / borderSize : size

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
        ref={bgRef}
        className={cn(APP_BG_CLS, 'z-0 opacity-10')}
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          backgroundColor: appInfo.color,
        }}
      />

      <span
        //ref={ref}
        className={cn(APP_BG_CLS, 'app-icon opacity-70 z-10')}

        style={
          {
            width: `${innerSize}rem`,
            height: `${innerSize}rem`,
            '--base-color': appInfo.color ?? 'lightslategray',
          } as CSSProperties
        }
      ></span>

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
