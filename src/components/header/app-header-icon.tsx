'use client'

import { config } from '@/config'

import { useAppInfo } from '@/components/edb/edb-settings'
import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../icons/app-icon'
import { HomeIcon } from '../icons/home-icon'
import { ButtonLink } from '../link/button-link'

const TIMELINE_DURATION = 0.4
const TIMELINE_EASE = 'power1.out'

export function AppHeaderIcon() {
  const { appInfo } = useAppInfo()
  const { reducedMotion } = useReducedMotion()

  const [hover, setHover] = useState(false)
  const iconRef = useRef<HTMLSpanElement>(null)
  const homeRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline>(null)

  useEffect(() => {
    if (!appInfo || reducedMotion || !iconRef.current || !homeRef.current) {
      return
    }

    const timeline = gsap
      .timeline({ paused: true })
      .to(
        iconRef.current,
        {
          opacity: 0,
          duration: TIMELINE_DURATION,
          ease: TIMELINE_EASE,
        },
        0
      )
      .to(
        iconRef.current,
        {
          y: '25%',
          duration: TIMELINE_DURATION,
          ease: TIMELINE_EASE,
        },
        '<0.1'
      )
      .to(
        homeRef.current,
        {
          y: '50%',
          duration: TIMELINE_DURATION,
          ease: TIMELINE_EASE,
        },
        0
      )
      .to(
        homeRef.current,
        {
          opacity: 1,
          duration: TIMELINE_DURATION,
          ease: TIMELINE_EASE,
        },
        '<0.1'
      )

    timelineRef.current = timeline
    return () => {
      timeline.kill()
      timelineRef.current = null
    }
  }, [appInfo, reducedMotion])

  useEffect(() => {
    if (hover) {
      timelineRef.current?.play()
    } else {
      timelineRef.current?.reverse()
    }
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
        className="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <AppIcon appInfo={appInfo} size={2.2} borderSize={0} />
      </span>

      {!reducedMotion && (
        <span
          ref={homeRef}
          className="z-0 opacity-0 absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
