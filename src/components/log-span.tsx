import { ComponentProps } from 'react'

export function LogSpan({
  base = 2,
  minus = false,
  fontSize = 14,
  children = 'x',
}: ComponentProps<'span'> & {
  fontSize?: number
  base?: string | number
  minus?: boolean
}) {
  return (
    <span className="italic" style={{ fontFamily: 'serif', fontSize }}>
      {minus ? '-' : ''}log
      <sub style={{ fontSize: fontSize * 0.75 }}>{base}</sub>({children})
    </span>
  )
}
