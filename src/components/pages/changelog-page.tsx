'use client'

import { HeaderLayout } from '@/layouts/header-layout'
import { ClientLayout } from '@/app/client-layout'
import { MarkdownContent } from '../markdown-content'

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
    <ClientLayout>
      <ChangelogPage contentHtml={contentHtml} />
    </ClientLayout>
  )
}
