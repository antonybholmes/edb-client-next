'use client'

import { config } from '@/config'

import { useAppInfo } from '@/components/edb/edb-settings'
import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../icons/app-icon'
import { HomeIcon } from '../icons/home-icon'
import { ButtonLink } from '../link/button-link'

export function AppHeaderIcon() {
  const { appInfo } = useAppInfo()
  const { reducedMotion } = useReducedMotion()

  const [hover, setHover] = useState(false)
  const iconRef = useRef<HTMLSpanElement>(null)
  const homeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion || !iconRef.current || !homeRef.current) {
      return
    }

    gsap
      .timeline()
      .to(
        iconRef.current,
        {
          opacity: hover ? 0 : 1,
          y: hover ? '50%' : 0,
          duration: 0.3,
          ease: 'power1.out',
        },
        hover ? 0 : '<0.2'
      )
      .to(
        homeRef.current,
        {
          opacity: hover ? 1 : 0,
          y: hover ? '50%' : 0,
          duration: 0.3,
          ease: 'power1.out',
        },
        hover ? '<0.2' : 0
      )
  }, [hover])

  if (!appInfo) {
    return null
  }

  const color = Array.isArray(appInfo.color) ? appInfo.color[0] : appInfo.color

  return (
    <ButtonLink
      href="/"
      title={`${config.name} Home`}
      size="header"
      rounded="none"
      variant="flat"
      aspect="icon"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="relative"
    >
      <span
        ref={iconRef}
        className="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <AppIcon appInfo={appInfo} size={2.2} borderSize={0} />
      </span>

      {!reducedMotion && (
        <span
          ref={homeRef}
          className="z-0 opacity-0 absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <HomeIcon
            stroke=""
            style={{
              fill: color ?? 'lightslategray',
              stroke: color ?? 'lightslategray',
            }}
          />
        </span>
      )}
    </ButtonLink>
  )
}
