import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function UploadIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  accentStroke = 'stroke-theme',
  fill,
  className,
  strokeWidth = 1.5,
  iconMode,
}: IIconProps) {
  if (iconMode === 'colorful') {
    stroke = 'stroke-theme/75'
    fill = 'fill-white'
  }

  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 512 512"
    //   className={cn(ICON_CLS, w, fill, className)}
    // >
    //   <path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
    // </svg>

    // <HardDriveUpload
    //   className={cn(ICON_CLS, stroke, fill, w, className)}
    //   stroke=""
    //   strokeWidth={strokeWidth}
    // />

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(ICON_CLS, stroke, fill, w, className)}
      strokeWidth={strokeWidth}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" fill="white" />
      <path d="m9 10 3-3 3 3" className={accentStroke} />
      <path d="M12 13V7" className={accentStroke} />

      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  )
}
