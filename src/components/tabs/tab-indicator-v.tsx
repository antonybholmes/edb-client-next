import gsap from 'gsap'
import { useContext, useEffect, useRef } from 'react'
import { TabIndicatorContext } from './tab-indicator-provider'

export function TabIndicatorV({ w = 0.2 }: { w?: number }) {
  const { tabIndicatorPos } = useContext(TabIndicatorContext)

  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!line1Ref.current || !line2Ref.current) {
      return
    }

    gsap.to([line1Ref.current, line2Ref.current], {
      y: tabIndicatorPos.x,
      height: tabIndicatorPos.size,
      duration: 0.3,
      stagger: 0.075,
      //ease: 'power.inOut',
    })
  }, [tabIndicatorPos.x, tabIndicatorPos.size])

  return (
    <>
      <span
        ref={line1Ref}
        className="absolute left-0 z-0 bg-theme"
        // animate={{
        //   y: `${tabIndicatorPos.x}rem`,
        //   height: `${(tabIndicatorPos.size as number) - 0.15}rem`,
        // }}
        style={{ width: `${w}rem` }}
        //initial={false}
        //transition={{ ease: 'easeOut', duration: 0.25 }}
      />
      <span
        ref={line2Ref}
        className="absolute left-0 z-0 bg-theme"
        // animate={{
        //   y: `${(tabIndicatorPos.x as number) + 0.15}rem`,
        //   height: `${(tabIndicatorPos.size as number) - 0.15}rem`,
        // }}
        style={{ width: `${w}rem` }}
        //initial={false}
        //transition={{ ease: 'easeOut', duration: 0.3 }}
      />
    </>
  )
}
