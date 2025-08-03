import { HCenterCol } from '@/components/layout/h-center-col'
import { ReactNode } from 'react'

export default function HelpLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <HCenterCol id="help-layout" className="bg-background grow">
      {children}
    </HCenterCol>
  )
}
