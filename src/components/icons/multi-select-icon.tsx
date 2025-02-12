import { ICON_CLS } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import type { ICheckProps } from './check-icon'

export function MultiSelectIcon({
  w = 'w-4.5',
  checked = false,
  className,
}: ICheckProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, className)}
      viewBox="0 0 24 24"
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <rect
        x="5"
        y="5"
        width="18"
        height="18"
        rx="3"
        stroke="black"
        fill="white"
      />

      <rect
        x="2"
        y="2"
        width="18"
        height="18"
        rx="3"
        stroke="black"
        fill="white"
      />
      {checked && (
        <path
          d="M 6,12 L 10,15 L 15,6"
          stroke="black"
          fill="none"
          strokeWidth="2"
        />
      )}
    </svg>
  )
}
