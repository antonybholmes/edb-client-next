import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { GripVertical } from 'lucide-react'
import type { CSSProperties } from 'react'

//const LINE_CLS = 'h-full rounded-full w-px'
//const LINE_CLS = 'rounded-full w-1 aspect-square shrink-0'
// const R = 4
// const X1 = 4
// const X2 = 16
// const Y1 = 4
// const YM = 20
// const Y2 = 36

interface IProps extends IIconProps {
  lineStyle?: CSSProperties
}

export function VerticalGripIcon({
  w = 'w-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
  ...props
}: IProps) {
  return (
    // <svg
    //   viewBox="0 0 20 40"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={cn(BASE_ICON_CLS, w, className)}
    //   style={{ ...style, strokeLinecap: "round", strokeLinejoin: "round" }}
    //   //shapeRendering={SVG_CRISP_EDGES}
    // >
    //   <circle cx={X1} cy={Y1} r={R} />
    //   <circle cx={X1} cy={YM} r={R} />
    //   <circle cx={X1} cy={Y2} r={R} />

    //   <circle cx={X2} cy={Y1} r={R} />
    //   <circle cx={X2} cy={YM} r={R} />
    //   <circle cx={X2} cy={Y2} r={R} />
    // </svg>
    // <HCenterCol className="gap-y-0.75 shrink-0 opacity-50 hover:opacity-100 trans-all">
    //   <span className={cn(LINE_CLS, className)} style={lineStyle} />

    //   {/* <span className={cn(LINE_CLS, className)} style={lineStyle} /> */}

    //   <span className={cn(LINE_CLS, className)} style={lineStyle} />
    // </HCenterCol>

    <GripVertical
      className={cn(ICON_CLS, stroke, w, className)}
      strokeWidth={strokeWidth}
      stroke=""
      {...props}
    />
  )
}
