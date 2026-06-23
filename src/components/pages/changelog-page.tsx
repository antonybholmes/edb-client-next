'use client'

import { HeaderLayout } from '@/layouts/header-layout'
import { CoreProviders } from '@/providers/core-providers'
import { MarkdownContent } from '../markdown-content'
import { HistoryProvider } from './apps/matcalc/history/history-provider/history-provider'

export function ChangelogPage({ contentHtml }: { contentHtml: string }) {
  return (
    <>
      <HeaderLayout title="Change Log">
        <MarkdownContent
          className="changelog p-6"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </HeaderLayout>
    </>
  )
}

export function ChangelogQueryPage({ contentHtml }: { contentHtml: string }) {
  return (
    <CoreProviders>
      <HistoryProvider app="Change Log">
        <ChangelogPage contentHtml={contentHtml} />
      </HistoryProvider>
    </CoreProviders>
  )
}
