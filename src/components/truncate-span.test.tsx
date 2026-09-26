import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TruncateSpan } from './truncate-span'

describe('TruncateSpan', () => {
  it('keeps the text shrinkable and uses a positioned inner span for reliable ellipsis truncation', () => {
    const html = renderToStaticMarkup(
      <TruncateSpan className="grow h-8">
        A very long label that should be truncated
      </TruncateSpan>
    )

    expect(html).toContain('min-w-0')
    expect(html).toContain('w-full')
    expect(html).toContain('max-w-full')
    expect(html).toContain('overflow-hidden')
    expect(html).toContain('whitespace-nowrap')
    expect(html).toContain('text-ellipsis')
    expect(html).not.toContain('h-')
    expect(html).not.toContain('absolute')
  })
})
