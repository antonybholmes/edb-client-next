import { COLOR_WHITE } from '@/consts'
import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export function HeightIcon({ w = 'w-4', className }: IIconProps) {
  return (
    <svg
      version="1.1"
      viewBox="0 0 19.399 19.521"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, className)}
    >
      <g
        transform="translate(-66.969 -81.521)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="m67.469 84.667 2.6458-2.6458 2.6458 2.6458"
          fill="none"
          stroke="#59f"
        />
        <path d="m70.115 82.021v7.9375" fill="none" stroke="#59f" />
        <g transform="rotate(180 74.083 95.25)" fill="none" stroke="#59f">
          <path d="m75.406 92.604 2.6458-2.6458 2.6458 2.6458" />
          <path d="m78.052 89.958v7.9375" />
        </g>
        <rect
          x="75.406"
          y="82.021"
          width="10.583"
          height="18.521"
          fill={COLOR_WHITE}
          stroke="#000000"
        />
      </g>
    </svg>
  )
}
