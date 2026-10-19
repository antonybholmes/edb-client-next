import { ComponentProps } from 'react'

export function LogSpan({
  base = 2,
  minus = false,
  children = 'x',
}: ComponentProps<'span'> & {
  base?: string | number
  minus?: boolean
}) {
  return (
    <span className="italic" style={{ fontFamily: 'serif' }}>
      {minus ? '-' : ''}log<sub>{base}</sub>({children})
    </span>
  )
}
