import { REGEX_IS_LETTER } from '@/lib/text/text'
import { ComponentProps } from 'react'

export function LogSpan({
  base = 2,
  minus = false,
  fontSize = 14,
  className,
  children = 'x',
}: ComponentProps<'span'> & {
  className?: string
} & {
  fontSize?: number
  base?: string | number
  minus?: boolean
}) {
  const chars = String(children).split(/([+\-*/ ])/)

  const formattedChildren = chars.map((c, i) => {
    c = c.trim()
    return REGEX_IS_LETTER.test(c) ? (
      <i key={i}>{c}</i>
    ) : (
      <span key={i}>{c}</span>
    )
  })

  return (
    <span style={{ fontFamily: 'serif', fontSize }} className={className}>
      {minus ? '-' : ''}log
      <sub style={{ fontSize: fontSize * 0.75 }}>{base}</sub>(
      {formattedChildren})
    </span>
  )
}
