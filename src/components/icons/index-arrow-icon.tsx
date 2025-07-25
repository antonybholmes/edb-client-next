import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

const Y2 = 12
const Y1 = Y2 - 6
const Y3 = Y2 + 6

export function IndexArrowIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-white',
  strokeWidth = 2,
  className,
}: IIconProps) {
  //const lineRef = useRef(null)
  //const arrowRef = useRef(null)

  // useEffect(() => {
  //   gsap
  //     .timeline()
  //     .to(
  //       arrowRef.current,
  //       {
  //         x: selected ? "2px" : 0,
  //         duration: DURATION,
  //       },
  //       0
  //     )
  //     .to(
  //       lineRef.current,
  //       {
  //         scaleX: selected ? 1 : 0,
  //         opacity: selected ? 1 : 0,
  //         duration: DURATION,
  //       },
  //       0
  //     )
  // }, [selected])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 24 24`}
      className={cn(ICON_CLS, w, stroke, className)}
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }}
      strokeWidth={strokeWidth}
    >
      <line
        x1={7}
        y1={Y2}
        x2={18.5}
        y2={Y2}
        className="trans-opacity opacity-0 group-hover:opacity-100"
      />
      <path
        d={`M 12,${Y1} L 18,${Y2} L 12,${Y3}`}
        className="trans-transform group-hover:translate-x-[3px]"
      />
    </svg>
  )
}
