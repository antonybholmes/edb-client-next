import { type ComponentProps } from 'react'

/**
 * Svg component with useful defaults set and a view box to match the width and height
 * @param param0
 * @returns
 */
export function BaseSvg({
  width,
  height,
  scale = 1,
  style,
  ...props
}: ComponentProps<'svg'> & { scale?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      width={typeof width === 'number' ? width * scale : width}
      height={typeof height === 'number' ? height * scale : height}
      style={{ ...style, fontFamily: 'Arial, Helvetica, sans-serif' }}
      fontFamily="Arial, Helvetica, sans-serif"
      {...props}
    />
  )
}
