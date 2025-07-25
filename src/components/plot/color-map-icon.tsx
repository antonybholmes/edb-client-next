import { type IDivProps } from '@interfaces/div-props'
import { BASE_ICON_CLS } from '@interfaces/icon-props'
import { ColorMap } from '@lib/color/colormap'
import { range } from '@lib/math/range'
import { cn } from '@lib/shadcn-utils'

interface IProps extends IDivProps {
  aspect?: string
  cmap: ColorMap
  steps?: number
}

export function ColorMapIcon({
  cmap,
  steps = 9,
  aspect = 'aspect-3/2',
  style,
  className,
}: IProps) {
  const colorSteps = steps - 1

  //const offset = 1 / steps

  return (
    <svg
      viewBox={`0 0 ${steps} ${steps}`}
      className={cn(BASE_ICON_CLS, aspect, className)}
      style={style}
      preserveAspectRatio="xMidYMid slice"
    >
      <g>
        {range(steps).map(step => {
          //colorStart += colorStep

          return (
            <rect
              key={step}
              x={step}
              height={steps}
              width={2}
              fill={cmap.getHexColor(step / colorSteps)}
              stroke="none"
            />
          )
        })}
      </g>
    </svg>
  )
}
