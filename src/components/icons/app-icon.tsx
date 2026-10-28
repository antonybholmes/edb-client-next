'use client'

import { useReducedMotion } from '@/hooks/reduced-motion'
import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { linspace } from '@/lib/math/linspace'
import { cn } from '@/lib/shadcn-utils'
import { capitalCase } from '@/lib/text/capital-case'
import type { IAppHeaderLink } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import gsap from 'gsap'
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { CenterCol } from '../layout/center-col'
import { CenterRow } from '../layout/center-row'
import { BaseLink } from '../link/base-link'
import { NoiseFilterIcon } from './noise-filter'

export const APP_ICON_CLS = `relative rounded-full aspect-square shrink-0 grow-0`

const APP_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-col shrink-0 w-full h-full justify-center items-center grow p-2 gap-y-2'
)

const APP_BG_CLS = cn(
  'pointer-events-none absolute aspect-square shrink-0 grow-0',
  'origin-center top-1/2 left-1/2 -translate-1/2 inline-block'
)

const DURATION = 0.4
const EASE = 'back2.out'

export function AppTile({
  module,
  size = 3.8,
}: {
  module: IAppHeaderLink
  size?: number
}) {
  const [hover, setHover] = useState(false)

  return (
    <BaseLink
      aria-label={module.name}
      href={module.slug}

      className={APP_CLS}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AppIcon appInfo={module} size={size} animate={true} hover={hover} />

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
  borderSize = 1.2,
  setHover,
  hover,
  animate = false,
  className,
  children,
  ...props
}: IDivProps & {
  size?: number
  borderSize?: number
  appInfo: IAppInfo | IAppHeaderLink
  setHover?: (hover: boolean) => void
  hover?: boolean
  animate?: boolean
}) {
  const [_hover, _setHover] = useState(false)
  const isHovered = hover ?? _hover
  const innerSize = borderSize !== 0 ? size / borderSize : size

  const ref = useRef<HTMLSpanElement>(null)
  const noiseRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const { reducedMotion } = useReducedMotion()

  useEffect(() => {
    if (!animate || reducedMotion || !ref.current || !noiseRef.current) {
      return
    }

    const timeline = gsap.timeline({ paused: true })
    timeline
      .to(ref.current, {
        scale: borderSize,
        duration: DURATION,
        ease: EASE,
      })
      .to(
        noiseRef.current,
        {
          scale: borderSize,
          duration: DURATION,
          ease: EASE,
        },
        0
      )

    timelineRef.current = timeline

    return () => {
      timeline.kill()
      timelineRef.current = null
    }
  }, [animate, borderSize, reducedMotion])

  useEffect(() => {
    if (isHovered) {
      timelineRef.current?.play()
    } else {
      timelineRef.current?.reverse()
    }
  }, [isHovered, animate, borderSize, reducedMotion])

  const abbr = useMemo(() => {
    if (appInfo.abbr) {
      return capitalCase(appInfo.abbr)
    } else {
      const words = appInfo.name.split(' ')
      return `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`
    }
  }, [appInfo])

  // const bgColor = useMemo(() => {
  //   return Array.isArray(appInfo.color) ? appInfo.color[0] : appInfo.color
  // }, [appInfo.color])

  const bgImage = useMemo(() => {
    if (!Array.isArray(appInfo.color)) {
      return `linear-gradient(135deg, ${appInfo.color} 0%, color-mix(in srgb, ${appInfo.color}, transparent 60%) 100%)`
    }

    const stops = linspace(0, 100, appInfo.color.length)

    const colorStops = appInfo.color.map(
      (color, index) => `${color} ${stops[index]}%`
    )

    return `linear-gradient(135deg, ${colorStops.join(', ')})`
  }, [appInfo.color])

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
      className={cn('relative w-full aspect-square shrink-0 grow-0', className)}

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
      {/* <span
        ref={bgRef}
        className={cn(APP_BG_CLS, 'z-0 opacity-10')}
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          backgroundColor: bgColor,
        }}
      /> */}

      <span
        ref={ref}
        className={cn(APP_BG_CLS, 'z-10')}

        style={
          {
            width: `${innerSize}rem`,
            height: `${innerSize}rem`,
            //'--base-color': appInfo.color ?? 'lightslategray',
            borderRadius: '45%',
            //cornerShape: 'squircle',
            backgroundImage: bgImage,
          } as CSSProperties
        }
      />

      <NoiseFilterIcon
        ref={noiseRef}
        className="absolute w-full h-full z-20 rounded-full opacity-15"
        style={{
          width: `${innerSize}rem`,
          height: `${innerSize}rem`,
        }}
      />

      <CenterRow
        className="relative z-30"
        //style={{ fontSize: `${Math.max(0.8, size * 0.3)}rem` }}
      >
        <span className="font-bold text-white/90">
          {abbr[0]!.toUpperCase()}
        </span>
        <span className="font-light text-white/90">{abbr.slice(1)}</span>
      </CenterRow>

      {children}
    </CenterCol>
  )
}
