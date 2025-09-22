'use client'

import { CenterLayout } from '@/layouts/center-layout'
import { CoreProviders } from '@providers/core-providers'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { DinoIcon } from '../icons/dino-icon'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import { ThemeIndexLink } from '../link/theme-index-link'

export function Error404Page() {
  const ref = useRef<HTMLDivElement>(null)
  const dinoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dinoRef.current!

    // Timeline for jump + squash/stretch (1s total)
    const jumpTl = gsap.timeline({ paused: true, repeat: -1 })
    jumpTl
      .to(el, {
        y: '4rem',
        scaleX: 1,
        scaleY: 0.9,
        duration: 0.5,
        ease: 'power1.out',
      })
      .to(el, {
        y: 0,

        scaleX: 1,
        scaleY: 1,
        duration: 0.5,
        ease: 'power1.in',
      })
      .to(
        el,
        {
          rotation: '+=360',
          duration: 1.5,
          ease: 'power1.out',
          transformOrigin: '50% 50%',
          //paused: true,
          //repeat: 2, // continuous spin while hovered
        },
        '-=0.1'
      )
      .eventCallback('onReverseComplete', () => {
        jumpTl.pause()
      })

    // Spin tween (2s duration)
    // const spinTween = gsap.to(el, {
    //   rotation: '+=360',
    //   duration: 2,
    //   ease: 'linear',
    //   paused: true,
    //   //repeat: -1, // continuous spin while hovered
    // })

    // Hover handlers
    const onMouseEnter = () => {
      jumpTl.restart()
      //spinTween.play()
    }

    const onMouseLeave = () => {
      //jumpTl.pause(0) //.reverse()

      gsap.to(jumpTl, {
        time: 0,
        duration: 1,
        ease: 'power1.inOut',
        onComplete: () => {
          jumpTl.pause()
        },
      })
    }

    ref.current!.addEventListener('mouseenter', onMouseEnter)
    ref.current!.addEventListener('mouseleave', onMouseLeave)

    // Cleanup
    return () => {
      ref.current!.removeEventListener('mouseenter', onMouseEnter)
      ref.current!.removeEventListener('mouseleave', onMouseLeave)
      //spinTween.kill()
      jumpTl.kill()
    }
  }, [])

  return (
    <CenterLayout
      signedRequired={false}
      //className="bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100"
    >
      <div className="gap-y-4 xl:w-1/2 p-4">
        <h1 className="font-bold text-4xl">404</h1>
        <div className="flex flex-col xl:flex-row gap-8 text-foreground/70">
          <BaseCol className="gap-y-2 grow">
            <p>Oops! We couldn&apos;t find the page you&apos;re looking for.</p>
            <p>
              Check the URL or try using the app menu in the top left. In the
              meantime, here&apos;s a scary dinosaur.
            </p>

            <ThemeIndexLink href="/">Home</ThemeIndexLink>
          </BaseCol>
          <VCenterRow ref={ref}>
            <div
              ref={dinoRef}
              title="Look at them jump, they're so happy!"
              className="flex-shrink-0 transform-origin-center cursor-pointer  "
              //onMouseOver={() => setHover(true)}
              //onMouseOut={() => setHover(false)}
            >
              <DinoIcon w={6} stroke="fill-emerald-500" />
            </div>
          </VCenterRow>
        </div>
      </div>
    </CenterLayout>
  )
}

export function Error404QueryPage() {
  return (
    <CoreProviders>
      <Error404Page />
    </CoreProviders>
  )
}
