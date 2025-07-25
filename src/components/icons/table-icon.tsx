import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function TableIcon({
  w = 'w-4.5 h-4.5',
  stroke = 'stroke-foreground/75',
  fill = 'fill-none',
  className,
  strokeWidth = 1,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(w, stroke, fill, className)}
    //   style={{
    //     strokeLinecap: 'round',
    //     strokeLinejoin: 'round',
    //     strokeWidth: 2,
    //     ...style,
    //   }}
    //   {...props}
    // >
    //   <path d="M3 9H21M3 15H21M9 9L9 20M15 9L15 20M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z" />
    // </svg>

    //

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, stroke, className)}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        className={fill}
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        ry="4"
        stroke="none"
      />
      <path
        d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"
        fill="none"
      />
    </svg>
  )
}
