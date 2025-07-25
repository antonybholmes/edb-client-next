import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import type { CSSProperties } from 'react'

//const R = 2
//const X1 = 12

//const Y1 = 8

//const Y2 = 16

interface IProps extends IIconProps {
  lineStyle?: CSSProperties
}

export function SmallVerticalGripIcon({
  w = 'h-4.5 w-4.5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
  style,
}: IProps) {
  return (
    // <svg
    //   viewBox="0 0 24 24"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={cn(ICON_CLS, w, fill, className)}
    //   style={{ ...style, strokeLinecap: "round", strokeLinejoin: "round" }}
    //   //shapeRendering={SVG_CRISP_EDGES}
    // >
    //   <circle cx={X1} cy={Y1} r={R} />
    //   {/* <circle cx={X1} cy={YM} r={R} /> */}
    //   <circle cx={X1} cy={Y2} r={R} />

    // </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(ICON_CLS, stroke, w, className)}
      style={style}
    >
      {/* <circle cx="12" cy="12" r="1" /> */}
      <circle cx="12" cy="8" r="1" />
      <circle cx="12" cy="16" r="1" />
    </svg>

    // <EllipsisVertical
    //   className={cn(ICON_CLS, stroke, w, className)}
    //   strokeWidth={strokeWidth}
    //   stroke=""
    //   style={style}
    // />
  )
}
