'use client'

import { ClientLayout } from '@/app/client-layout'
import { CenterLayout } from '@/layouts/center-layout'

export function TestPage({ title = 'Test' }: { title?: string }) {
  return (
    <CenterLayout signinRequired={false} title={title}>
      <nav className="tabs-nav">
        <a href="#" className="tab-item">
          Home
        </a>
        <a href="#" className="tab-item">
          Services
        </a>
        <a href="#" className="tab-item">
          Portfolio
        </a>
        <a href="#" className="tab-item">
          Contact Us
        </a>
      </nav>
    </CenterLayout>
  )
}

export function TestQueryPage({ title = 'Index' }: { title?: string }) {
  return (
    <ClientLayout>
      <TestPage title={title} />
    </ClientLayout>
  )
}
